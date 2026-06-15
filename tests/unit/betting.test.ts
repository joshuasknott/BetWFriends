import { describe, it, expect } from "vitest";
import { computePayouts } from "@/lib/betting";
import type { Wager } from "@prisma/client";

function makeWager(
  userId: string,
  sideId: string,
  amount: number,
): Wager {
  return {
    id: `w-${userId}-${sideId}`,
    betId: "bet1",
    sideId,
    userId,
    amount,
    createdAt: new Date(),
  } as Wager;
}

describe("computePayouts", () => {
  it("splits the pot proportionally among winners", () => {
    const sideA = "side-a";
    const sideB = "side-b";
    const wagers = [
      makeWager("u1", sideA, 1000), // wins
      makeWager("u2", sideA, 3000), // wins
      makeWager("u3", sideB, 1000), // loses
    ];

    const result = computePayouts(wagers, sideA);

    expect(result.totalPot).toBe(5000);
    expect(result.winningPot).toBe(4000);
    expect(result.winners).toHaveLength(2);

    // u1 gets 1000/4000 * 5000 = 1250
    // u2 gets 3000/4000 * 5000 = 3750
    const u1 = result.winners.find((w) => w.userId === "u1");
    const u2 = result.winners.find((w) => w.userId === "u2");
    expect(u1?.amount).toBe(1250);
    expect(u2?.amount).toBe(3750);
  });

  it("refunds everyone when winningSideId is null (void)", () => {
    const sideA = "side-a";
    const sideB = "side-b";
    const wagers = [
      makeWager("u1", sideA, 500),
      makeWager("u2", sideB, 1500),
    ];

    const result = computePayouts(wagers, null);

    expect(result.totalPot).toBe(2000);
    expect(result.winningPot).toBe(2000);
    expect(result.winners).toHaveLength(2);
    expect(result.winners.find((w) => w.userId === "u1")?.amount).toBe(500);
    expect(result.winners.find((w) => w.userId === "u2")?.amount).toBe(1500);
  });

  it("refunds everyone when no one bet the winning side", () => {
    const sideA = "side-a";
    const sideB = "side-b";
    const wagers = [
      makeWager("u1", sideA, 1000),
      makeWager("u2", sideA, 2000),
    ];

    // sideB won but nobody bet on it
    const result = computePayouts(wagers, sideB);

    expect(result.totalPot).toBe(3000);
    expect(result.winningPot).toBe(0);
    expect(result.winners).toHaveLength(2);
    // Everyone gets their stake back
    expect(result.winners.find((w) => w.userId === "u1")?.amount).toBe(1000);
    expect(result.winners.find((w) => w.userId === "u2")?.amount).toBe(2000);
  });

  it("handles a single winner taking the whole pot", () => {
    const sideA = "side-a";
    const sideB = "side-b";
    const wagers = [
      makeWager("u1", sideA, 1000),
      makeWager("u2", sideB, 500),
      makeWager("u3", sideB, 500),
    ];

    const result = computePayouts(wagers, sideA);

    expect(result.totalPot).toBe(2000);
    expect(result.winners).toHaveLength(1);
    expect(result.winners[0]?.amount).toBe(2000);
  });

  it("handles equal stakes splitting exactly", () => {
    const sideA = "side-a";
    const wagers = [
      makeWager("u1", sideA, 1000),
      makeWager("u2", sideA, 1000),
      makeWager("u3", "side-b", 1000),
    ];

    const result = computePayouts(wagers, sideA);

    expect(result.winners).toHaveLength(2);
    // 3000 pot split 50/50 = 1500 each
    expect(result.winners.find((w) => w.userId === "u1")?.amount).toBe(1500);
    expect(result.winners.find((w) => w.userId === "u2")?.amount).toBe(1500);
  });

  it("handles empty wagers", () => {
    const result = computePayouts([], "side-a");
    expect(result.totalPot).toBe(0);
    expect(result.winningPot).toBe(0);
    expect(result.winners).toHaveLength(0);
  });

  it("floors fractional payouts (no fractional pence)", () => {
    const sideA = "side-a";
    const wagers = [
      makeWager("u1", sideA, 100), // 100/300 * 1000 = 333.33 -> 333
      makeWager("u2", sideA, 200), // 200/300 * 1000 = 666.66 -> 666
      makeWager("u3", "side-b", 700),
    ];

    const result = computePayouts(wagers, sideA);
    const u1 = result.winners.find((w) => w.userId === "u1");
    const u2 = result.winners.find((w) => w.userId === "u2");
    expect(u1?.amount).toBe(333);
    expect(u2?.amount).toBe(666);
    // 333 + 666 = 999, so 1p is lost to rounding (acceptable)
  });
});
