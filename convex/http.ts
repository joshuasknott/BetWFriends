import { httpRouter } from "convex/server";
import { auth } from "./auth.js";
import { stripeWebhook } from "./stripe.js";

/**
 * Convex HTTP router.
 *
 * - Convex Auth routes (JWT verification + sign-in/callback endpoints)
 * - Stripe webhook (`/stripe`) for finalising live wallet top-ups
 */
const http = httpRouter();

auth.addHttpRoutes(http);

// Stripe webhook — configured in the Stripe dashboard to point at
// https://<deployment>.convex.site/stripe
http.route({
  path: "/stripe",
  method: "POST",
  handler: stripeWebhook,
});

export default http;
