import { describe, it, expect } from "vitest";
import { computeLeaderboard } from "@/lib/leaderboard";
import type { Bet, BetSide, Wager } from "@prisma/client";

type TestBet = Bet & {
  sides: BetSide[];
  wagers: (Wager & { user: { id: string; name: string; avatarColor: string } })[];
};

const members = [
  { userId: "u1", user: { id: "u1", name: "Josh", avatarColor: "#7c3aed" } },
  { userId: "u2", user: { id: "u2", name: "Mark", avatarColor: "#db2777" } },
  { userId: "u3", user: { id: "u3", name: "Jenny", avatarColor: "#0d9488" } },
];

function makeSettledBet(
  outcomeLabel: string,
  wagers: { userId: string; side: "yes" | "no"; amount: number }[],
): TestBet {
  const yesSide: BetSide = { id: "yes", betId: "b1", label: "Yes" } as BetSide;
  const noSide: BetSide = { id: "no", betId: "b1", label: "No" } as BetSide;

  return {
    id: "b1",
    groupId: "g1",
    creatorId: "u1",
    title: "Test bet",
    description: null,
    amount: 1000,
    status: "settled",
    outcome: outcomeLabel,
    createdAt: new Date(),
    closesAt: new Date(),
    settledAt: new Date(),
    sides: [yesSide, noSide],
    wagers: wagers.map((w, i) => ({
      id: `w${i}`,
      betId: "b1",
      sideId: w.side === "yes" ? "yes" : "no",
      userId: w.userId,
      amount: w.amount,
      createdAt: new Date(),
      user: {
        id: w.userId,
        name: members.find((m) => m.userId === w.userId)?.user.name ?? "?",
        avatarColor: members.find((m) => m.userId === w.userId)?.user.avatarColor ?? "#000",
      },
    })),
  };
}

describe("computeLeaderboard", () => {
  it("returns all members even with no settled bets", () => {
    const result = computeLeaderboard([], members);
    expect(result).toHaveLength(3);
    expect(result.every((e) => e.netProfit === 0)).toBe(true);
    expect(result.every((e) => e.winRate === 0)).toBe(true);
  });

  it("computes correct win/loss and net profit", () => {
    const bet = makeSettledBet("Yes", [
      { userId: "u1", side: "yes", amount: 1000 },
      { userId: "u2", side: "no", amount: 1000 },
    ]);

    const result = computeLeaderboard([bet], members);

    const josh = result.find((e) => e.userId === "u1")!;
    const mark = result.find((e) => e.userId === "u2")!;

    // Josh won: bet 1000, pot 2000, gets 2000, profit = +1000
    expect(josh.betsWon).toBe(1);
    expect(josh.betsLost).toBe(0);
    expect(josh.netProfit).toBe(1000);
    expect(josh.winRate).toBe(100);

    // Mark lost: bet 1000, gets 0, profit = -1000
    expect(mark.betsWon).toBe(0);
    expect(mark.betsLost).toBe(1);
    expect(mark.netProfit).toBe(-1000);
    expect(mark.winRate).toBe(0);
  });

  it("sorts by net profit descending", () => {
    const bet1 = makeSettledBet("Yes", [
      { userId: "u1", side: "yes", amount: 2000 },
      { userId: "u2", side: "no", amount: 1000 },
      { userId: "u3", side: "yes", amount: 1000 },
    ]);

    const result = computeLeaderboard([bet1], members);

    // u1: bet 2000, pot 4000, winning pot 3000, gets 2000/3000*4000 = 2666, profit +666
    // u3: bet 1000, gets 1000/3000*4000 = 1333, profit +333
    // u2: bet 1000, lost, profit -1000
    expect(result[0].userId).toBe("u1");
    expect(result[1].userId).toBe("u3");
    expect(result[2].userId).toBe("u2");
    expect(result[0].netProfit).toBeGreaterThan(result[1].netProfit);
    expect(result[1].netProfit).toBeGreaterThan(result[2].netProfit);
  });

  it("ignores open and cancelled bets", () => {
    const openBet = { ...makeSettledBet("Yes", []) } as TestBet;
    openBet.status = "open";
    const cancelledBet = { ...makeSettledBet("Yes", []) } as TestBet;
    cancelledBet.status = "cancelled";

    const result = computeLeaderboard([openBet, cancelledBet], members);
    expect(result.every((e) => e.betsWon === 0)).toBe(true);
  });
});
