"use client";

import { useState } from "react";
import { BetCard } from "@/components/bet-card";

type BetWithRelations = React.ComponentProps<typeof BetCard>["bet"];

type Filter = "all" | "won" | "lost" | "void";

/**
 * Client-side filter for resolved bets in a group.
 * Shows filter chips and filters the list by outcome relative to the current user.
 */
export function BetHistoryFilter({
  bets,
  userId,
}: {
  bets: BetWithRelations[];
  userId: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = bets.filter((bet) => {
    if (filter === "all") return true;
    if (filter === "void") return bet.status === "void";

    const myWager = bet.wagers.find((w) => w.userId === userId);
    if (!myWager) return false;

    const winningSide = bet.sides.find((s) => s.label === bet.outcome);
    if (!winningSide) return false;

    const isWinner = myWager.sideId === winningSide.id;
    return filter === "won" ? isWinner : !isWinner;
  });

  const counts = {
    all: bets.length,
    won: bets.filter((b) => {
      const w = b.wagers.find((wg) => wg.userId === userId);
      const ws = b.sides.find((s) => s.label === b.outcome);
      return w && ws && w.sideId === ws.id;
    }).length,
    lost: bets.filter((b) => {
      const w = b.wagers.find((wg) => wg.userId === userId);
      const ws = b.sides.find((s) => s.label === b.outcome);
      return w && ws && w.sideId !== ws.id;
    }).length,
    void: bets.filter((b) => b.status === "void").length,
  };

  const chips: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "won", label: "Won", count: counts.won },
    { key: "lost", label: "Lost", count: counts.lost },
    { key: "void", label: "Void", count: counts.void },
  ];

  if (bets.length === 0) {
    return (
      <div className="rounded-[1.5rem] bg-brand-50 p-10 text-center">
        <div className="text-4xl">🏁</div>
        <p className="mt-3 text-sm font-bold text-ink-soft">
          No settled bets yet. Once bets close and get settled, they'll show up here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setFilter(chip.key)}
            className={`rounded-full px-4 py-2 text-xs font-black transition ${
              filter === chip.key
                ? "bg-brand-600 text-white"
                : "bg-white text-ink-soft ring-1 ring-brand-200 hover:bg-brand-50"
            }`}
          >
            {chip.label} {chip.count > 0 && `(${chip.count})`}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-[1.5rem] bg-brand-50 p-8 text-center text-sm font-semibold text-ink-soft">
            No bets match this filter.
          </div>
        ) : (
          filtered.map((bet) => <BetCard key={bet.id} bet={bet} href={`/bets/${bet.id}`} />)
        )}
      </div>
    </div>
  );
}
