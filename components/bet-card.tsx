import Link from "next/link";
import { Avatar } from "@/components/brand";
import { getBetStats } from "@/lib/bet-stats";
import { relativeTime, formatMoneyShort } from "@/lib/utils";
import type { Bet, BetSide, Wager, User } from "@prisma/client";

type BetWithRelations = Bet & {
  sides: BetSide[];
  wagers: (Wager & { user: User })[];
  creator: User;
};

const STATUS_STYLE: Record<string, string> = {
  open: "bg-amber-100 text-amber-700",
  closed: "bg-brand-100 text-brand-700",
  settled: "bg-teal-100 text-teal-700",
  cancelled: "bg-zinc-200 text-zinc-600",
};

export function BetCard({
  bet,
  href,
}: {
  bet: BetWithRelations;
  href: string;
}) {
  const stats = getBetStats(bet);
  const leadingSide = stats.sides.reduce(
    (max, s) => (s.pot > max.pot ? s : max),
    stats.sides[0] ?? { id: "", label: "", count: 0, pot: 0 },
  );

  const isSettled = bet.status === "settled";
  const isCancelled = bet.status === "cancelled";

  return (
    <Link
      href={href}
      className="card group flex flex-col p-6 transition-transform hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`badge ${STATUS_STYLE[bet.status] ?? STATUS_STYLE.open}`}>
          {isSettled && "✓ "}
          {isCancelled && "✕ "}
          {bet.status === "open" ? "live" : bet.status}
        </span>
        {bet.status === "open" && (
          <span className="shrink-0 text-[11px] font-extrabold text-amber-600">
            ⏱ {relativeTime(bet.closesAt)}
          </span>
        )}
      </div>

      <h3 className="mt-4 line-clamp-2 text-lg font-black leading-snug tracking-tight">
        {bet.title}
      </h3>
      {bet.description && (
        <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">
          {bet.description}
        </p>
      )}

      {/* Outcome banner for settled bets */}
      {isSettled && bet.outcome && (
        <div className="mt-4 rounded-2xl bg-gradient-to-r from-teal-50 to-brand-50 px-4 py-2.5 text-center text-sm font-black text-teal-700 ring-1 ring-teal-200">
          🏆 Outcome: {bet.outcome}
        </div>
      )}

      {/* Side tally */}
      {!isCancelled && stats.sides.length > 0 && (
        <div className="mt-5 space-y-2.5">
          {stats.sides.map((s) => {
            const pct = stats.totalPot > 0 ? (s.pot / stats.totalPot) * 100 : 0;
            const isLeading = s.id === leadingSide.id && s.pot > 0;
            const isWinner = isSettled && s.label === bet.outcome;
            return (
              <div key={s.id}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className={isWinner ? "text-teal-700" : "text-ink"}>
                    {s.label} {isWinner && "🏆"}
                  </span>
                  <span className="text-ink-soft">
                    {s.count} · {formatMoneyShort(s.pot)}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-brand-50">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isWinner
                        ? "bg-teal-500"
                        : isLeading
                          ? "bg-brand-500"
                          : "bg-brand-300"
                    }`}
                    style={{ width: `${Math.max(pct, s.count > 0 ? 6 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-brand-50 pt-4">
        <div className="flex items-center gap-2">
          <Avatar name={bet.creator.name} color={bet.creator.avatarColor} size="xs" />
          <span className="text-xs font-bold text-ink-soft">
            {bet.creator.name.split(" ")[0]}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {stats.totalPot > 0 && (
            <span className="font-black text-brand-700">
              Pot {formatMoneyShort(stats.totalPot)}
            </span>
          )}
          <span className="rounded-lg bg-brand-50 px-2 py-1 font-bold text-brand-700">
            {stats.totalWagers} in
          </span>
        </div>
      </div>
    </Link>
  );
}
