import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Tell us your name").max(40, "That's a bit long").optional(),
  avatarColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Pick a valid colour")
    .optional(),
});

/** Update the current user's profile (name, avatar colour). */
export async function PATCH(request: Request) {
  const user = await requireUser();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details" },
      { status: 400 },
    );
  }

  const data: Record<string, string> = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name.trim();
  if (parsed.data.avatarColor !== undefined) data.avatarColor = parsed.data.avatarColor;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  await prisma.user.update({ where: { id: user.id }, data });

  return NextResponse.json({ ok: true });
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
  })
  .required();

/** Change the current user's password. */
export async function PUT(request: Request) {
  const user = await requireUser();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details" },
      { status: 400 },
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: "Your current password is incorrect" },
      { status: 401 },
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
