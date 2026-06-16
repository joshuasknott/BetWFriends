import { v } from "convex/values";
import { query, internalMutation, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireUser, requireAuth } from "./authHelpers";
import { creditBalance } from "./groups";

/**
 * Wallet functions — ported from app/api/wallet + lib/payments.
 *
 * Mock mode credits instantly for free (demo). Live mode creates a Stripe
 * PaymentIntent in an action; the webhook (Phase 5) finalises the top-up.
 */

/** Whether real Stripe payments are configured. */
function isLivePayments(): boolean {
  return process.env.PAYMENT_MODE === "live" && !!process.env.STRIPE_SECRET_KEY;
}

export type TopUpResult =
  | { mode: "mock"; success: true; balance: number }
  | { mode: "live"; clientSecret: string; paymentIntentId: string };

export const topUp = action({
  args: { amount: v.number() },
  handler: async (ctx, args): Promise<TopUpResult> => {
    const userId = await requireAuth(ctx);
    if (!Number.isInteger(args.amount) || args.amount < 100)
      throw new Error("Minimum £1");
    if (args.amount > 100000) throw new Error("Maximum £1000");

    if (!isLivePayments()) {
      // Mock: credit instantly.
      const balance = await ctx.runMutation(internal.wallet.creditTopUp, {
        userId,
        amount: args.amount,
        reference: "mock-topup",
      });
      return { mode: "mock", success: true, balance };
    }

    // Live: create a Stripe PaymentIntent.
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const intent = await stripe.paymentIntents.create({
      amount: args.amount,
      currency: "gbp",
      automatic_payment_methods: { enabled: true },
      metadata: { userId, kind: "topup" },
    });
    if (!intent.client_secret) throw new Error("Failed to create payment intent");
    return { mode: "live", clientSecret: intent.client_secret, paymentIntentId: intent.id };
  },
});

/** Finalise a live top-up once the PaymentIntent succeeds. Idempotent on reference. */
export const completeTopUp = internalMutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    paymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("transactions")
      .withIndex("by_reference", (q) => q.eq("reference", args.paymentIntentId))
      .unique();
    if (existing) return; // already processed

    const u = await ctx.db.get(args.userId);
    if (!u) throw new Error("User not found");
    await ctx.db.patch(args.userId, { balance: u.balance + args.amount });
    await ctx.db.insert("transactions", {
      userId: args.userId,
      type: "topup",
      amount: args.amount,
      note: "Top-up via card",
      reference: args.paymentIntentId,
      createdAt: Date.now(),
    });
  },
});

/** Internal: credit a mock top-up and return the new balance. */
export const creditTopUp = internalMutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    reference: v.string(),
  },
  handler: async (ctx, args) => {
    await creditBalance(ctx, args.userId, args.amount, "topup", "Demo top-up (mock mode)", args.reference);
    const u = await ctx.db.get(args.userId);
    return u!.balance;
  },
});

/** Transaction history for the wallet page. */
export const listTransactions = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const txns = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    return {
      balance: user.balance,
      transactions: txns
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((t) => ({
          id: t._id,
          type: t.type,
          amount: t.amount,
          note: t.note,
          createdAt: t.createdAt,
        })),
    };
  },
});
