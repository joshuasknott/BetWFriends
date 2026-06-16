import { notFound } from "next/navigation";
import { BetDetailClient } from "@/components/bet-detail";

export const dynamic = "force-dynamic";

export default async function BetPage({
  params,
}: {
  params: Promise<{ betId: string }>;
}) {
  const { betId } = await params;
  if (!betId) notFound();

  // The BetDetailClient loads everything reactively via Convex (live wagers,
  // comments, balance) — no server-side fetch needed here.
  return <BetDetailClient betId={betId} />;
}
