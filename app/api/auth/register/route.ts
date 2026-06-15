import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { registerSchema } from "@/lib/validation";
import { colorFromString } from "@/lib/utils";
import { isMockPayments } from "@/lib/payments";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details" },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  // Give a friendly welcome balance so new users can start betting immediately.
  // In real (live) mode this would be 0; mock/demo gives a little to play with.
  const startingBalance = isMockPayments() ? 2000 : 0; // £20 in mock mode

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      avatarColor: colorFromString(name),
      balance: startingBalance,
    },
  });

  if (startingBalance > 0) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "topup",
        amount: startingBalance,
        note: "Welcome bonus 🎉",
        reference: "welcome-bonus",
      },
    });
  }

  await createSession(user.id);

  return NextResponse.json({ ok: true, userId: user.id });
}
