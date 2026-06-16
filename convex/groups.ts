import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, publicUserRef } from "./authHelpers";
import type { Doc } from "./_generated/dataModel";

/**
 * Group functions — ported from the old REST routes under app/api/groups.
 *
 * Convex mutations are atomic, so the leave-group cascade (refund wagers,
 * cancel owned bets, remove membership, maybe delete group) all happens in one
 * mutation with no manual transaction wrapping.
 */

/** Friendly invite code like "BLUE-FOX-42". */
function generateInviteCode(): string {
  const adjectives = ["BLUE", "RED", "GOLD", "WILD", "LUCKY", "BOLD", "EPIC", "FAST", "CALM", "KEEN"];
  const nouns = ["FOX", "BEAR", "WOLF", "HAWK", "LION", "DEER", "GOAT", "TIGER", "ORCA", "KOALA"];
  const a = adjectives[Math.floor(Math.random() * adjectives.length)];
  const n = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `${a}-${n}-${num}`;
}

export const createGroup = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    emoji: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();

    const groupId = await ctx.db.insert("groups", {
      name: args.name.trim(),
      description: args.description?.trim() || undefined,
      emoji: args.emoji,
      color: args.color,
      inviteCode: generateInviteCode(),
      createdById: user._id,
      createdAt: now,
    });

    // Creator is automatically the first member.
    await ctx.db.insert("groupMembers", {
      userId: user._id,
      groupId,
      joinedAt: now,
    });

    return { ok: true as const, groupId };
  },
});

export const joinGroup = mutation({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const code = args.inviteCode.trim().toUpperCase();

    const group = await ctx.db
      .query("groups")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", code))
      .unique();
    if (!group) throw new Error("No group found with that code");

    const existing = await ctx.db
      .query("groupMembers")
      .withIndex("by_user_group", (q) => q.eq("userId", user._id).eq("groupId", group._id))
      .unique();
    if (existing) return { ok: true as const, groupId: group._id, alreadyMember: true };

    await ctx.db.insert("groupMembers", {
      userId: user._id,
      groupId: group._id,
      joinedAt: Date.now(),
    });

    return { ok: true as const, groupId: group._id };
  },
});

export const updateGroup = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    emoji: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");
    if (group.createdById !== user._id)
      throw new Error("Only the group creator can change settings");

    const patch: Record<string, string | undefined> = {};
    if (args.name !== undefined) patch.name = args.name.trim();
    if (args.emoji !== undefined) patch.emoji = args.emoji;
    if (args.color !== undefined) patch.color = args.color;
    if (args.description !== undefined) patch.description = args.description.trim() || undefined;
    if (Object.keys(patch).length === 0) throw new Error("Nothing to update");

    await ctx.db.patch(args.groupId, patch);
    return { ok: true as const };
  },
});

/**
 * Leave a group. Refunds open wagers the user has; cancels open bets they
 * created (refunding everyone on those); removes membership; deletes the
 * group entirely if they were the last member.
 */
export const leaveGroup = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_user_group", (q) => q.eq("userId", user._id).eq("groupId", args.groupId))
      .unique();
    if (!membership) throw new Error("You're not in this group");

    // Refund this user's wagers on open bets in the group.
    const openBets = await ctx.db
      .query("bets")
      .withIndex("by_group_status", (q) => q.eq("groupId", args.groupId).eq("status", "open"))
      .collect();

    for (const bet of openBets) {
      const myWager = await ctx.db
        .query("wagers")
        .withIndex("by_bet_user", (q) => q.eq("betId", bet._id).eq("userId", user._id))
        .unique();
      if (myWager) {
        await refundStake(ctx, user._id, myWager.amount, "Refund: left group");
        await ctx.db.delete(myWager._id);
      }
    }

    // Cancel open bets created by the leaving user, refunding everyone.
    for (const bet of openBets) {
      if (bet.creatorId !== user._id) continue;
      await cancelBetWithRefunds(ctx, bet);
    }

    // Remove the membership.
    await ctx.db.delete(membership._id);

    // If this was the last member, delete the group and its bets.
    const remaining = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();
    if (remaining.length === 0) {
      const groupBets = await ctx.db
        .query("bets")
        .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
        .collect();
      for (const bet of groupBets) {
        await deleteBetCascade(ctx, bet._id);
      }
      await ctx.db.delete(args.groupId);
    }

    return { ok: true as const };
  },
});

// ---- shared helpers (also used by bets.ts) ----

/** Credit a user's balance and record a transaction row. */
export async function creditBalance(
  ctx: any,
  userId: Doc<"users">["_id"],
  amount: number,
  type: string,
  note: string,
  reference?: string,
): Promise<void> {
  const u = await ctx.db.get(userId);
  if (!u) return;
  await ctx.db.patch(userId, { balance: u.balance + amount });
  await ctx.db.insert("transactions", {
    userId,
    type,
    amount,
    note,
    reference,
    createdAt: Date.now(),
  });
}

/** Refund a stake to a user (credits balance + records a stake transaction). */
async function refundStake(
  ctx: any,
  userId: Doc<"users">["_id"],
  amount: number,
  note: string,
): Promise<void> {
  await creditBalance(ctx, userId, amount, "stake", note);
}

/** Cancel an open bet and refund every wager on it. */
export async function cancelBetWithRefunds(
  ctx: any,
  bet: Doc<"bets">,
): Promise<void> {
  const wagers = await ctx.db
    .query("wagers")
    .withIndex("by_bet", (q) => q.eq("betId", bet._id))
    .collect();
  for (const w of wagers) {
    await refundStake(ctx, w.userId, w.amount, `Refund: ${bet.title} (creator left)`);
    await ctx.db.delete(w._id);
  }
  await ctx.db.patch(bet._id, { status: "cancelled", settledAt: Date.now() });
}

/** Delete a bet and all its dependent sides/wagers/comments. */
export async function deleteBetCascade(
  ctx: any,
  betId: Doc<"bets">["_id"],
): Promise<void> {
  const sides = await ctx.db
    .query("betSides")
    .withIndex("by_bet", (q) => q.eq("betId", betId))
    .collect();
  for (const s of sides) await ctx.db.delete(s._id);

  const wagers = await ctx.db
    .query("wagers")
    .withIndex("by_bet", (q) => q.eq("betId", betId))
    .collect();
  for (const w of wagers) await ctx.db.delete(w._id);

  const comments = await ctx.db
    .query("comments")
    .withIndex("by_bet_created", (q) => q.eq("betId", betId))
    .collect();
  for (const c of comments) await ctx.db.delete(c._id);

  await ctx.db.delete(betId);
}

// ---- queries ----

/** A single group with members, bets, and creator — for the group page. */
export const getGroup = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const group = await ctx.db.get(args.groupId);
    if (!group) return null;

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_user_group", (q) => q.eq("userId", user._id).eq("groupId", args.groupId))
      .unique();
    if (!membership) return null;

    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();
    const membersWithUsers = await Promise.all(
      members.map(async (m) => {
        const u = await ctx.db.get(m.userId);
        return { ...m, user: u ? publicUserRef(u) : null };
      }),
    );

    const bets = await ctx.db
      .query("bets")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();
    const betsDetailed = await Promise.all(
      bets
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(async (bet) => {
          const [sides, wagers, creator] = await Promise.all([
            ctx.db.query("betSides").withIndex("by_bet", (q) => q.eq("betId", bet._id)).collect(),
            ctx.db
              .query("wagers")
              .withIndex("by_bet", (q) => q.eq("betId", bet._id))
              .collect()
              .then((ws) =>
                Promise.all(
                  ws.map(async (w) => ({
                    ...w,
                    user: (await ctx.db.get(w.userId)) ?? null,
                  })),
                ),
              ),
            ctx.db.get(bet.creatorId),
          ]);
          return {
            id: bet._id,
            groupId: bet.groupId,
            creatorId: bet.creatorId,
            title: bet.title,
            description: bet.description,
            amount: bet.amount,
            status: bet.status,
            outcome: bet.outcome,
            createdAt: bet.createdAt,
            closesAt: bet.closesAt,
            settledAt: bet.settledAt,
            sides: sides.map((s) => ({ id: s._id, label: s.label })),
            wagers: wagers.map((w) => ({
              id: w._id,
              sideId: w.sideId,
              userId: w.userId,
              amount: w.amount,
              createdAt: w.createdAt,
              user: w.user ? publicUserRef(w.user) : null,
            })),
            creator: creator ? publicUserRef(creator) : null,
          };
        }),
    );

    return {
      id: group._id,
      name: group.name,
      description: group.description,
      color: group.color,
      emoji: group.emoji,
      inviteCode: group.inviteCode,
      createdById: group.createdById,
      createdAt: group.createdAt,
      members: membersWithUsers,
      bets: betsDetailed,
    };
  },
});

/** All groups the current user is a member of, with members + open bets. */
export const listMyGroups = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const groups = await Promise.all(
      memberships.map(async (m) => {
        const group = await ctx.db.get(m.groupId);
        if (!group) return null;
        const members = await ctx.db
          .query("groupMembers")
          .withIndex("by_group", (q) => q.eq("groupId", group._id))
          .collect();
        const membersWithUsers = await Promise.all(
          members.map(async (mm) => {
            const u = await ctx.db.get(mm.userId);
            return { ...mm, user: u ? publicUserRef(u) : null };
          }),
        );
        const bets = await ctx.db
          .query("bets")
          .withIndex("by_group", (q) => q.eq("groupId", group._id))
          .collect();
        return {
          id: group._id,
          name: group.name,
          description: group.description,
          color: group.color,
          emoji: group.emoji,
          inviteCode: group.inviteCode,
          createdById: group.createdById,
          createdAt: group.createdAt,
          members: membersWithUsers,
          bets: bets
            .filter((b) => b.status === "open" || b.status === "closed")
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((b) => ({
              id: b._id,
              title: b.title,
              amount: b.amount,
              status: b.status,
              closesAt: b.closesAt,
              createdAt: b.createdAt,
            })),
        };
      }),
    );

    return groups.filter((g): g is NonNullable<typeof g> => g !== null);
  },
});
