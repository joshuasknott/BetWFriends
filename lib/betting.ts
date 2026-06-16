import type { WagerLike } from "@/lib/types";

/**
 * Pure betting math — no database access.
 *
 * The DB-mutating `resolveBet`/`cancelBet` functions that used to live here
 * have moved into `convex/bets.ts` as Convex mutations (which are atomic by
 * default). Only the pure payout calculation stays, so it remains unit-testable
 * and free of any ORM dependency.
 */

/** Outcome of resolving a bet — who gets what. */
export type PayoutResult = {
  totalPot: number;
  winningPot: number;
  winners: { userId: string; amount: number }[];
};

/**
 * Compute payouts for a bet given a winning side.
 * Winners split the total pot proportionally to their stake.
 * If no winners (everyone bet the losing side), stakes are refunded.
 */
export function computePayouts(
  wagers: WagerLike[],
  winningSideId: string | null,
): PayoutResult {
  const totalPot = wagers.reduce((sum, w) => sum + w.amount, 0);

  if (winningSideId === null) {
    // Refund everyone
    return {
      totalPot,
      winningPot: totalPot,
      winners: wagers.map((w) => ({ userId: w.userId, amount: w.amount })),
    };
  }

  const winningWagers = wagers.filter((w) => w.sideId === winningSideId);
  const winningPot = winningWagers.reduce((sum, w) => sum + w.amount, 0);

  if (winningPot === 0) {
    // No winners — refund everyone their stake
    return {
      totalPot,
      winningPot,
      winners: wagers.map((w) => ({ userId: w.userId, amount: w.amount })),
    };
  }

  // Each winner gets back their share: (their stake / total winning stakes) * totalPot
  const winners = winningWagers.map((w) => ({
    userId: w.userId,
    amount: Math.floor((w.amount / winningPot) * totalPot),
  }));

  return { totalPot, winningPot, winners };
}
