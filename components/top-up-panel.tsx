"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/brand";
import { api } from "@/lib/api-client";
import { formatMoney } from "@/lib/utils";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000]; // pence

export function TopUpPanel({ mockMode }: { mockMode: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customPounds, setCustomPounds] = useState("");

  async function topUp(amountPence: number) {
    setError(null);
    setLoading(true);
    try {
      const res = await api("/api/wallet/topup", {
        method: "POST",
        body: { amount: amountPence },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't top up");
        setLoading(false);
        return;
      }
      if (data.mode === "mock") {
        router.refresh();
        setLoading(false);
      } else if (data.mode === "live") {
        // In live mode we'd mount the Stripe Payment Element here with
        // data.clientSecret. For now, surface a friendly notice.
        setError(
          "Live card payments need Stripe keys configured. Set STRIPE_SECRET_KEY & STRIPE_PUBLISHABLE_KEY to enable checkout.",
        );
        setLoading(false);
      }
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  const customPence = Math.round((parseFloat(customPounds) || 0) * 100);

  return (
    <div className="card p-6 sm:p-7">
      <h2 className="text-base font-black tracking-tight">Add money</h2>
      {mockMode ? (
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          You're in demo mode — top-ups are instant and free, so you can try
          everything. Switch to live mode with Stripe keys when you're ready.
        </p>
      ) : (
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          Secure card payment via Stripe.
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200"
        >
          {error}
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_AMOUNTS.map((p) => (
          <button
            key={p}
            onClick={() => topUp(p)}
            disabled={loading}
            className="rounded-2xl bg-brand-50 px-3 py-4 text-center font-black text-brand-700 ring-1 ring-brand-100 transition hover:bg-brand-100 active:scale-95 disabled:opacity-50"
          >
            {formatMoney(p)}
          </button>
        ))}
      </div>

      <div className="mt-5 border-t border-brand-50 pt-5">
        <label className="label">Custom amount</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-black text-ink-soft">
              £
            </span>
            <input
              type="number"
              min="1"
              max="1000"
              step="1"
              inputMode="decimal"
              value={customPounds}
              onChange={(e) => setCustomPounds(e.target.value)}
              placeholder="25"
              className="input pl-8"
            />
          </div>
          <button
            onClick={() => customPence >= 100 && topUp(customPence)}
            disabled={loading || customPence < 100}
            className="btn-primary"
          >
            {loading ? <Spinner /> : "Add"}
          </button>
        </div>
        <p className="mt-2 text-xs font-semibold text-ink-soft">
          Minimum £1, maximum £1,000.
        </p>
      </div>
    </div>
  );
}
