import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

/** Place (or update) a wager on a bet. The stake equals the bet's amount. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ betId: string }> },
) {
  const user = await requireUser();
  const { betId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { sideId } = (body ?? {}) as { sideId?: string };
  if (!sideId) {
    return NextResponse.json({ error: "Pick a side" }, { status: 400 });
  }

  const bet = await prisma.bet.findUnique({
    where: { id: betId },
    include: { sides: true, group: { include: { members: true } } },
  });

  if (!bet) {
    return NextResponse.json({ error: "Bet not found" }, { status: 404 });
  }
  if (bet.status !== "open") {
    return NextResponse.json(
      { error: "This bet isn't open for wagers" },
      { status: 400 },
    );
  }
  if (new Date(bet.closesAt).getTime() <= Date.now()) {
    // Auto-close expired bet
    await prisma.bet.update({ where: { id: betId }, data: { status: "closed" } });
    return NextResponse.json(
      { error: "Betting has closed on this one" },
      { status: 400 },
    );
  }

  const isMember = bet.group.members.some((m) => m.userId === user.id);
  if (!isMember) {
    return NextResponse.json(
      { error: "Join the group to bet on this" },
      { status: 403 },
    );
  }

  const side = bet.sides.find((s) => s.id === sideId);
  if (!side) {
    return NextResponse.json({ error: "Invalid side" }, { status: 400 });
  }

  // Use a transaction to ensure balance + wager consistency
  const result = await prisma.$transaction(async (tx) => {
    const fresh = await tx.user.findUniqueOrThrow({ where: { id: user.id } });
    const existingWager = await tx.wager.findUnique({
      where: { betId_userId: { betId, userId: user.id } },
    });

    // If switching sides, refund old stake first (net effect handled below)
    const previousAmount = existingWager?.amount ?? 0;
    const effectiveCost = bet.amount - previousAmount;

    if (effectiveCost > 0 && fresh.balance < effectiveCost) {
      throw new Error("Not enough balance — top up your wallet first");
    }

    if (existingWager) {
      await tx.wager.update({
        where: { id: existingWager.id },
        data: { sideId, amount: bet.amount },
      });
    } else {
      await tx.wager.create({
        data: { betId, userId: user.id, sideId, amount: bet.amount },
      });
    }

    if (effectiveCost !== 0) {
      await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: effectiveCost } },
      });
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "stake",
          amount: -effectiveCost,
          note: `Stake: ${bet.title}`,
        },
      });
    }

    return { balance: fresh.balance - effectiveCost };
  });

  return NextResponse.json({ ok: true, balance: result.balance });
}

/** Remove your wager (if the bet is still open). Refunds the stake. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ betId: string }> },
) {
  const user = await requireUser();
  const { betId } = await params;

  const bet = await prisma.bet.findUnique({ where: { id: betId } });
  if (!bet) {
    return NextResponse.json({ error: "Bet not found" }, { status: 404 });
  }
  if (bet.status !== "open" || new Date(bet.closesAt) <= new Date()) {
    return NextResponse.json(
      { error: "Can't pull out — betting has closed" },
      { status: 400 },
    );
  }

  await prisma.$transaction(async (tx) => {
    const wager = await tx.wager.findUnique({
      where: { betId_userId: { betId, userId: user.id } },
    });
    if (!wager) return;
    await tx.wager.delete({ where: { id: wager.id } });
    await tx.user.update({
      where: { id: user.id },
      data: { balance: { increment: wager.amount } },
    });
    await tx.transaction.create({
      data: {
        userId: user.id,
        type: "stake",
        amount: wager.amount,
        note: `Withdrawn stake: ${bet.title}`,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
