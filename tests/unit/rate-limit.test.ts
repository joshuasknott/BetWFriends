import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, LIMITS } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows requests up to capacity", () => {
    const results: boolean[] = [];
    for (let i = 0; i < 10; i++) {
      results.push(rateLimit(`test-allow-${i}`, LIMITS.auth).allowed);
    }
    // Each key is unique so all should be allowed
    expect(results.every((r) => r === true)).toBe(true);
  });

  it("blocks requests exceeding capacity", () => {
    const key = `test-block-${Date.now()}`;
    const results: boolean[] = [];
    // Capacity is 10 for auth preset
    for (let i = 0; i < 15; i++) {
      results.push(rateLimit(key, LIMITS.auth).allowed);
    }
    // First 10 should pass, last 5 should be blocked
    const passed = results.filter((r) => r).length;
    const blocked = results.filter((r) => !r).length;
    expect(passed).toBe(10);
    expect(blocked).toBe(5);
  });

  it("returns remaining count", () => {
    const key = `test-remaining-${Date.now()}`;
    const r1 = rateLimit(key, LIMITS.auth);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(9); // 10 - 1 = 9
  });

  it("returns retryAfterMs when blocked", () => {
    const key = `test-retry-${Date.now()}`;
    // Exhaust the bucket
    for (let i = 0; i < 10; i++) {
      rateLimit(key, LIMITS.auth);
    }
    const blocked = rateLimit(key, LIMITS.auth);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("tracks keys independently", () => {
    const keyA = `test-indep-a-${Date.now()}`;
    const keyB = `test-indep-b-${Date.now()}`;
    // Exhaust keyA
    for (let i = 0; i < 10; i++) {
      rateLimit(keyA, LIMITS.auth);
    }
    // keyB should still have full capacity
    const result = rateLimit(keyB, LIMITS.auth);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it("payment preset has stricter limits than auth", () => {
    expect(LIMITS.payment.capacity).toBeLessThan(LIMITS.auth.capacity);
  });
});
