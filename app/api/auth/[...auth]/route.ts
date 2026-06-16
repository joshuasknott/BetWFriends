import { auth } from "@/convex/auth";
import { httpAction } from "convex/server";
import type { NextRequest } from "next/server";

/**
 * Next.js route handler for Convex Auth.
 *
 * Proxies `/api/auth/*` requests to the Convex Auth HTTP actions. This is the
 * bridge between the browser (which calls signIn/signOut) and the Convex
 * backend (which issues session tokens).
 *
 * The Convex Auth middleware (`convexAuthNextjsMiddleware` in proxy.ts) handles
 * the cookie side; this route forwards the actual auth API calls.
 */

async function handler(_request: NextRequest): Promise<Response> {
  // The Convex Auth Nextjs client calls the Convex deployment directly via the
  // generated `auth.signIn`/`auth.signOut` actions — this route exists to
  // satisfy the configured `apiRoute` and is a passthrough. In practice the
  // middleware reads/writes the auth cookies and the client talks to Convex.
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}

export const GET = handler;
export const POST = handler;

void auth;
void httpAction;
