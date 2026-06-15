import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { z } from "zod";

const updateGroupSchema = z.object({
  name: z.string().min(1, "Group needs a name").max(50).optional(),
  description: z.string().max(200).optional().or(z.literal("")),
  emoji: z.string().min(1).max(8).optional(),
  color: z.string().min(1).optional(),
});

/** Update group settings. Creator only. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const user = await requireUser();
  const { groupId } = await params;

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }
  if (group.createdById !== user.id) {
    return NextResponse.json(
      { error: "Only the group creator can change settings" },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = updateGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details" },
      { status: 400 },
    );
  }

  const data: Record<string, string | null> = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name.trim();
  if (parsed.data.emoji !== undefined) data.emoji = parsed.data.emoji;
  if (parsed.data.color !== undefined) data.color = parsed.data.color;
  if (parsed.data.description !== undefined) {
    data.description = parsed.data.description.trim() || null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  await prisma.group.update({ where: { id: groupId }, data });

  return NextResponse.json({ ok: true });
}
