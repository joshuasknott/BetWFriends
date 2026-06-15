import { prisma } from "@/lib/prisma";
import type { Bet, Wager } from "@prisma/client";

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
  wagers: Wager[],
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

/**
 * Resolve a bet: mark it settled, credit winners, create transactions.
 * Must be called in a transaction. The caller has already validated permissions.
 */
export async function resolveBet(
  bet: Bet,
  winningSideId: string | null,
  outcomeLabel: string | null,
): Promise<PayoutResult> {
  const wagers = await prisma.wager.findMany({ where: { betId: bet.id } });
  const result = computePayouts(wagers, winningSideId);

  // Credit each winner and record transactions
  for (const winner of result.winners) {
    if (winner.amount <= 0) continue;
    await prisma.user.update({
      where: { id: winner.userId },
      data: { balance: { increment: winner.amount } },
    });
    await prisma.transaction.create({
      data: {
        userId: winner.userId,
        type: "payout",
        amount: winner.amount,
        note: `Winnings: ${bet.title}`,
      },
    });
  }

  await prisma.bet.update({
    where: { id: bet.id },
    data: {
      status: "settled",
      outcome: outcomeLabel,
      settledAt: new Date(),
    },
  });

  return result;
}

/**
 * Refund all wagers for a cancelled bet.
 */
export async function cancelBet(bet: Bet): Promise<void> {
  const wagers = await prisma.wager.findMany({ where: { betId: bet.id } });
  for (const w of wagers) {
    await prisma.user.update({
      where: { id: w.userId },
      data: { balance: { increment: w.amount } },
    });
    await prisma.transaction.create({
      data: {
        userId: w.userId,
        type: "payout",
        amount: w.amount,
        note: `Refund: ${bet.title}`,
      },
    });
  }
  await prisma.bet.update({
    where: { id: bet.id },
    data: { status: "cancelled", settledAt: new Date() },
  });
}

export type BetWithDetails = Bet & {
  sides: { id: string; label: string; _count?: { wagers: number } }[];
  wagers: Wager[];
};
