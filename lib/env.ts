/**
 * Centralised, validated environment configuration.
 *
 * Reading process.env directly across the codebase makes it easy to ship with a
 * default secret or an unset value. This module validates the environment once,
 * fails loudly in production when something is wrong, and exposes typed helpers
 * everywhere else.
 */

const DEFAULT_DEV_SECRET =
  "betwfriends-dev-secret-change-me-in-production-please-use-32+chars";

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

  /** Database URL. Falls back to a local SQLite file for development. */
  databaseUrl: readRaw("DATABASE_URL") ?? "file:./dev.db",

  /** JWT/session secret. Must be set and non-default in production. */
  sessionSecret: readRaw("SESSION_SECRET") ?? DEFAULT_DEV_SECRET,

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
 * Validate the environment. Called from middleware and instrumentation so the
 * app fails fast on boot instead of serving insecure requests.
 *
 * In development we only warn. In production we throw — better to refuse to
 * start than to sign JWTs with a default secret.
 */
export function assertEnv(): void {
  if (!env.isProduction) return;

  if (
    env.sessionSecret === DEFAULT_DEV_SECRET ||
    env.sessionSecret.length < 32
  ) {
    throw new Error(
      "SESSION_SECRET must be set to a random string of at least 32 characters in production.",
    );
  }

  if (env.paymentMode === "live") {
    if (!env.stripeSecretKey) {
      throw new Error(
        'PAYMENT_MODE is "live" but STRIPE_SECRET_KEY is not set.',
      );
    }
    if (!env.stripePublishableKey) {
      throw new Error(
        'PAYMENT_MODE is "live" but STRIPE_PUBLISHABLE_KEY is not set.',
      );
    }
    if (!env.stripeWebhookSecret) {
      throw new Error(
        'PAYMENT_MODE is "live" but STRIPE_WEBHOOK_SECRET is not set.',
      );
    }
  }
}
