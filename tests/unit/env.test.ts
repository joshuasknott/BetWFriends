import { describe, it, expect } from "vitest";
import { env, isLivePayments, assertEnv } from "@/lib/env";

describe("env module", () => {
  it("always exposes a databaseUrl", () => {
    expect(env.databaseUrl).toBeTruthy();
    expect(typeof env.databaseUrl).toBe("string");
  });

  it("always exposes a sessionSecret", () => {
    expect(env.sessionSecret).toBeTruthy();
    expect(env.sessionSecret.length).toBeGreaterThanOrEqual(20);
  });

  it("strips trailing slash from appUrl", () => {
    expect(env.appUrl.endsWith("/")).toBe(false);
  });

  it("isLivePayments returns false when paymentMode is not 'live'", () => {
    // In test environment, PAYMENT_MODE is not set
    expect(isLivePayments()).toBe(false);
  });

  it("assertEnv does not throw with the default dev secret", () => {
    // In test environment with the default dev secret, assertEnv should be
    // safe — it only throws in production with the default/short secret.
    expect(() => assertEnv()).not.toThrow();
  });
});
