import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { startTopUp } from "@/lib/payments";
import { topUpSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await requireUser();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = topUpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid amount" },
      { status: 400 },
    );
  }

  const result = await startTopUp(user.id, parsed.data.amount);
  return NextResponse.json(result);
}
