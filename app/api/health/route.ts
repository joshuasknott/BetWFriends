import { NextResponse } from "next/server";

/**
 * Health check endpoint.
 * Returns 200 with a timestamp if the server is running.
 * Used by Docker health checks and load balancers.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
