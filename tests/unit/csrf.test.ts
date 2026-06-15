import { describe, it, expect } from "vitest";
import {
  CSRF_COOKIE,
  CSRF_HEADER,
  isMutatingMethod,
  isCsrfExempt,
} from "@/lib/csrf";
import { generateCsrfToken, validateCsrf } from "@/lib/csrf-server";

describe("CSRF constants", () => {
  it("uses the expected cookie and header names", () => {
    expect(CSRF_COOKIE).toBe("bwf_csrf");
    expect(CSRF_HEADER).toBe("x-csrf-token");
  });
});

describe("isMutatingMethod", () => {
  it("identifies mutating methods", () => {
    expect(isMutatingMethod("POST")).toBe(true);
    expect(isMutatingMethod("PUT")).toBe(true);
    expect(isMutatingMethod("PATCH")).toBe(true);
    expect(isMutatingMethod("DELETE")).toBe(true);
  });

  it("identifies safe methods", () => {
    expect(isMutatingMethod("GET")).toBe(false);
    expect(isMutatingMethod("HEAD")).toBe(false);
    expect(isMutatingMethod("OPTIONS")).toBe(false);
  });
});

describe("isCsrfExempt", () => {
  it("exempts the Stripe webhook", () => {
    expect(isCsrfExempt("/api/stripe/webhook")).toBe(true);
  });

  it("does not exempt other API routes", () => {
    expect(isCsrfExempt("/api/auth/login")).toBe(false);
    expect(isCsrfExempt("/api/bets")).toBe(false);
    expect(isCsrfExempt("/api/wallet/topup")).toBe(false);
  });
});

describe("generateCsrfToken", () => {
  it("generates a non-empty string", () => {
    const token = generateCsrfToken();
    expect(token).toBeTruthy();
    expect(token.length).toBeGreaterThan(20);
  });

  it("generates unique tokens", () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 100; i++) {
      tokens.add(generateCsrfToken());
    }
    expect(tokens.size).toBe(100);
  });
});

describe("validateCsrf", () => {
  it("returns true when header matches cookie", () => {
    const token = generateCsrfToken();
    expect(validateCsrf(token, token)).toBe(true);
  });

  it("returns false when header does not match cookie", () => {
    const t1 = generateCsrfToken();
    const t2 = generateCsrfToken();
    expect(validateCsrf(t1, t2)).toBe(false);
  });

  it("returns false for null header", () => {
    expect(validateCsrf(null, generateCsrfToken())).toBe(false);
  });

  it("returns false for undefined cookie", () => {
    expect(validateCsrf(generateCsrfToken(), undefined)).toBe(false);
  });

  it("returns false for empty strings", () => {
    expect(validateCsrf("", "")).toBe(false);
  });

  it("returns false when lengths differ", () => {
    expect(validateCsrf("short", "muchlongertokenvalue")).toBe(false);
  });
});
