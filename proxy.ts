import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import {
  CSRF_COOKIE,
  generateCsrfToken,
  validateCsrf,
} from "@/lib/csrf-server";
import {
  CSRF_HEADER,
  isCsrfExempt,
  isMutatingMethod,
} from "@/lib/csrf";
import { enforceRateLimit } from "@/lib/rate-limit";

/**
 * Security proxy (formerly middleware in Next.js < 16):
 *  1. Sets/refreshes the CSRF cookie on every response (for GET requests).
 *  2. Validates the CSRF token header on mutating requests (unless exempt).
 *  3. Applies rate limiting to sensitive auth endpoints.
 *  4. Validates the environment on first import (production fails fast).
 */

// Routes that don't need the proxy to run (static assets).
const PUBLIC_FILE = /\.(?!well-known).*\..*$/;

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "127.0.0.1";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and Next internals.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/_") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // --- Rate limit sensitive auth endpoints ---
  if (pathname === "/api/auth/login" || pathname === "/api/auth/register") {
    const limited = enforceRateLimit(`auth:${clientIp(request)}`, "auth");
    if (limited) return limited;
  }
  if (pathname === "/api/wallet/topup") {
    const limited = enforceRateLimit(`pay:${clientIp(request)}`, "payment");
    if (limited) return limited;
  }

  // --- CSRF protection for mutating requests ---
  if (isMutatingMethod(request.method) && !isCsrfExempt(pathname)) {
    const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;
    const headerToken = request.headers.get(CSRF_HEADER);
    if (!validateCsrf(headerToken, cookieToken)) {
      return NextResponse.json(
        { error: "Security check failed. Please refresh and try again." },
        { status: 403 },
      );
    }
  }

  // Attach the CSRF token cookie if missing or stale (so the client always has one).
  const response = NextResponse.next();
  if (!request.cookies.get(CSRF_COOKIE)?.value) {
    const token = generateCsrfToken();
    response.cookies.set(CSRF_COOKIE, token, {
      httpOnly: false, // client JS must read this to send the header
      sameSite: "lax",
      secure: env.isProduction,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days, matches session
    });
  }
  return response;
}

export const config = {
  // Run on everything except static asset paths (handled above too).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand|.*\\.svg$).*)"],
};
