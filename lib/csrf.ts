/**
 * CSRF protection using the double-submit cookie pattern.
 *
 * On GET requests, middleware sets a non-httpOnly cookie containing a random
 * token. The browser sends it on every subsequent request. For state-changing
 * requests (POST/PUT/PATCH/DELETE) the client must echo the same token in an
 * `X-CSRF-Token` header. We compare the header to the cookie — if they match,
 * the request came from our own origin (a third-party site can set a cookie
 * but cannot read it back to put in a header due to SameSite rules).
 *
 * The Stripe webhook is exempt because it authenticates via a signature, not a
 * cookie, so CSRF does not apply.
 */

// --- Shared constants (safe for both Edge/Node and browser) ---
export const CSRF_COOKIE = "bwf_csrf";
export const CSRF_HEADER = "x-csrf-token";

/** Methods that can change state and therefore require CSRF validation. */
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Paths that are exempt from CSRF (they authenticate another way). */
const EXEMPT_PATHS = ["/api/stripe/webhook"];

export function isMutatingMethod(method: string): boolean {
  return MUTATING_METHODS.has(method.toUpperCase());
}

export function isCsrfExempt(pathname: string): boolean {
  return EXEMPT_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
