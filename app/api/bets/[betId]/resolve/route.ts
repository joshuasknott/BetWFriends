import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { resolveBet } from "@/lib/betting";

/** Resolve a bet: declare the winning side (or void/refund). Creator only. */
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

  const { winningSideId } = (body ?? {}) as { winningSideId?: string | null };

  const bet = await prisma.bet.findUnique({
    where: { id: betId },
    include: { sides: true },
  });
  if (!bet) {
    return NextResponse.json({ error: "Bet not found" }, { status: 404 });
  }
  if (bet.creatorId !== user.id) {
    return NextResponse.json(
      { error: "Only the bet creator can settle this" },
      { status: 403 },
    );
  }
  if (bet.status === "settled") {
    return NextResponse.json({ error: "Already settled" }, { status: 400 });
  }

  // winningSideId === null means void/refund
  const winningSide =
    winningSideId == null
      ? null
      : bet.sides.find((s) => s.id === winningSideId);
  if (winningSideId != null && !winningSide) {
    return NextResponse.json({ error: "Invalid side" }, { status: 400 });
  }

  await resolveBet(
    bet,
    winningSide ? winningSide.id : null,
    winningSide ? winningSide.label : null,
  );

  return NextResponse.json({ ok: true });
}
