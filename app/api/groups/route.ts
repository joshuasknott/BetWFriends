import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { createGroupSchema } from "@/lib/validation";
import { generateInviteCode } from "@/lib/utils";

export async function POST(request: Request) {
  const user = await requireUser();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = createGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details" },
      { status: 400 },
    );
  }

  const { name, description, emoji, color } = parsed.data;

  const group = await prisma.group.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      emoji,
      color,
      inviteCode: generateInviteCode(),
      createdById: user.id,
      members: {
        create: { userId: user.id },
      },
    },
  });

  return NextResponse.json({ ok: true, groupId: group.id });
}
