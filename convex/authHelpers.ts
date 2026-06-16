import type { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Authorization helpers for Convex functions — the equivalent of the old
 * `lib/session.ts` `requireUser()` / `getCurrentUser()`.
 *
 * Convex Auth uses `getAuthUserId(ctx)` to read the signed-in user from the
 * request's session; there are no cookies/JWTs to manage here.
 *
 * Queries and mutations have a `ctx.db`; actions do not, so they should use
 * `requireAuth` (id only) and `ctx.runQuery` if they need the full user doc.
 */

/** Get the authenticated user id (works in queries, mutations, and actions). */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx | ActionCtx,
): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) throw new Error("Not authenticated");
  return userId;
}

/** Queries/mutations: the current user, or null if not signed in. */
export async function getCurrentUser(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  return ctx.db.get(userId);
}

/** Queries/mutations: throws if not authenticated, returns the user otherwise. */
export async function requireUser(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users">> {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("Not authenticated");
  return user;
}

/**
 * Assert that the given user is a member of the group. Throws otherwise —
 * mirrors the old "Join the group to bet on this" checks.
 */
export async function requireGroupMember(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  groupId: Id<"groups">,
): Promise<Doc<"groupMembers">> {
  const membership = await ctx.db
    .query("groupMembers")
    .withIndex("by_user_group", (q) => q.eq("userId", userId).eq("groupId", groupId))
    .unique();
  if (!membership) throw new Error("You're not a member of that group");
  return membership;
}

/** Public-safe user object (no secrets — balance etc. are safe to expose). */
export function publicUser(user: Doc<"users">) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatarColor: user.avatarColor,
    balance: user.balance,
    createdAt: user._creationTime,
  };
}

/** Minimal public user shape (for avatar stacks, leaderboards, etc.). */
export function publicUserRef(user: Doc<"users">) {
  return {
    id: user._id,
    name: user.name,
    avatarColor: user.avatarColor,
  };
}
