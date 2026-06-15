import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  createGroupSchema,
  joinGroupSchema,
  createBetSchema,
  topUpSchema,
} from "@/lib/validation";

describe("registerSchema", () => {
  it("validates a correct registration", () => {
    const result = registerSchema.safeParse({
      name: "Josh",
      email: "josh@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short passwords", () => {
    const result = registerSchema.safeParse({
      name: "Josh",
      email: "josh@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid emails", () => {
    const result = registerSchema.safeParse({
      name: "Josh",
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty names", () => {
    const result = registerSchema.safeParse({
      name: "",
      email: "josh@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects names over 40 chars", () => {
    const result = registerSchema.safeParse({
      name: "A".repeat(41),
      email: "josh@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("validates correct login", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });

  it("rejects empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(loginSchema.safeParse({ email: "bad", password: "x" }).success).toBe(false);
  });
});

describe("createGroupSchema", () => {
  it("validates correct group", () => {
    expect(
      createGroupSchema.safeParse({
        name: "Saturday Squad",
        emoji: "🎲",
        color: "#7c3aed",
      }).success,
    ).toBe(true);
  });

  it("allows optional description", () => {
    expect(
      createGroupSchema.safeParse({
        name: "Test",
        description: "A group",
        emoji: "🎲",
        color: "#7c3aed",
      }).success,
    ).toBe(true);
  });

  it("rejects missing name", () => {
    expect(
      createGroupSchema.safeParse({ emoji: "🎲", color: "#7c3aed" }).success,
    ).toBe(false);
  });
});

describe("joinGroupSchema", () => {
  it("uppercases and trims the invite code", () => {
    const result = joinGroupSchema.safeParse({ inviteCode: " lucky-fox-42 " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.inviteCode).toBe("LUCKY-FOX-42");
    }
  });

  it("rejects empty code", () => {
    expect(joinGroupSchema.safeParse({ inviteCode: "" }).success).toBe(false);
  });
});

describe("createBetSchema", () => {
  it("validates a correct bet", () => {
    const result = createBetSchema.safeParse({
      groupId: "group1",
      title: "Mark blacks out",
      amount: 1000,
      durationHours: 24,
    });
    expect(result.success).toBe(true);
  });

  it("allows £0 stakes", () => {
    const result = createBetSchema.safeParse({
      groupId: "group1",
      title: "Bragging rights",
      amount: 0,
      durationHours: 6,
    });
    expect(result.success).toBe(true);
  });

  it("rejects titles over 140 chars", () => {
    const result = createBetSchema.safeParse({
      groupId: "group1",
      title: "A".repeat(141),
      amount: 100,
      durationHours: 24,
    });
    expect(result.success).toBe(false);
  });

  it("rejects duration under 1 hour", () => {
    const result = createBetSchema.safeParse({
      groupId: "group1",
      title: "Test",
      amount: 100,
      durationHours: 0,
    });
    expect(result.success).toBe(false);
  });

  it("defaults side labels to Yes/No", () => {
    const result = createBetSchema.safeParse({
      groupId: "group1",
      title: "Test",
      amount: 100,
      durationHours: 24,
    });
    if (result.success) {
      expect(result.data.yesLabel).toBe("Yes");
      expect(result.data.noLabel).toBe("No");
    }
  });
});

describe("topUpSchema", () => {
  it("validates amounts within range", () => {
    expect(topUpSchema.safeParse({ amount: 100 }).success).toBe(true);
    expect(topUpSchema.safeParse({ amount: 5000 }).success).toBe(true);
    expect(topUpSchema.safeParse({ amount: 100000 }).success).toBe(true);
  });

  it("rejects amounts below £1 minimum", () => {
    expect(topUpSchema.safeParse({ amount: 50 }).success).toBe(false);
    expect(topUpSchema.safeParse({ amount: 99 }).success).toBe(false);
  });

  it("rejects amounts above £1000 maximum", () => {
    expect(topUpSchema.safeParse({ amount: 100001 }).success).toBe(false);
  });

  it("rejects non-integer amounts", () => {
    expect(topUpSchema.safeParse({ amount: 100.5 }).success).toBe(false);
  });
});
