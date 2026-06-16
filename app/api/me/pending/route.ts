import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

/**
 * Returns counts of things the user should be aware of:
 * - bets they created that are closed and awaiting settlement
 * - bets they wagered on that recently settled
 */
export async function GET() {
  const user = await requireUser();

  const [awaitingSettlement, recentSettlements] = await Promise.all([
    prisma.bet.count({
      where: {
        creatorId: user.id,
        status: "open",
        closesAt: { lt: new Date() }, // past closing time
      },
    }),
    prisma.wager.count({
      where: {
        userId: user.id,
        bet: { status: "settled" },
        // Only count wagers without a "seen" flag — for now, just return count
      },
    }),
  ]);

  return NextResponse.json({
    awaitingSettlement,
    recentSettlements,
    total: awaitingSettlement,
  });
}
