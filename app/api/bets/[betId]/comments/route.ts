import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const commentSchema = z.object({
  text: z
    .string()
    .min(1, "Say something!")
    .max(500, "Keep it under 500 characters")
    .transform((v) => v.trim()),
});

/** List comments for a bet (members only). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ betId: string }> },
) {
  const user = await requireUser();
  const { betId } = await params;

  const bet = await prisma.bet.findUnique({
    where: { id: betId },
    include: { group: { include: { members: true } } },
  });
  if (!bet) {
    return NextResponse.json({ error: "Bet not found" }, { status: 404 });
  }

  const isMember = bet.group.members.some((m) => m.userId === user.id);
  if (!isMember) {
    return NextResponse.json({ error: "Not in this group" }, { status: 403 });
  }

  const comments = await prisma.comment.findMany({
    where: { betId },
    include: {
      user: { select: { id: true, name: true, avatarColor: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ comments });
}

/** Post a comment on a bet (members only). */
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

  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid comment" },
      { status: 400 },
    );
  }

  const bet = await prisma.bet.findUnique({
    where: { id: betId },
    include: { group: { include: { members: true } } },
  });
  if (!bet) {
    return NextResponse.json({ error: "Bet not found" }, { status: 404 });
  }

  const isMember = bet.group.members.some((m) => m.userId === user.id);
  if (!isMember) {
    return NextResponse.json({ error: "Join the group to comment" }, { status: 403 });
  }

  const comment = await prisma.comment.create({
    data: {
      betId,
      userId: user.id,
      text: parsed.data.text,
    },
    include: {
      user: { select: { id: true, name: true, avatarColor: true } },
    },
  });

  return NextResponse.json({ ok: true, comment });
}

/** Delete a comment on this bet (author only). */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ betId: string }> },
) {
  const user = await requireUser();
  const { betId } = await params;

  const url = new URL(request.url);
  const commentId = url.searchParams.get("commentId");
  if (!commentId) {
    return NextResponse.json({ error: "Missing commentId" }, { status: 400 });
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });
  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }
  if (comment.betId !== betId) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }
  if (comment.userId !== user.id) {
    return NextResponse.json(
      { error: "You can only delete your own comments" },
      { status: 403 },
    );
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return NextResponse.json({ ok: true });
}
