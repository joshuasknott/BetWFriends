/**
 * Server-only CSRF utilities (token generation + validation).
 *
 * Separated from csrf.ts because these use node:crypto, which is not available
 * in the browser bundle. The shared constants and helpers in csrf.ts are safe
 * to import from anywhere.
 */

import { createHash, randomBytes } from "node:crypto";
import { CSRF_COOKIE, CSRF_HEADER } from "@/lib/csrf";

// Re-export for convenience in server code.
export { CSRF_COOKIE, CSRF_HEADER };

/** Generate a cryptographically random CSRF token (32 bytes, base64url). */
export function generateCsrfToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Validate the CSRF token on a mutating request.
 * Returns true if the header token matches the cookie token (constant-time).
 */
export function validateCsrf(
  headerToken: string | null,
  cookieToken: string | undefined,
): boolean {
  if (!headerToken || !cookieToken) return false;
  if (headerToken.length !== cookieToken.length) return false;
  // Constant-time comparison to avoid timing attacks.
  const a = createHash("sha256").update(headerToken).digest();
  const b = createHash("sha256").update(cookieToken).digest();
  return a.equals(b);
}
