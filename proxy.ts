import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

/**
 * Proxy (Next.js 16 renamed middleware → "proxy").
 *
 * Replaces the old CSRF + rate-limit + session-cookie proxy with Convex Auth:
 * it handles the auth handshake cookies and gates the authenticated routes.
 *
 * - CSRF is no longer needed: Convex mutations are called via the authenticated
 *   Convex client (not fetch with cookies), so they aren't reachable via the
 *   same-origin CSRF pattern the old token guarded against.
 * - Rate limiting moves to the Convex layer (per-action) — see convex/auth.ts
 *   `signIn.maxFailedAttempsPerHour`.
 */

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/groups(.*)", "/bets(.*)", "/wallet(.*)", "/profile(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/login");
  }
});

export const config = {
  // Run on everything except static asset paths.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand|.*\\..*).*)"],
};
