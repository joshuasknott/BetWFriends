import type { UserRef } from "@/lib/types";

export type LeaderboardEntry = {
  userId: string;
  name: string;
  avatarColor: string;
  betsWon: number;
  betsLost: number;
  totalWagered: number;
  totalWon: number;
  netProfit: number;
  winRate: number;
};

/**
 * Compute a group leaderboard from settled bets.
 * A win = the user's wager was on the winning side.
 * Net profit = total winnings - total stakes (across all settled bets in the group).
 */
export function computeLeaderboard(
  bets: {
    id: string;
    status: string;
    outcome: string | null;
    sides: { id: string; label: string }[];
    wagers: { sideId: string; userId: string; amount: number; user: UserRef }[];
  }[],
  members: { userId: string; user: UserRef }[],
): LeaderboardEntry[] {
  const settled = bets.filter((b) => b.status === "settled" && b.outcome);
  const entries = new Map<string, LeaderboardEntry>();

  // Initialize all members with zeros
  for (const m of members) {
    entries.set(m.userId, {
      userId: m.userId,
      name: m.user.name,
      avatarColor: m.user.avatarColor,
      betsWon: 0,
      betsLost: 0,
      totalWagered: 0,
      totalWon: 0,
      netProfit: 0,
      winRate: 0,
    });
  }

  for (const bet of settled) {
    const winningSide = bet.sides.find((s) => s.label === bet.outcome);
    if (!winningSide) continue;

    for (const wager of bet.wagers) {
      const entry = entries.get(wager.userId);
      if (!entry) continue;

      const isWinner = wager.sideId === winningSide.id;
      entry.totalWagered += wager.amount;

      if (isWinner) {
        entry.betsWon += 1;
        // Compute proportional winnings
        const totalPot = bet.wagers.reduce((s, w) => s + w.amount, 0);
        const winningPot = bet.wagers
          .filter((w) => w.sideId === winningSide.id)
          .reduce((s, w) => s + w.amount, 0);
        const winnings =
          winningPot > 0
            ? Math.floor((wager.amount / winningPot) * totalPot)
            : wager.amount;
        entry.totalWon += winnings;
        entry.netProfit += winnings - wager.amount;
      } else {
        entry.betsLost += 1;
        entry.netProfit -= wager.amount;
      }
    }
  }

  // Compute win rates and sort by net profit descending
  const list = [...entries.values()];
  for (const e of list) {
    const total = e.betsWon + e.betsLost;
    e.winRate = total > 0 ? (e.betsWon / total) * 100 : 0;
  }

  return list.sort((a, b) => b.netProfit - a.netProfit);
}
