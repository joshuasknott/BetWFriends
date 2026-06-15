import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { BetDetailClient } from "@/components/bet-detail";

export const dynamic = "force-dynamic";

export default async function BetPage({
  params,
}: {
  params: Promise<{ betId: string }>;
}) {
  const user = await requireUser();
  const { betId } = await params;

  const bet = await prisma.bet.findUnique({
    where: { id: betId },
    include: {
      group: {
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, avatarColor: true } },
            },
          },
        },
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

  if (!bet) notFound();
  const isMember = bet.group.members.some((m) => m.userId === user.id);
  if (!isMember) notFound();

  const myWager = bet.wagers.find((w) => w.userId === user.id) ?? null;

  const initial = {
    bet: {
      id: bet.id,
      title: bet.title,
      description: bet.description,
      amount: bet.amount,
      status: bet.status,
      outcome: bet.outcome,
      createdAt: bet.createdAt.toISOString(),
      closesAt: bet.closesAt.toISOString(),
      settledAt: bet.settledAt?.toISOString() ?? null,
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
      createdAt: w.createdAt.toISOString(),
      user: w.user,
    })),
    creator: bet.creator,
    myWager: myWager
      ? { id: myWager.id, sideId: myWager.sideId, amount: myWager.amount }
      : null,
    myBalance: user.balance,
    isCreator: bet.creator.id === user.id,
  };

  return <BetDetailClient betId={betId} initial={initial} />;
}
