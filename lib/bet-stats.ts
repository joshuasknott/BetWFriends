import type { Bet, BetSide, Wager } from "@prisma/client";

export type BetStat = {
  id: string;
  label: string;
  count: number;
  pot: number; // total staked on this side
};

export type BetStats = {
  totalPot: number;
  totalWagers: number;
  sides: BetStat[];
  isClosed: boolean; // past closesAt
};

export function getBetStats(
  bet: Bet & { sides: BetSide[]; wagers: Wager[] },
): BetStats {
  const sides: BetStat[] = bet.sides.map((s) => {
    const sideWagers = bet.wagers.filter((w) => w.sideId === s.id);
    return {
      id: s.id,
      label: s.label,
      count: sideWagers.length,
      pot: sideWagers.reduce((sum, w) => sum + w.amount, 0),
    };
  });

  const totalPot = bet.wagers.reduce((sum, w) => sum + w.amount, 0);

  return {
    totalPot,
    totalWagers: bet.wagers.length,
    sides,
    isClosed: new Date(bet.closesAt).getTime() <= Date.now(),
  };
}

export function getOdds(sides: BetStat[], sideId: string): number | null {
  const total = sides.reduce((s, x) => s + x.pot, 0);
  const side = sides.find((s) => s.id === sideId);
  if (!side || side.pot === 0) return null;
  return total / side.pot; // decimal odds (returns per unit staked)
}
