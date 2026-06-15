import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { cancelBet } from "@/lib/betting";

/** Cancel a bet and refund everyone. Creator only. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ betId: string }> },
) {
  const user = await requireUser();
  const { betId } = await params;

  const bet = await prisma.bet.findUnique({ where: { id: betId } });
  if (!bet) {
    return NextResponse.json({ error: "Bet not found" }, { status: 404 });
  }
  if (bet.creatorId !== user.id) {
    return NextResponse.json(
      { error: "Only the bet creator can cancel this" },
      { status: 403 },
    );
  }
  if (bet.status === "settled" || bet.status === "cancelled") {
    return NextResponse.json({ error: "Can't cancel this bet" }, { status: 400 });
  }

  await cancelBet(bet);

  return NextResponse.json({ ok: true });
}
