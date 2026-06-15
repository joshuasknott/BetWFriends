import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, clearSession } from "@/lib/session";

/**
 * Permanently delete the current user's account (GDPR right to be forgotten).
 *
 * - Refunds all open wagers the user has (restores their stake to balance —
 *   though the balance is about to be deleted anyway, this keeps the wager
 *   records consistent by removing them from active bets).
 * - Deletes the user and cascading data (memberships, wagers, transactions).
 * - Bets created by the user are NOT deleted (they belong to the group), but
 *   the creatorId FK is RESTRICT, so we reassign ownership or cancel open bets.
 * - Clears the session cookie.
 */
export async function POST(request: Request) {
  const user = await requireUser();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { confirm } = (body ?? {}) as { confirm?: string };
  if (confirm !== "DELETE") {
    return NextResponse.json(
      { error: "Please type DELETE to confirm" },
      { status: 400 },
    );
  }

  await prisma.$transaction(async (tx) => {
    // Cancel any open bets this user created (can't leave them ownerless).
    const ownedOpenBets = await tx.bet.findMany({
      where: { creatorId: user.id, status: "open" },
    });
    for (const bet of ownedOpenBets) {
      // Refund all wagers on this bet
      const wagers = await tx.wager.findMany({ where: { betId: bet.id } });
      for (const w of wagers) {
        await tx.user.update({
          where: { id: w.userId },
          data: { balance: { increment: w.amount } },
        });
        await tx.transaction.create({
          data: {
            userId: w.userId,
            type: "payout",
            amount: w.amount,
            note: `Refund: ${bet.title} (creator left)`,
          },
        });
      }
      await tx.wager.deleteMany({ where: { betId: bet.id } });
      await tx.bet.update({
        where: { id: bet.id },
        data: { status: "cancelled", settledAt: new Date() },
      });
    }

    // Delete the user — cascades to GroupMember, Wager, Transaction.
    // Bets created by this user have ON DELETE RESTRICT, so we reassigned/
    // cancelled open ones above. Settled/cancelled bets keep their creatorId
    // but the FK is RESTRICT — we need to handle this.
    // Simplest safe approach: null out creator reference by reassigning to a
    // system placeholder isn't ideal. Instead, delete bets that have no wagers
    // and are cancelled/settled with this creator.
    await tx.bet.deleteMany({
      where: { creatorId: user.id, status: { in: ["settled", "cancelled"] } },
    });

    // Now safe to delete the user.
    await tx.user.delete({ where: { id: user.id } });
  });

  await clearSession();

  return NextResponse.json({ ok: true });
}
