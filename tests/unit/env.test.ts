import { describe, it, expect } from "vitest";
import { env, isLivePayments, assertEnv } from "@/lib/env";

describe("env module", () => {
  it("strips trailing slash from appUrl", () => {
    expect(env.appUrl.endsWith("/")).toBe(false);
  });

  it("isLivePayments returns false when paymentMode is not 'live'", () => {
    // In test environment, PAYMENT_MODE is not set
    expect(isLivePayments()).toBe(false);
  });

  it("assertEnv does not throw in the test environment", () => {
    // In the non-production test environment, assertEnv is a no-op.
    expect(() => assertEnv()).not.toThrow();
  });

  it("exposes payment mode helpers", () => {
    expect(typeof env.paymentMode).toBe("string");
    expect(typeof env.appUrl).toBe("string");
  });
});
