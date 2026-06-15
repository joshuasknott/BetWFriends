import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { createBetSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await requireUser();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = createBetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid bet" },
      { status: 400 },
    );
  }

  const { groupId, title, description, amount, durationHours, yesLabel, noLabel } =
    parsed.data;

  // Must be a member to create a bet
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: user.id, groupId } },
  });
  if (!membership) {
    return NextResponse.json(
      { error: "You're not a member of that group" },
      { status: 403 },
    );
  }

  const closesAt = new Date(Date.now() + durationHours * 3_600_000);

  const bet = await prisma.bet.create({
    data: {
      groupId,
      creatorId: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      amount,
      closesAt,
      sides: {
        create: [{ label: yesLabel }, { label: noLabel }],
      },
    },
    include: { sides: true },
  });

  return NextResponse.json({ ok: true, betId: bet.id });
}
