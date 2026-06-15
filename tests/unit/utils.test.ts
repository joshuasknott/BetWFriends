import { describe, it, expect } from "vitest";
import {
  formatMoney,
  formatMoneyShort,
  parseMoney,
  initials,
  colorFromString,
  generateInviteCode,
  formatDate,
} from "@/lib/utils";

describe("formatMoney", () => {
  it("formats pence as GBP", () => {
    expect(formatMoney(0)).toBe("£0.00");
    expect(formatMoney(100)).toBe("£1.00");
    expect(formatMoney(1000)).toBe("£10.00");
    expect(formatMoney(999)).toBe("£9.99");
    expect(formatMoney(1050)).toBe("£10.50");
  });

  it("handles large amounts", () => {
    expect(formatMoney(100000)).toBe("£1,000.00");
    expect(formatMoney(10000000)).toBe("£100,000.00");
  });

  it("handles negative amounts", () => {
    expect(formatMoney(-500)).toBe("-£5.00");
  });
});

describe("formatMoneyShort", () => {
  it("drops decimals for whole amounts", () => {
    expect(formatMoneyShort(1000)).toBe("£10");
    expect(formatMoneyShort(500)).toBe("£5");
  });

  it("keeps decimals for fractional amounts", () => {
    expect(formatMoneyShort(1050)).toBe("£10.50");
    expect(formatMoneyShort(99)).toBe("£0.99");
  });
});

describe("parseMoney", () => {
  it("parses clean numbers", () => {
    expect(parseMoney("10")).toBe(1000);
    expect(parseMoney("10.50")).toBe(1050);
    expect(parseMoney("0.99")).toBe(99);
  });

  it("strips currency symbols and spaces", () => {
    expect(parseMoney("£10")).toBe(1000);
    expect(parseMoney("£ 10.50")).toBe(1050);
    expect(parseMoney("$5.00")).toBe(500);
  });

  it("returns null for invalid input", () => {
    expect(parseMoney("")).toBeNull();
    expect(parseMoney("abc")).toBeNull();
  });

  it("strips negative sign (no negative money)", () => {
    // parseMoney strips non-numeric chars, so "-5" becomes "5" -> 500
    expect(parseMoney("-5")).toBe(500);
  });

  it("rounds to nearest penny", () => {
    expect(parseMoney("10.999")).toBe(1100); // rounds 999.9 -> 1000 -> 1000... actually 10.999*100 = 1099.9 -> 1100
    expect(parseMoney("10.005")).toBe(1001); // 10.005*100 = 1000.5 -> 1001
  });
});

describe("initials", () => {
  it("returns first+last initials for full names", () => {
    expect(initials("Josh Bennett")).toBe("JB");
    expect(initials("Mark Quinn")).toBe("MQ");
  });

  it("returns first two chars for single names", () => {
    expect(initials("Josh")).toBe("JO");
    expect(initials("M")).toBe("M"); // Actually single char returns just that
  });

  it("returns ? for empty string", () => {
    expect(initials("")).toBe("?");
    expect(initials("   ")).toBe("?");
  });
});

describe("colorFromString", () => {
  it("returns a hex color for any string", () => {
    expect(colorFromString("Josh")).toMatch(/^#[0-9a-f]{6}$/);
    expect(colorFromString("Mark")).toMatch(/^#[0-9a-f]{6}$/);
    expect(colorFromString("test123")).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("returns the same color for the same string", () => {
    expect(colorFromString("Josh")).toBe(colorFromString("Josh"));
  });

  it("may return different colors for different strings", () => {
    // Not guaranteed, but likely for very different strings
    const colors = new Set(["Josh", "Mark", "Jenny", "Sam", "Alex"].map(colorFromString));
    expect(colors.size).toBeGreaterThan(1);
  });
});

describe("generateInviteCode", () => {
  it("generates a code in ADJECTIVE-NOUN-NUMBER format", () => {
    const code = generateInviteCode();
    expect(code).toMatch(/^[A-Z]+-[A-Z]+-\d{2}$/);
  });

  it("generates unique codes (probabilistically)", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 50; i++) {
      codes.add(generateInviteCode());
    }
    // With 10 adjectives * 10 nouns * 90 numbers = 9000 combos,
    // 50 draws should have very few collisions
    expect(codes.size).toBeGreaterThan(45);
  });
});

describe("formatDate", () => {
  it("formats a date in en-GB style", () => {
    const d = new Date("2026-06-15T12:00:00Z");
    const formatted = formatDate(d);
    expect(formatted).toMatch(/15 Jun 2026/);
  });
});
