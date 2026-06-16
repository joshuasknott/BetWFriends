import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, publicUserRef } from "./authHelpers";
import { computePayouts } from "../lib/betting";
import { creditBalance, cancelBetWithRefunds } from "./groups";
import type { Id } from "./_generated/dataModel";

/**
 * Bet functions — ported from app/api/bets.
 *
 * Each mutation is atomic, so the balance/wager/transaction writes that the
 * old Prisma `$transaction` blocks guarded now happen by default.
 */

export const createBet = mutation({
  args: {
    groupId: v.id("groups"),
    title: v.string(),
    description: v.optional(v.string()),
    amount: v.number(),
    durationHours: v.number(),
    yesLabel: v.string(),
    noLabel: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_user_group", (q) => q.eq("userId", user._id).eq("groupId", args.groupId))
      .unique();
    if (!membership) throw new Error("You're not a member of that group");

    const now = Date.now();
    const closesAt = now + args.durationHours * 3_600_000;

    const betId = await ctx.db.insert("bets", {
      groupId: args.groupId,
      creatorId: user._id,
      title: args.title.trim(),
      description: args.description?.trim() || undefined,
      amount: args.amount,
      status: "open",
      createdAt: now,
      closesAt,
    });

    await ctx.db.insert("betSides", { betId, label: args.yesLabel });
    await ctx.db.insert("betSides", { betId, label: args.noLabel });

    return { ok: true as const, betId };
  },
});

/** Place or update a wager. Switching sides nets the cost difference. */
export const placeWager = mutation({
  args: { betId: v.id("bets"), sideId: v.id("betSides") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const bet = await ctx.db.get(args.betId);
    if (!bet) throw new Error("Bet not found");

    if (bet.status !== "open") throw new Error("This bet isn't open for wagers");
    if (bet.closesAt <= Date.now()) {
      await ctx.db.patch(args.betId, { status: "closed" });
      throw new Error("Betting has closed on this one");
    }

    // Membership check.
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_user_group", (q) => q.eq("userId", user._id).eq("groupId", bet.groupId))
      .unique();
    if (!membership) throw new Error("Join the group to bet on this");

    const side = await ctx.db.get(args.sideId);
    if (!side || side.betId !== args.betId) throw new Error("Invalid side");

    const existingWager = await ctx.db
      .query("wagers")
      .withIndex("by_bet_user", (q) => q.eq("betId", args.betId).eq("userId", user._id))
      .unique();
    const previousAmount = existingWager?.amount ?? 0;
    const effectiveCost = bet.amount - previousAmount;

    const fresh = await ctx.db.get(user._id);
    if (!fresh) throw new Error("User not found");
    if (effectiveCost > 0 && fresh.balance < effectiveCost)
      throw new Error("Not enough balance — top up your wallet first");

    if (existingWager) {
      await ctx.db.patch(existingWager._id, { sideId: args.sideId, amount: bet.amount });
    } else {
      await ctx.db.insert("wagers", {
        betId: args.betId,
        userId: user._id,
        sideId: args.sideId,
        amount: bet.amount,
        createdAt: Date.now(),
      });
    }

    if (effectiveCost !== 0) {
      await ctx.db.patch(user._id, { balance: fresh.balance - effectiveCost });
      await ctx.db.insert("transactions", {
        userId: user._id,
        type: "stake",
        amount: -effectiveCost,
        note: `Stake: ${bet.title}`,
        createdAt: Date.now(),
      });
    }

    return { ok: true as const, balance: fresh.balance - effectiveCost };
  },
});

/** Remove your wager on an open bet; refunds the stake. */
export const removeWager = mutation({
  args: { betId: v.id("bets") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const bet = await ctx.db.get(args.betId);
    if (!bet) throw new Error("Bet not found");
    if (bet.status !== "open" || bet.closesAt <= Date.now())
      throw new Error("Can't pull out — betting has closed");

    const wager = await ctx.db
      .query("wagers")
      .withIndex("by_bet_user", (q) => q.eq("betId", args.betId).eq("userId", user._id))
      .unique();
    if (!wager) return { ok: true as const };

    await ctx.db.delete(wager._id);
    const fresh = await ctx.db.get(user._id);
    await ctx.db.patch(user._id, { balance: (fresh?.balance ?? 0) + wager.amount });
    await ctx.db.insert("transactions", {
      userId: user._id,
      type: "stake",
      amount: wager.amount,
      note: `Withdrawn stake: ${bet.title}`,
      createdAt: Date.now(),
    });

    return { ok: true as const };
  },
});

/** Resolve a bet: declare the winning side (or void/refund). Creator only. */
export const resolveBet = mutation({
  args: { betId: v.id("bets"), winningSideId: v.union(v.id("betSides"), v.null()) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const bet = await ctx.db.get(args.betId);
    if (!bet) throw new Error("Bet not found");
    if (bet.creatorId !== user._id)
      throw new Error("Only the bet creator can settle this");
    if (bet.status === "settled") throw new Error("Already settled");

    const sides = await ctx.db
      .query("betSides")
      .withIndex("by_bet", (q) => q.eq("betId", args.betId))
      .collect();

    const winningSide = args.winningSideId
      ? sides.find((s) => s._id === args.winningSideId)
      : null;
    if (args.winningSideId && !winningSide) throw new Error("Invalid side");

    const wagers = await ctx.db
      .query("wagers")
      .withIndex("by_bet", (q) => q.eq("betId", args.betId))
      .collect();

    const result = computePayouts(
      wagers.map((w) => ({
        id: w._id,
        betId: w.betId,
        sideId: w.sideId,
        userId: w.userId,
        amount: w.amount,
        createdAt: w.createdAt,
      })),
      winningSide ? winningSide._id : null,
    );

    for (const winner of result.winners) {
      if (winner.amount <= 0) continue;
      await creditBalance(ctx, winner.userId as Id<"users">, winner.amount, "payout", `Winnings: ${bet.title}`);
    }

    await ctx.db.patch(args.betId, {
      status: "settled",
      outcome: winningSide ? winningSide.label : undefined,
      settledAt: Date.now(),
    });

    return { ok: true as const };
  },
});

/** Cancel a bet and refund everyone. Creator only. */
export const cancelBet = mutation({
  args: { betId: v.id("bets") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const bet = await ctx.db.get(args.betId);
    if (!bet) throw new Error("Bet not found");
    if (bet.creatorId !== user._id)
      throw new Error("Only the bet creator can cancel this");
    if (bet.status === "settled" || bet.status === "cancelled")
      throw new Error("Can't cancel this bet");

    await cancelBetWithRefunds(ctx, bet);
    return { ok: true as const };
  },
});

// ---- queries ----

/** Full bet detail — the big join for the bet-detail page. Members only. */
export const getBet = query({
  args: { betId: v.id("bets") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const bet = await ctx.db.get(args.betId);
    if (!bet) return null;

    const group = await ctx.db.get(bet.groupId);
    if (!group) return null;

    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", group._id))
      .collect();
    const isMember = members.some((m) => m.userId === user._id);
    if (!isMember) return null;

    const [sides, wagerDocs, creator] = await Promise.all([
      ctx.db.query("betSides").withIndex("by_bet", (q) => q.eq("betId", bet._id)).collect(),
      ctx.db.query("wagers").withIndex("by_bet", (q) => q.eq("betId", bet._id)).collect(),
      ctx.db.get(bet.creatorId),
    ]);
    // A bet always has a valid creator; if the doc is gone the data is corrupt.
    const creatorDoc = creator ? publicUserRef(creator) : { id: bet.creatorId, name: "Unknown", avatarColor: "#7c3aed" };
    const wagers = (
      await Promise.all(
        wagerDocs.map(async (w) => {
          const u = await ctx.db.get(w.userId);
          if (!u) return null;
          return {
            id: w._id,
            sideId: w.sideId,
            userId: w.userId,
            amount: w.amount,
            createdAt: w.createdAt,
            user: publicUserRef(u),
          };
        }),
      )
    ).filter((w): w is NonNullable<typeof w> => w !== null);

    const myWager = wagers.find((w) => w.userId === user._id) ?? null;

    return {
      bet: {
        id: bet._id,
        title: bet.title,
        description: bet.description ?? null,
        amount: bet.amount,
        status: bet.status,
        outcome: bet.outcome ?? null,
        createdAt: bet.createdAt,
        closesAt: bet.closesAt,
        settledAt: bet.settledAt ?? null,
      },
      group: {
        id: group._id,
        name: group.name,
        emoji: group.emoji,
        color: group.color,
      },
      sides: sides.map((s) => ({ id: s._id, label: s.label })),
      wagers: wagers.sort((a, b) => a.createdAt - b.createdAt),
      creator: creatorDoc,
      myWager,
      myBalance: user.balance,
      isCreator: bet.creatorId === user._id,
    };
  },
});

/** Active (open) bets across the user's groups — for the dashboard hot-bets. */
export const listActiveBets = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const groupIds = memberships.map((m) => m.groupId);

    const bets = await Promise.all(
      groupIds.map(async (groupId) => {
        const open = await ctx.db
          .query("bets")
          .withIndex("by_group_status", (q) => q.eq("groupId", groupId).eq("status", "open"))
          .collect();
        return open;
      }),
    );

    const flat = bets.flat();
    const detailed = await Promise.all(
      flat.map(async (bet) => {
        const [group, wagers] = await Promise.all([
          ctx.db.get(bet.groupId),
          ctx.db.query("wagers").withIndex("by_bet", (q) => q.eq("betId", bet._id)).collect(),
        ]);
        return {
          id: bet._id,
          title: bet.title,
          amount: bet.amount,
          closesAt: bet.closesAt,
          group: group
            ? { id: group._id, name: group.name, emoji: group.emoji, color: group.color }
            : null,
          wagers: { length: wagers.length },
        };
      }),
    );

    return detailed.sort((a, b) => a.closesAt - b.closesAt).slice(0, 5);
  },
});
