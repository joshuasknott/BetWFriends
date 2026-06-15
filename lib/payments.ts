import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { env, isLivePayments } from "@/lib/env";

/** Are we in mock (demo) payment mode? */
export function isMockPayments(): boolean {
  return !isLivePayments();
}

function getStripe(): Stripe {
  if (!env.stripeSecretKey) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(env.stripeSecretKey);
}

export type TopUpResult =
  | { mode: "mock"; success: true; balance: number }
  | { mode: "live"; clientSecret: string; paymentIntentId: string };

/**
 * Initiate a wallet top-up.
 * In mock mode, credits instantly for free (demo).
 * In live mode, creates a Stripe PaymentIntent.
 */
export async function startTopUp(
  userId: string,
  amountPence: number,
): Promise<TopUpResult> {
  if (isMockPayments()) {
    await prisma.user.update({
      where: { id: userId },
      data: { balance: { increment: amountPence } },
    });
    await prisma.transaction.create({
      data: {
        userId,
        type: "topup",
        amount: amountPence,
        note: "Demo top-up (mock mode)",
        reference: "mock-topup",
      },
    });
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return { mode: "mock", success: true, balance: user.balance };
  }

  const stripe = getStripe();
  const intent = await stripe.paymentIntents.create({
    amount: amountPence,
    currency: "gbp",
    automatic_payment_methods: { enabled: true },
    metadata: { userId, kind: "topup" },
  });

  if (!intent.client_secret) {
    throw new Error("Failed to create payment intent");
  }

  return {
    mode: "live",
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
  };
}

/**
 * Complete a live top-up once the PaymentIntent succeeds.
 * Called from the Stripe webhook. Idempotent on the reference.
 */
export async function completeTopUp(
  userId: string,
  amountPence: number,
  paymentIntentId: string,
): Promise<void> {
  const existing = await prisma.transaction.findFirst({
    where: { reference: paymentIntentId },
  });
  if (existing) return; // already processed

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { balance: { increment: amountPence } },
    });
    await tx.transaction.create({
      data: {
        userId,
        type: "topup",
        amount: amountPence,
        note: "Top-up via card",
        reference: paymentIntentId,
      },
    });
  });
}
