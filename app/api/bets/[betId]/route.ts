import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ betId: string }> },
) {
  const user = await requireUser();
  const { betId } = await params;

  const bet = await prisma.bet.findUnique({
    where: { id: betId },
    include: {
      group: {
        include: { members: { include: { user: { select: { id: true, name: true, avatarColor: true } } } } },
      },
      sides: true,
      wagers: {
        include: {
          user: { select: { id: true, name: true, avatarColor: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      creator: { select: { id: true, name: true, avatarColor: true } },
    },
  });

  if (!bet) {
    return NextResponse.json({ error: "Bet not found" }, { status: 404 });
  }

  const isMember = bet.group.members.some((m) => m.userId === user.id);
  if (!isMember) {
    return NextResponse.json(
      { error: "You're not in this group" },
      { status: 403 },
    );
  }

  const myWager = bet.wagers.find((w) => w.userId === user.id) ?? null;

  return NextResponse.json({
    bet: {
      id: bet.id,
      title: bet.title,
      description: bet.description,
      amount: bet.amount,
      status: bet.status,
      outcome: bet.outcome,
      createdAt: bet.createdAt,
      closesAt: bet.closesAt,
      settledAt: bet.settledAt,
    },
    group: {
      id: bet.group.id,
      name: bet.group.name,
      emoji: bet.group.emoji,
      color: bet.group.color,
    },
    sides: bet.sides.map((s) => ({ id: s.id, label: s.label })),
    wagers: bet.wagers.map((w) => ({
      id: w.id,
      sideId: w.sideId,
      amount: w.amount,
      createdAt: w.createdAt,
      user: w.user,
    })),
    creator: bet.creator,
    myWager,
    myBalance: user.balance,
    isCreator: bet.creator.id === user.id,
  });
}
