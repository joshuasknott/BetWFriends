import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { joinGroupSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await requireUser();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = joinGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid code" },
      { status: 400 },
    );
  }

  const group = await prisma.group.findUnique({
    where: { inviteCode: parsed.data.inviteCode },
  });

  if (!group) {
    return NextResponse.json(
      { error: "No group found with that code" },
      { status: 404 },
    );
  }

  const existing = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: user.id, groupId: group.id } },
  });

  if (existing) {
    return NextResponse.json({
      ok: true,
      groupId: group.id,
      alreadyMember: true,
    });
  }

  await prisma.groupMember.create({
    data: { userId: user.id, groupId: group.id },
  });

  return NextResponse.json({ ok: true, groupId: group.id });
}
