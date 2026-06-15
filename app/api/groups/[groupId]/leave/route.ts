import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

/**
 * Leave a group. Refunds any open wagers the user has in this group.
 * If the user is the only member, the group and its bets are deleted.
 * Open bets created by the leaving user are cancelled and refunded.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const user = await requireUser();
  const { groupId } = await params;

  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: user.id, groupId } },
  });
  if (!membership) {
    return NextResponse.json(
      { error: "You're not in this group" },
      { status: 404 },
    );
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { _count: { select: { members: true } } },
  });
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    // Refund this user's open wagers in the group
    const openBets = await tx.bet.findMany({
      where: { groupId, status: "open" },
    });
    const userWagers = await tx.wager.findMany({
      where: { userId: user.id, betId: { in: openBets.map((b) => b.id) } },
    });
    for (const w of userWagers) {
      await tx.user.update({
        where: { id: user.id },
        data: { balance: { increment: w.amount } },
      });
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "stake",
          amount: w.amount,
          note: "Refund: left group",
        },
      });
    }
    await tx.wager.deleteMany({
      where: { userId: user.id, betId: { in: openBets.map((b) => b.id) } },
    });

    // Cancel open bets created by the leaving user
    const ownedOpenBets = openBets.filter((b) => b.creatorId === user.id);
    for (const bet of ownedOpenBets) {
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

    // Remove the membership
    await tx.groupMember.delete({
      where: { userId_groupId: { userId: user.id, groupId } },
    });

    // If this was the last member, delete the group entirely
    const remaining = await tx.groupMember.count({
      where: { groupId },
    });
    if (remaining === 0) {
      await tx.bet.deleteMany({ where: { groupId } });
      await tx.group.delete({ where: { id: groupId } });
    }
  });

  return NextResponse.json({ ok: true });
}
