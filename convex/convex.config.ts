import { defineApp } from "convex/server";

/**
 * The Convex app definition.
 *
 * `defineApp()` is the entry point that registers the schema, functions, and
 * (later) any components with the Convex backend. The schema is discovered
 * automatically from `convex/schema.ts`.
 */
const app = defineApp({
  // Components (Stripe, rate-limiter) are wired here as they're added.
});

export default app;
