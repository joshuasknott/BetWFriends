/**
 * Lightweight in-memory rate limiter (token bucket per key).
 *
 * For a friends-scale app this is plenty and avoids a Redis dependency. In a
 * multi-instance deployment you'd swap this for a shared store, but the
 * interface stays the same.
 */

type Bucket = { tokens: number; lastRefill: number };

const buckets = new Map<string, Bucket>();

// Bound memory: periodically drop stale buckets.
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

function cleanup(maxAgeMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoff = now - maxAgeMs;
  for (const [key, bucket] of buckets) {
    if (bucket.lastRefill < cutoff) buckets.delete(key);
  }
}

export type RateLimitOptions = {
  /** Maximum tokens (requests) a bucket can hold. */
  capacity: number;
  /** Tokens added per second. */
  refillPerSecond: number;
};

export type RateLimitResult = {
  allowed: boolean;
  /** Remaining tokens after this request. */
  remaining: number;
  /** Epoch ms when the client should retry (null if allowed). */
  retryAfterMs: number | null;
};

/**
 * Check whether a request should be allowed, consuming one token if so.
 */
export function rateLimit(
  key: string,
  opts: RateLimitOptions,
): RateLimitResult {
  cleanup(30 * 60 * 1000); // drop buckets idle for 30 min

  const now = Date.now();
  const existing = buckets.get(key);

  let bucket: Bucket;
  if (existing) {
    const elapsedSec = (now - existing.lastRefill) / 1000;
    const refilled = Math.min(
      opts.capacity,
      existing.tokens + elapsedSec * opts.refillPerSecond,
    );
    bucket = { tokens: refilled, lastRefill: now };
  } else {
    bucket = { tokens: opts.capacity, lastRefill: now };
  }

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    buckets.set(key, bucket);
    return { allowed: true, remaining: Math.floor(bucket.tokens), retryAfterMs: null };
  }

  const tokensNeeded = 1 - bucket.tokens;
  const waitMs = Math.ceil((tokensNeeded / opts.refillPerSecond) * 1000);
  buckets.set(key, bucket);
  return { allowed: false, remaining: 0, retryAfterMs: waitMs };
}

/** Preset limiters for sensitive endpoints. */
export const LIMITS = {
  // Auth: 10 attempts / 10s per IP — stops brute force without blocking humans.
  auth: { capacity: 10, refillPerSecond: 1 },
  // Payments: 5 attempts / 10s per user.
  payment: { capacity: 5, refillPerSecond: 0.5 },
} as const satisfies Record<string, RateLimitOptions>;

/**
 * Apply a named rate limit and return a standard 429 response if exceeded.
 * Returns null if the request is allowed.
 */
export function enforceRateLimit(
  key: string,
  preset: keyof typeof LIMITS,
): Response | null {
  const result = rateLimit(key, LIMITS[preset]);
  if (result.allowed) return null;
  const retryAfter = Math.ceil((result.retryAfterMs ?? 1000) / 1000);
  return new Response(
    JSON.stringify({ error: "Too many requests. Slow down a touch." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    },
  );
}
