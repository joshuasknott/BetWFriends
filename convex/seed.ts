import { v } from "convex/values";
import { mutation, action, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { createAccount } from "@convex-dev/auth/server";
import type { Doc, Id } from "./_generated/dataModel";

/**
 * Seed data — reproduces prisma/seed.ts exactly so the Playwright e2e suite
 * (which asserts £33.00 / £45.00 balances, "Saturday Squad", 6 members, the
 * LUCKY-FOX-42 / BOLD-BEAR-77 invite codes) keeps passing.
 *
 * Runs via `convex run seed:all`. Wipes app tables first (dev only).
 *
 * Note on user creation: the demo users must be able to log in with
 * "password", so each is created via Convex Auth's `createAccount` (which
 * hashes the password with Scrypt). `createAccount` also creates the `users`
 * row, so we pass the profile + balance in the `profile` argument.
 */

const SEED_PASSWORD = "password";
const STARTING_BALANCE = 0; // balances are set per-user below (welcome bonus disabled for seeds)

const SEED_USERS = [
  { name: "Josh Bennett", email: "josh@example.com", avatarColor: "#7c3aed", balance: 4500 },
  { name: "Mark Quinn", email: "mark@example.com", avatarColor: "#db2777", balance: 1800 },
  { name: "Jenny Lee", email: "jenny@example.com", avatarColor: "#0d9488", balance: 3200 },
  { name: "Sam Okafor", email: "sam@example.com", avatarColor: "#ea580c", balance: 600 },
  { name: "Alex Day", email: "alex@example.com", avatarColor: "#0891b2", balance: 950 },
  { name: "Priya Shah", email: "priya@example.com", avatarColor: "#9333ea", balance: 2400 },
] as const;

/** Wipe all app data tables (auth tables left intact). Dev/seed only. */
export const wipe = mutation({
  args: {},
  handler: async (ctx) => {
    for (const table of [
      "comments",
      "wagers",
      "betSides",
      "bets",
      "transactions",
      "groupMembers",
      "groups",
    ] as const) {
      const docs = await ctx.db.query(table).collect();
      for (const d of docs) await ctx.db.delete(d._id);
    }
  },
});

/** Find a user by email (used to resolve seed IDs after creation). */
export const userIdByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();
    return user?._id ?? null;
  },
});

/** The full seed — wipe, create users (with auth), groups, bets, banter. */
export const all = action({
  args: {},
  handler: async (ctx) => {
    await ctx.runMutation(internal.seed.wipe, {});

    // 1. Create users via Convex Auth (handles password hashing + users row).
    const emails = SEED_USERS.map((u) => u.email);
    for (const u of SEED_USERS) {
      await createAccount(ctx, {
        provider: "password",
        account: { id: u.email, secret: SEED_PASSWORD },
        profile: {
          name: u.name,
          email: u.email,
          emailVerificationTime: 0,
          isAnonymous: false,
          avatarColor: u.avatarColor,
          balance: STARTING_BALANCE,
        },
      });
    }

    // Resolve created user IDs.
    const ids = await Promise.all(
      emails.map((email) =>
        ctx.runQuery(internal.seed.userIdByEmail, { email }).then(
          (id) => id as Id<"users">,
        ),
      ),
    );
    // IDs are validated by the subsequent mutations (they look up by email).
    void ids;

    // 2. Seed the balances to the exact values the e2e suite asserts.
    await ctx.runMutation(internal.seed.setBalances, {});

    // 3. Groups, bets, comments via the internal builder.
    await ctx.runMutation(internal.seed.buildGraph, {});

    return { ok: true as const, users: emails.length };
  },
});

/** Set each seed user's balance to its target value (idempotent lookup by email). */
export const setBalances = mutation({
  args: {},
  handler: async (ctx) => {
    for (const u of SEED_USERS) {
      const user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", u.email))
        .unique();
      if (!user) continue;
      await ctx.db.patch(user._id, { balance: u.balance });
    }
  },
});

/** Build groups, bets, wagers, transactions, comments for the seed. */
export const buildGraph = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const lookup = async (email: string) => {
      const u = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", email))
        .unique();
      if (!u) throw new Error(`Seed user missing: ${email}`);
      return u;
    };

    const josh = await lookup("josh@example.com");
    const mark = await lookup("mark@example.com");
    const jenny = await lookup("jenny@example.com");
    const sam = await lookup("sam@example.com");
    const alex = await lookup("alex@example.com");
    const priya = await lookup("priya@example.com");
    const allUsers = [josh, mark, jenny, sam, alex, priya];

    // ---- Groups ----
    const squadId = await ctx.db.insert("groups", {
      name: "Saturday Squad",
      description: "Weekend warriors. Mostly here to roast Mark.",
      emoji: "🍺",
      color: "#7c3aed",
      inviteCode: "LUCKY-FOX-42",
      createdById: josh._id,
      createdAt: now,
    });
    for (const u of allUsers) {
      await ctx.db.insert("groupMembers", { userId: u._id, groupId: squadId, joinedAt: now });
    }

    const flatId = await ctx.db.insert("groups", {
      name: "Flat 4B",
      description: "Chores, bins, and who finished the milk.",
      emoji: "🏠",
      color: "#0d9488",
      inviteCode: "BOLD-BEAR-77",
      createdById: josh._id,
      createdAt: now,
    });
    for (const u of [josh, jenny, sam]) {
      await ctx.db.insert("groupMembers", { userId: u._id, groupId: flatId, joinedAt: now });
    }

    // ---- Helper: create a yes/no bet with wagers (debits stakes) ----
    async function createBet(opts: {
      groupId: Id<"groups">;
      creator: Doc<"users">;
      title: string;
      description?: string;
      amount: number;
      closesInHours: number;
      wagers?: { user: Doc<"users">; side: "yes" | "no" }[];
    }) {
      const betId = await ctx.db.insert("bets", {
        groupId: opts.groupId,
        creatorId: opts.creator._id,
        title: opts.title,
        description: opts.description,
        amount: opts.amount,
        status: "open",
        createdAt: now,
        closesAt: now + opts.closesInHours * 3_600_000,
      });
      const yesId = await ctx.db.insert("betSides", { betId, label: "Yes" });
      const noId = await ctx.db.insert("betSides", { betId, label: "No" });

      for (const w of opts.wagers ?? []) {
        await ctx.db.insert("wagers", {
          betId,
          sideId: w.side === "yes" ? yesId : noId,
          userId: w.user._id,
          amount: opts.amount,
          createdAt: now,
        });
        // Debit stake.
        await ctx.db.patch(w.user._id, { balance: w.user.balance - opts.amount });
        await ctx.db.insert("transactions", {
          userId: w.user._id,
          type: "stake",
          amount: -opts.amount,
          note: `Stake: ${opts.title}`,
          createdAt: now,
        });
      }
      return betId;
    }

    // ---- Saturday Squad bets ----
    const bet1 = await createBet({
      groupId: squadId,
      creator: josh,
      title: "Mark blacks out before midnight",
      description: "It's Saturday. We all know how this ends.",
      amount: 1000,
      closesInHours: 3,
      wagers: [
        { user: josh, side: "yes" },
        { user: jenny, side: "yes" },
        { user: priya, side: "no" },
        { user: mark, side: "no" },
      ],
    });

    await createBet({
      groupId: squadId,
      creator: jenny,
      title: "Sam actually cooks dinner tonight",
      description: "Deliveroo is on speed dial though...",
      amount: 500,
      closesInHours: 6,
      wagers: [
        { user: jenny, side: "no" },
        { user: alex, side: "no" },
        { user: sam, side: "yes" },
      ],
    });

    await createBet({
      groupId: squadId,
      creator: alex,
      title: "Jordan's band plays past 11pm",
      amount: 200,
      closesInHours: 48,
      wagers: [{ user: alex, side: "yes" }],
    });

    // Settled bet (Priya & Mark win; Jenny loses).
    const settledId = await ctx.db.insert("bets", {
      groupId: squadId,
      creatorId: priya._id,
      title: "Jenny runs the Sunday 5k",
      description: "She swore she would. She did not.",
      amount: 300,
      status: "settled",
      outcome: "No",
      createdAt: now - 86_400_000,
      closesAt: now - 86_400_000,
      settledAt: now - 3_600_000,
    });
    const sYes = await ctx.db.insert("betSides", { betId: settledId, label: "Yes" });
    const sNo = await ctx.db.insert("betSides", { betId: settledId, label: "No" });
    await ctx.db.insert("wagers", { betId: settledId, sideId: sYes, userId: josh._id, amount: 300, createdAt: now });
    await ctx.db.insert("wagers", { betId: settledId, sideId: sNo, userId: priya._id, amount: 300, createdAt: now });
    await ctx.db.insert("wagers", { betId: settledId, sideId: sNo, userId: mark._id, amount: 300, createdAt: now });
    // Priya & Mark win 300 each (pot 900 split 2 ways = 450 each).
    await ctx.db.patch(priya._id, { balance: priya.balance + 450 });
    await ctx.db.patch(mark._id, { balance: mark.balance + 450 });

    // ---- Flat 4B bet ----
    await createBet({
      groupId: flatId,
      creator: jenny,
      title: "Sam takes the bins out on Tuesday",
      amount: 200,
      closesInHours: 30,
      wagers: [
        { user: jenny, side: "no" },
        { user: josh, side: "no" },
      ],
    });

    // ---- Banter on the first open bet ----
    await ctx.db.insert("comments", {
      betId: bet1,
      userId: mark._id,
      text: "Easy money. He's already three pints in by 9. 💪",
      createdAt: now,
    });
    await ctx.db.insert("comments", {
      betId: bet1,
      userId: jenny._id,
      text: "Bold of you to assume he even makes it to the match 😂",
      createdAt: now + 1,
    });
    await ctx.db.insert("comments", {
      betId: bet1,
      userId: josh._id,
      text: "I'm putting my money where my mouth is. NO all day.",
      createdAt: now + 2,
    });
  },
});
