import type { NextRequest } from "next/server";

/**
 * Next.js route handler for Convex Auth.
 *
 * The Convex Auth Next.js client talks to the Convex deployment directly via
 * the generated `auth.signIn`/`auth.signOut` actions, and the middleware
 * (`convexAuthNextjsMiddleware` in proxy.ts) handles the cookie side. This
 * route exists so the configured `apiRoute` (`/api/auth`) resolves.
 */

async function handler(_request: NextRequest): Promise<Response> {
  void _request; // passthrough — Convex Auth client talks to Convex directly
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}

export const GET = handler;
export const POST = handler;
