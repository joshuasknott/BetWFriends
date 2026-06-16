/**
 * Centralised, validated environment configuration.
 *
 * The database + session secrets that used to live here are gone — Convex Auth
 * and the Convex deployment manage those now. What remains is Stripe payment
 * config and the public app URL.
 */

function readRaw(name: string): string | undefined {
  const value = process.env[name];
  if (value === undefined || value === null) return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

const isProduction = process.env.NODE_ENV === "production";

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction,
  isDevelopment: !isProduction,

  /**
   * "live" enables real Stripe payments. Anything else (including unset) is
   * treated as mock/demo mode so local development works with zero config.
   */
  paymentMode: readRaw("PAYMENT_MODE"),

  stripeSecretKey: readRaw("STRIPE_SECRET_KEY"),
  stripePublishableKey: readRaw("STRIPE_PUBLISHABLE_KEY"),
  stripeWebhookSecret: readRaw("STRIPE_WEBHOOK_SECRET"),

  /** Public app URL, used for absolute links (email, OG metadata). No trailing slash. */
  appUrl: (readRaw("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  ),
} as const;

/** Whether real (live) Stripe payments are configured. */
export function isLivePayments(): boolean {
  return env.paymentMode === "live" && !!env.stripeSecretKey;
}

/**
 * Validate the environment. Called from instrumentation so the app fails fast
 * on boot. In development we only warn. In production we throw when live
 * payments are enabled but Stripe keys are missing.
 */
export function assertEnv(): void {
  if (!env.isProduction) return;

  if (env.paymentMode === "live") {
    if (!env.stripeSecretKey) {
      throw new Error('PAYMENT_MODE is "live" but STRIPE_SECRET_KEY is not set.');
    }
    if (!env.stripePublishableKey) {
      throw new Error('PAYMENT_MODE is "live" but STRIPE_PUBLISHABLE_KEY is not set.');
    }
    if (!env.stripeWebhookSecret) {
      throw new Error('PAYMENT_MODE is "live" but STRIPE_WEBHOOK_SECRET is not set.');
    }
  }
}
