import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import type Stripe from "stripe";

/**
 * Stripe webhook — finalises live wallet top-ups.
 *
 * Mounted at POST /stripe on the Convex deployment. Configure the endpoint
 * in the Stripe dashboard with the STRIPE_WEBHOOK_SECRET.
 *
 * Verifies the signature, then calls `wallet.completeTopUp` (idempotent on the
 * PaymentIntent id) to credit the user's balance.
 */

export const stripeWebhook = httpAction(async (ctx, request) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secret || !secretKey) {
    return new Response(JSON.stringify({ error: "Webhooks not configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stripeModule = await import("stripe");
  const StripeCtor = stripeModule.default;
  const stripe = new StripeCtor(secretKey);

  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return new Response(JSON.stringify({ error: "Missing signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, sig, secret);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Invalid signature: ${(err as Error).message}` }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const userId = intent.metadata?.userId as Doc<"users">["_id"] | undefined;
    if (userId && intent.amount_received) {
      await ctx.runMutation(internal.wallet.completeTopUp, {
        userId,
        amount: intent.amount_received,
        paymentIntentId: intent.id,
      });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
