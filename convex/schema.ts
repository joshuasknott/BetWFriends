import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

/**
 * BetWFriends data model, ported from the Prisma schema.
 *
 * The Convex Auth `users` table is extended with our app-specific fields
 * (name, avatarColor, balance). The `authTables` spread adds the auth-only
 * tables (authAccounts, authSessions, etc.).
 *
 * Money is stored in pence (£0.01) throughout, matching the original model.
 * Dates are epoch milliseconds (Convex's native numeric time format).
 */
export default defineSchema({
  ...authTables,

  // The auth library owns the `users` table; we extend it with profile fields.
  // `email` and `emailVerificationTime` come from authTables — we add the rest.
  users: defineTable({
    name: v.string(),
    email: v.string(),
    emailVerificationTime: v.number(),
    isAnonymous: v.boolean(),
    // App fields:
    avatarColor: v.string(),
    balance: v.number(), // pence
  }).index("email", ["email"]),

  groups: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    emoji: v.string(),
    inviteCode: v.string(),
    createdById: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_invite_code", ["inviteCode"])
    .index("by_created_by", ["createdById"]),

  groupMembers: defineTable({
    userId: v.id("users"),
    groupId: v.id("groups"),
    joinedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_group", ["groupId"])
    .index("by_user_group", ["userId", "groupId"]),

  // A proposition bet within a group. e.g. "Mark will blackout tonight"
  bets: defineTable({
    groupId: v.id("groups"),
    creatorId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    amount: v.number(), // stake per wager in pence
    status: v.string(), // open | closed | settled | cancelled
    outcome: v.optional(v.string()), // matches a BetSide label once settled
    createdAt: v.number(),
    closesAt: v.number(),
    settledAt: v.optional(v.number()),
  })
    .index("by_group", ["groupId"])
    .index("by_creator", ["creatorId"])
    .index("by_status", ["status"])
    .index("by_group_status", ["groupId", "status"]),

  betSides: defineTable({
    betId: v.id("bets"),
    label: v.string(), // e.g. "Yes" / "No"
  }).index("by_bet", ["betId"]),

  wagers: defineTable({
    betId: v.id("bets"),
    sideId: v.id("betSides"),
    userId: v.id("users"),
    amount: v.number(),
    createdAt: v.number(),
  })
    .index("by_bet", ["betId"])
    .index("by_bet_user", ["betId", "userId"])
    .index("by_side", ["sideId"])
    .index("by_user", ["userId"]),

  // Banter / comments on a bet — the social layer.
  comments: defineTable({
    betId: v.id("bets"),
    userId: v.id("users"),
    text: v.string(),
    createdAt: v.number(),
  }).index("by_bet_created", ["betId", "createdAt"]),

  transactions: defineTable({
    userId: v.id("users"),
    type: v.string(), // topup | stake | payout | withdrawal
    amount: v.number(), // pence; positive = credit, negative = debit
    note: v.string(),
    reference: v.optional(v.string()), // stripe payment intent id etc.
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_reference", ["reference"]),
});
