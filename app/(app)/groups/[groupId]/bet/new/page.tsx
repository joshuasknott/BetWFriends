"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Spinner, Underline } from "@/components/brand";
import { api } from "@/lib/api-client";
import { formatMoney } from "@/lib/utils";

const DURATIONS = [
  { label: "1 hour", hours: 1 },
  { label: "6 hours", hours: 6 },
  { label: "Tonight", hours: 8 },
  { label: "1 day", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "1 week", hours: 168 },
];

const PRESET_AMOUNTS = [100, 200, 500, 1000, 2000];

export default function NewBetPage() {
  const router = useRouter();
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId ?? "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amountPounds, setAmountPounds] = useState("2");
  const [duration, setDuration] = useState(24);
  const [customSides, setCustomSides] = useState(false);
  const [yesLabel, setYesLabel] = useState("Yes");
  const [noLabel, setNoLabel] = useState("No");

  const amountPence = Math.round((parseFloat(amountPounds) || 0) * 100);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Give your bet a title");
      return;
    }
    if (amountPence < 0) {
      setError("Amount can't be negative");
      return;
    }
    if (!groupId) {
      setError("Group not loaded yet");
      return;
    }

    setLoading(true);
    try {
      const res = await api("/api/bets", {
        method: "POST",
        body: {
          groupId,
          title,
          description,
          amount: amountPence,
          durationHours: duration,
          yesLabel: yesLabel.trim() || "Yes",
          noLabel: noLabel.trim() || "No",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create bet");
        setLoading(false);
        return;
      }
      router.push(`/bets/${data.betId}`);
      router.refresh();
    } catch {
      setError("Network error — please try again");
      setLoading(false);
    }
  }

  return (
    <div className="container-app py-10 sm:py-14">
      <Link
        href={groupId ? `/groups/${groupId}` : "/dashboard"}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-ink-soft transition hover:text-brand-600"
      >
        ← Back to group
      </Link>

      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">New bet</p>
        <h1 className="mt-3 text-4xl font-black leading-[1.02] tracking-[-0.055em] sm:text-5xl">
          Make a <Underline>bet.</Underline>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          What's the call? Anyone in the group can jump in on either side.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_330px]">
          {/* Form */}
          <div className="card p-6 sm:p-7">
            {error && (
              <div
                role="alert"
                className="mb-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="label" htmlFor="title">
                  What's the bet?
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={140}
                  required
                  placeholder="e.g. Mark blacks out before midnight"
                  className="input"
                />
                <p className="mt-1.5 text-xs font-semibold text-ink-soft">
                  {title.length}/140
                </p>
              </div>

              <div>
                <label className="label" htmlFor="description">
                  Details <span className="font-normal normal-case tracking-normal text-ink-soft/70">(optional)</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={2}
                  placeholder="Add some context or ground rules…"
                  className="input resize-none"
                />
              </div>

              <div>
                <span className="label">Stake per person</span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-ink-soft">
                    £
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    inputMode="decimal"
                    value={amountPounds}
                    onChange={(e) => setAmountPounds(e.target.value)}
                    className="input pl-8 text-lg font-black"
                  />
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {PRESET_AMOUNTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAmountPounds((p / 100).toString())}
                      className="rounded-xl bg-brand-50 px-3.5 py-1.5 text-sm font-bold text-brand-700 transition hover:bg-brand-100"
                    >
                      £{p / 100}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs font-semibold text-ink-soft">
                  No minimum — even £0 works just for bragging rights.
                </p>
              </div>

              <div>
                <span className="label">Closes in</span>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.hours}
                      type="button"
                      onClick={() => setDuration(d.hours)}
                      className={`rounded-xl px-3.5 py-2 text-sm font-bold transition ${
                        duration === d.hours
                          ? "bg-brand-500 text-white shadow-[0_8px_20px_-8px_var(--color-brand-500)]"
                          : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={customSides}
                    onChange={(e) => setCustomSides(e.target.checked)}
                    className="h-4 w-4 rounded accent-brand-500"
                  />
                  Customise side labels
                </label>
                {customSides && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <input
                        value={yesLabel}
                        onChange={(e) => setYesLabel(e.target.value)}
                        maxLength={40}
                        className="input"
                        placeholder="Yes"
                      />
                    </div>
                    <div>
                      <input
                        value={noLabel}
                        onChange={(e) => setNoLabel(e.target.value)}
                        maxLength={40}
                        className="input"
                        placeholder="No"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-base"
              >
                {loading ? <Spinner /> : null}
                Post the bet <span aria-hidden="true">→</span>
              </button>
            </form>
          </div>

          {/* Live preview */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="mb-2.5 h-section">Live preview</div>
            <div className="card overflow-hidden p-5">
              <div className="flex items-center justify-between">
                <span className="badge bg-amber-100 text-amber-700">live</span>
                <span className="text-[11px] font-extrabold text-amber-600">
                  ⏱ in {duration < 24 ? `${duration}h` : `${Math.round(duration / 24)}d`}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-black leading-tight tracking-tight">
                {title || "Your bet title appears here"}
              </h3>
              {description && (
                <p className="mt-1.5 text-sm text-ink-soft">{description}</p>
              )}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-teal-50 p-3.5 text-center ring-2 ring-teal-200">
                  <div className="font-black text-teal-700">
                    {yesLabel || "Yes"}
                  </div>
                  <div className="mt-0.5 text-[11px] font-bold text-teal-600">
                    0 in
                  </div>
                </div>
                <div className="rounded-2xl bg-brand-50 p-3.5 text-center ring-2 ring-brand-200">
                  <div className="font-black text-brand-700">
                    {noLabel || "No"}
                  </div>
                  <div className="mt-0.5 text-[11px] font-bold text-brand-600">
                    0 in
                  </div>
                </div>
              </div>
              <div className="mt-4 border-t border-brand-50 pt-3.5 text-center">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                  Stake per person
                </span>
                <div className="text-xl font-black text-brand-700">
                  {formatMoney(amountPence)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
