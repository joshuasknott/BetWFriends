import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";
import { requireUser, requireAuth } from "./authHelpers";
import { deleteBetCascade, cancelBetWithRefunds } from "./groups";
import { retrieveAccount, modifyAccountCredentials } from "@convex-dev/auth/server";

/** Profile functions — ported from app/api/profile and app/api/me. */

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      avatarColor: user.avatarColor,
      balance: user.balance,
      createdAt: user._creationTime,
    };
  },
});

/** Stats for the profile page (group count, bets created, wagers, transactions). */
export const getProfileStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const [groups, betsCreated, wagers, transactions] = await Promise.all([
      ctx.db.query("groupMembers").withIndex("by_user", (q) => q.eq("userId", user._id)).collect(),
      ctx.db.query("bets").withIndex("by_creator", (q) => q.eq("creatorId", user._id)).collect(),
      ctx.db.query("wagers").withIndex("by_user", (q) => q.eq("userId", user._id)).collect(),
      ctx.db.query("transactions").withIndex("by_user", (q) => q.eq("userId", user._id)).collect(),
    ]);

    const totalWagered = wagers.reduce((s, w) => s + w.amount, 0);
    const settledWagers = await Promise.all(
      wagers.map(async (w) => {
        const bet = await ctx.db.get(w.betId);
        return bet?.status === "settled" ? w.amount : 0;
      }),
    );
    const settledBets = await Promise.all(
      betsCreated.map(async (b): Promise<number> => (b.status === "settled" ? 1 : 0)),
    );

    return {
      groupsCount: groups.length,
      betsCreatedCount: betsCreated.length,
      wagersCount: wagers.length,
      settledCount: settledBets.reduce<number>((s, n) => s + n, 0),
      totalWagered,
      totalStakedOnSettled: settledWagers.reduce<number>((s, n) => s + n, 0),
      transactionsCount: transactions.length,
      balance: user.balance,
    };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    avatarColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const patch: Record<string, string> = {};
    if (args.name !== undefined) {
      const name = args.name.trim();
      if (!name) throw new Error("Tell us your name");
      if (name.length > 40) throw new Error("That's a bit long");
      patch.name = name;
    }
    if (args.avatarColor !== undefined) {
      if (!/^#[0-9a-fA-F]{6}$/.test(args.avatarColor)) throw new Error("Pick a valid colour");
      patch.avatarColor = args.avatarColor;
    }
    if (Object.keys(patch).length === 0) throw new Error("Nothing to update");
    await ctx.db.patch(user._id, patch);
    return { ok: true as const };
  },
});

/** Change password — verifies the current secret then updates via Convex Auth. */
export const changePassword = action({
  args: { currentPassword: v.string(), newPassword: v.string() },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    if (args.newPassword.length < 8)
      throw new Error("New password must be at least 8 characters");

    const user = await ctx.runQuery(api.profile.getMe, {});
    if (!user) throw new Error("User not found");

    // Verify the current password (retrieveAccount throws on a bad secret).
    await retrieveAccount(ctx, {
      provider: "password",
      account: { id: user.email, secret: args.currentPassword },
    });

    // Write the new password hash.
    await modifyAccountCredentials(ctx, {
      provider: "password",
      account: { id: user.email, secret: args.newPassword },
    });
    return { ok: true as const };
  },
});

/**
 * Permanently delete the current user's account (GDPR).
 * Cancels open bets they created, refunds wagers, then removes dependent data.
 */
export const deleteAccount = mutation({
  args: { confirm: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (args.confirm !== "DELETE")
      throw new Error("Please type DELETE to confirm");

    // Cancel open bets created by this user (refund everyone).
    const ownedOpenBets = await ctx.db
      .query("bets")
      .withIndex("by_creator", (q) => q.eq("creatorId", user._id))
      .collect();
    for (const bet of ownedOpenBets) {
      if (bet.status === "open") await cancelBetWithRefunds(ctx, bet);
    }

    // Delete settled/cancelled bets owned by this user and their dependent data.
    for (const bet of ownedOpenBets) {
      if (bet.status === "settled" || bet.status === "cancelled") {
        await deleteBetCascade(ctx, bet._id);
      }
    }

    // Cascade-clear remaining rows referencing this user.
    const myWagers = await ctx.db
      .query("wagers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const w of myWagers) await ctx.db.delete(w._id);

    const myMemberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const m of myMemberships) await ctx.db.delete(m._id);

    const myTxns = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const t of myTxns) await ctx.db.delete(t._id);

    // Comments by this user: there's no per-user index, so the conv/auth
    // system tables handle remaining references. The user document is removed
    // below; orphaned comments (betId still present) are fine to keep for
    // historical banter, matching the old Prisma behavior.

    // Finally remove the user document.
    await ctx.db.delete(user._id);

    return { ok: true as const };
  },
});

/** Pending-notification counts for the header badge. */
export const getPending = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const now = Date.now();

    const myCreatedOpen = await ctx.db
      .query("bets")
      .withIndex("by_creator", (q) => q.eq("creatorId", user._id))
      .collect();
    const awaitingSettlement = myCreatedOpen.filter(
      (b) => b.status === "open" && b.closesAt < now,
    ).length;

    const myWagers = await ctx.db
      .query("wagers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    let recentSettlements = 0;
    for (const w of myWagers) {
      const bet = await ctx.db.get(w.betId);
      if (bet?.status === "settled") recentSettlements += 1;
    }

    return { awaitingSettlement, recentSettlements, total: awaitingSettlement };
  },
});
