import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, publicUserRef } from "./authHelpers";

/** Banter / comments on a bet — the social layer. */

export const list = query({
  args: { betId: v.id("bets") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const bet = await ctx.db.get(args.betId);
    if (!bet) return null;

    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", bet.groupId))
      .collect();
    if (!members.some((m) => m.userId === user._id)) return null;

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_bet_created", (q) => q.eq("betId", args.betId))
      .collect();
    const withUsers = await Promise.all(
      comments.map(async (c) => ({
        id: c._id,
        text: c.text,
        createdAt: c.createdAt,
        userId: c.userId,
        user: publicUserRef((await ctx.db.get(c.userId))!),
      })),
    );
    return withUsers;
  },
});

export const add = mutation({
  args: { betId: v.id("bets"), text: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const text = args.text.trim();
    if (!text) throw new Error("Say something!");
    if (text.length > 500) throw new Error("Keep it under 500 characters");

    const bet = await ctx.db.get(args.betId);
    if (!bet) throw new Error("Bet not found");

    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", bet.groupId))
      .collect();
    if (!members.some((m) => m.userId === user._id))
      throw new Error("Join the group to comment");

    const id = await ctx.db.insert("comments", {
      betId: args.betId,
      userId: user._id,
      text,
      createdAt: Date.now(),
    });
    return { ok: true as const, id, user: publicUserRef(user), createdAt: Date.now() };
  },
});

export const remove = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.userId !== user._id)
      throw new Error("You can only delete your own comments");
    await ctx.db.delete(args.commentId);
    return { ok: true as const };
  },
});
