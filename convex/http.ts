import { httpRouter } from "convex/server";
import { auth } from "./auth.js";

/**
 * Convex HTTP router.
 *
 * Mounts the Convex Auth HTTP routes (JWT verification + sign-in/callback
 * endpoints) and the Stripe webhook (added in Phase 5).
 */
const http = httpRouter();

auth.addHttpRoutes(http);

export default http;
