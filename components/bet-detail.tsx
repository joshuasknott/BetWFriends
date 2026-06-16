"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { Avatar, Spinner } from "@/components/brand";
import { BetComments } from "@/components/bet-comments";
import {
  formatMoney,
  formatMoneyShort,
  countdown,
  relativeTime,
} from "@/lib/utils";
import { asId } from "@/lib/types";
import { api } from "@/convex/_generated/api";

export function BetDetailClient({ betId }: { betId: string }) {
  const router = useRouter();
  const data = useQuery(api.bets.getBet, { betId: asId<"bets">(betId) });
  const placeWager = useMutation(api.bets.placeWager);
  const removeWager = useMutation(api.bets.removeWager);
  const settleBet = useMutation(api.bets.resolveBet);
  const cancelBetMut = useMutation(api.bets.cancelBet);

  const [now, setNow] = useState<number>(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showResolve, setShowResolve] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  if (data === undefined) {
    return (
      <div className="container-app flex justify-center py-20">
        <Spinner />
      </div>
    );
  }
  if (data === null) {
    return (
      <div className="container-app py-20 text-center text-sm font-semibold text-ink-soft">
        Bet not found.
      </div>
    );
  }

  const { bet, sides, wagers, group, creator, myWager, isCreator } = data;
  const isOpen = bet.status === "open";
  const isSettled = bet.status === "settled";
  const isCancelled = bet.status === "cancelled";
  const closed = bet.closesAt <= now;
  const cd = isOpen ? countdown(new Date(bet.closesAt)) : null;

  // side stats
  const totalPot = wagers.reduce((s, w) => s + w.amount, 0);
  const sideStats = sides.map((s) => {
    const sw = wagers.filter((w) => w.sideId === s.id);
    return {
      ...s,
      count: sw.length,
      pot: sw.reduce((sum, w) => sum + w.amount, 0),
      wagers: sw,
      odds: sw.length > 0 ? totalPot / Math.max(sw.reduce((a, w) => a + w.amount, 0), 1) : null,
    };
  });

  const canWager = isOpen && !closed;

  async function onPlaceWager(sideId: string) {
    setError(null);
    if (myWager?.sideId === sideId) return;
    if (!canWager) {
      setError("Betting has closed on this one");
      return;
    }
    setBusy(true);
    try {
      await placeWager({ betId: asId<"bets">(betId), sideId: asId<"betSides">(sideId) });
      setToast(myWager ? "Switched sides!" : "You're in! 🎉");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't place bet");
    } finally {
      setBusy(false);
    }
  }

  async function onPullOut() {
    setError(null);
    setBusy(true);
    try {
      await removeWager({ betId: asId<"bets">(betId) });
      setToast("Pulled out — stake refunded");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't pull out");
    } finally {
      setBusy(false);
    }
  }

  async function onSettle(winningSideId: string | null) {
    setError(null);
    setBusy(true);
    try {
      await settleBet({
        betId: asId<"bets">(betId),
        winningSideId: winningSideId ? asId<"betSides">(winningSideId) : null,
      });
      setToast("Bet settled! 🏆");
      setShowResolve(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't settle");
    } finally {
      setBusy(false);
    }
  }

  async function onCancelBet() {
    if (!confirm("Cancel this bet and refund everyone?")) return;
    setError(null);
    setBusy(true);
    try {
      await cancelBetMut({ betId: asId<"bets">(betId) });
      setToast("Bet cancelled — stakes refunded");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't cancel");
    } finally {
      setBusy(false);
    }
  }

  const mySideLabel = myWager && sides.find((s) => s.id === myWager.sideId)?.label;

  return (
    <div className="container-app py-10 sm:py-14">
      <Link
        href={`/groups/${group.id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-ink-soft transition hover:text-brand-600"
      >
        ← Back to {group.name}
      </Link>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200"
        >
          {error}
        </div>
      )}
      {toast && (
        <div className="fixed left-1/2 top-24 z-50 -translate-x-1/2 animate-pop rounded-2xl bg-ink px-5 py-3 text-sm font-black text-white shadow-[0_24px_70px_-24px_rgba(45,27,105,0.5)]">
          {toast}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main column */}
        <div className="space-y-6">
          {/* Bet header */}
          <div className="card p-7 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span
                className="badge text-white"
                style={{ backgroundColor: group.color }}
              >
                {group.emoji} {group.name}
              </span>
              <div className="flex items-center gap-2">
                {isOpen && (
                  <span className="badge bg-amber-100 text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> live
                  </span>
                )}
                {isSettled && (
                  <span className="badge bg-teal-100 text-teal-700">✓ settled</span>
                )}
                {isCancelled && (
                  <span className="badge bg-zinc-200 text-zinc-600">cancelled</span>
                )}
                {cd && (
                  <span className="rounded-lg bg-amber-50 px-2.5 py-1 font-mono text-xs font-black text-amber-700">
                    ⏱ {cd}
                  </span>
                )}
              </div>
            </div>

            <h1 className="mt-5 text-3xl font-black leading-[1.05] tracking-[-0.05em] sm:text-4xl">
              {bet.title}
            </h1>
            {bet.description && (
              <p className="mt-3 text-base leading-relaxed text-ink-soft">
                {bet.description}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-ink-soft">
              <span className="flex items-center gap-2">
                <Avatar name={creator.name} color={creator.avatarColor} size="xs" />
                by {creator.name}
              </span>
              <span className="text-ink-soft/40">·</span>
              <span>{formatMoney(bet.amount)} per person</span>
              <span className="text-ink-soft/40">·</span>
              <span className="font-black text-brand-700">
                pot {formatMoney(totalPot)}
              </span>
            </div>

            {/* Outcome banner */}
            {isSettled && bet.outcome && (
              <div className="mt-6 rounded-[1.25rem] bg-gradient-to-r from-teal-50 via-white to-brand-50 px-6 py-5 text-center ring-1 ring-teal-200">
                <div className="text-xs font-extrabold uppercase tracking-[0.15em] text-teal-700">
                  Final outcome
                </div>
                <div className="mt-1 text-2xl font-black text-teal-800">
                  🏆 {bet.outcome}
                </div>
              </div>
            )}
            {isCancelled && (
              <div className="mt-6 rounded-2xl bg-zinc-100 px-5 py-4 text-center text-sm font-semibold text-zinc-600">
                This bet was cancelled. All stakes were refunded.
              </div>
            )}
          </div>

          {/* Side picker / tally */}
          {!isCancelled && (
            <div className="card p-7 sm:p-8">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-black tracking-tight">
                  {isSettled ? "Final tally" : canWager ? "Pick your side" : "Tally"}
                </h2>
                {myWager && (
                  <span className="badge bg-brand-100 text-brand-700">
                    You're on {mySideLabel}
                  </span>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {sideStats.map((s, idx) => {
                  const isMine = myWager?.sideId === s.id;
                  const isWinner = isSettled && s.label === bet.outcome;
                  const pct = totalPot > 0 ? (s.pot / totalPot) * 100 : 0;
                  const color = idx === 0 ? "teal" : "brand";
                  return (
                    <div
                      key={s.id}
                      className={`relative overflow-hidden rounded-[1.25rem] border-2 p-5 transition ${
                        isWinner
                          ? "border-teal-400 bg-teal-50"
                          : isMine
                            ? "border-brand-400 bg-brand-50"
                            : "border-brand-100 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-black tracking-tight">
                          {s.label}
                          {isWinner && " 🏆"}
                        </div>
                        {s.odds && isOpen && (
                          <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-extrabold text-ink-soft ring-1 ring-brand-100">
                            {s.odds.toFixed(1)}× return
                          </span>
                        )}
                      </div>

                      {/* progress bar */}
                      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-brand-50">
                        <div
                          className={`h-full rounded-full ${
                            isWinner
                              ? "bg-teal-500"
                              : color === "teal"
                                ? "bg-teal-400"
                                : "bg-brand-400"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="mt-2 flex justify-between text-xs font-semibold text-ink-soft">
                        <span>{s.count} {s.count === 1 ? "person" : "people"}</span>
                        <span className="font-bold text-ink">
                          {formatMoney(s.pot)}
                        </span>
                      </div>

                      {/* Wager action */}
                      {canWager && !isMine && (
                        <button
                          onClick={() => onPlaceWager(s.id)}
                          disabled={busy}
                          className={`btn-${
                            color === "teal" ? "primary" : "secondary"
                          } mt-4 w-full`}
                        >
                          {busy ? <Spinner /> : `Put ${formatMoneyShort(bet.amount)} on ${s.label}`}
                        </button>
                      )}
                      {canWager && isMine && (
                        <div className="mt-4 rounded-2xl bg-white/70 px-3 py-2.5 text-center text-sm font-bold text-brand-700 ring-1 ring-brand-200">
                          ✓ You're in for {formatMoney(bet.amount)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Balance + pull out */}
              {canWager && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-brand-50 pt-4">
                  <div className="text-sm font-semibold text-ink-soft">
                    Your balance:{" "}
                    <span className="font-black text-brand-700">
                      {formatMoney(data.myBalance)}
                    </span>
                    {data.myBalance < bet.amount && (
                      <Link
                        href="/wallet"
                        className="ml-2 font-bold text-brand-600 hover:underline"
                      >
                        Top up →
                      </Link>
                    )}
                  </div>
                  {myWager && (
                    <button
                      onClick={onPullOut}
                      disabled={busy}
                      className="text-sm font-bold text-ink-soft transition hover:text-rose-600"
                    >
                      Pull out & refund
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Creator controls */}
          {isCreator && !isSettled && !isCancelled && (
            <div className="card border-2 border-dashed border-brand-200 p-7">
              <p className="eyebrow">Creator controls</p>
              <h2 className="mt-2 text-lg font-black tracking-tight">
                You settle this one
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                You started this bet, so you settle it when the result's in.
              </p>

              {!showResolve ? (
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setShowResolve(true)}
                    className="btn-primary"
                    disabled={busy}
                  >
                    🏆 Settle bet
                  </button>
                  {isOpen && (
                    <button
                      onClick={onCancelBet}
                      className="btn-ghost"
                      disabled={busy}
                    >
                      Cancel & refund all
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="text-sm font-bold">Who won?</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {sideStats.map((s, idx) => (
                      <button
                        key={s.id}
                        onClick={() => onSettle(s.id)}
                        disabled={busy}
                        className={`btn-${idx === 0 ? "primary" : "secondary"}`}
                      >
                        {busy ? <Spinner /> : `${s.label} won`}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => onSettle(null)}
                    disabled={busy}
                    className="btn-ghost w-full text-sm"
                  >
                    {busy ? <Spinner /> : "🤝 Void — refund everyone"}
                  </button>
                  <button
                    onClick={() => setShowResolve(false)}
                    className="text-sm font-semibold text-ink-soft transition hover:text-brand-600"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
          {/* Banter / comments */}
          {!isCancelled && <BetComments betId={betId} />}
        </div>

        {/* Sidebar: who's in */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="text-base font-black tracking-tight">
              Who's in · {wagers.length}
            </h2>
            {wagers.length === 0 ? (
              <div className="mt-4 rounded-2xl bg-brand-50 px-4 py-8 text-center text-sm font-semibold text-ink-soft">
                <div className="text-3xl">🤷</div>
                <p className="mt-2">No takers yet. Be first!</p>
              </div>
            ) : (
              <ul className="mt-4 space-y-1">
                {wagers.map((w) => {
                  const side = sides.find((s) => s.id === w.sideId);
                  const isWinner = isSettled && side?.label === bet.outcome;
                  return (
                    <li
                      key={w.id}
                      className="flex items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-brand-50"
                    >
                      <Avatar
                        name={w.user.name}
                        color={w.user.avatarColor}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-black">
                          {w.user.name}
                        </div>
                        <div className="text-xs font-semibold text-ink-soft">
                          on {side?.label}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm font-black ${
                            isWinner ? "text-teal-700" : "text-ink"
                          }`}
                        >
                          {formatMoneyShort(w.amount)}
                        </div>
                        {isWinner && (
                          <div className="text-[10px] font-black text-teal-600">
                            won! 🎉
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-4 border-t border-brand-50 pt-3 text-xs font-semibold text-ink-soft">
              Created {relativeTime(bet.createdAt)}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
