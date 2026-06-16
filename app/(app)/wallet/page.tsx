import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { TopUpPanel } from "@/components/top-up-panel";
import { formatMoney, formatDateTime } from "@/lib/utils";
import { Underline } from "@/components/brand";
import { api } from "@/convex/_generated/api";

export const dynamic = "force-dynamic";

/** Mock mode = real Stripe is not configured (PAYMENT_MODE != "live"). */
function isMockPayments(): boolean {
  return process.env.PAYMENT_MODE !== "live" || !process.env.STRIPE_SECRET_KEY;
}

const TYPE_META: Record<string, { emoji: string; label: string; color: string }> = {
  topup: { emoji: "💳", label: "Top-up", color: "text-teal-600" },
  stake: { emoji: "🎯", label: "Stake", color: "text-brand-600" },
  payout: { emoji: "🏆", label: "Winnings", color: "text-amber-600" },
  withdrawal: { emoji: "🏦", label: "Withdrawal", color: "text-rose-600" },
};

export default async function WalletPage() {
  const token = await convexAuthNextjsToken();
  const opts = token ? { token } : {};

  const { balance, transactions } = await fetchQuery(
    api.wallet.listTransactions,
    {},
    opts,
  );
  const mock = isMockPayments();

  return (
    <div className="container-app py-10 sm:py-14">
      <p className="eyebrow">Wallet</p>
      <h1 className="mt-3 text-4xl font-black leading-[1.02] tracking-[-0.055em] sm:text-5xl">
        Your <Underline>money.</Underline>
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink-soft">
        Top up and track every penny — stakes, winnings and top-ups in one place.
      </p>

      {/* Balance hero — matches marketing gradient banner */}
      <div className="relative mt-8 overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-600 via-grape to-berry px-7 py-9 text-white sm:px-10 sm:py-11">
        <div className="absolute -bottom-24 right-[8%] h-72 w-72 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -top-20 -left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/80">
            Your balance
          </div>
          <div className="mt-2 text-5xl font-black tracking-[-0.04em] sm:text-6xl">
            {formatMoney(balance)}
          </div>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold backdrop-blur">
            {mock
              ? "🧪 Demo mode — instant free top-ups"
              : "🔒 Secure payments by Stripe"}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <TopUpPanel mockMode={mock} />

        {/* Transactions */}
        <div className="card p-6 sm:p-7">
          <h2 className="text-base font-black tracking-tight">Activity</h2>
          {transactions.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-brand-50 px-4 py-10 text-center text-sm font-semibold text-ink-soft">
              <div className="grid h-14 w-14 mx-auto place-items-center rounded-2xl bg-white text-3xl shadow-sm">
                🧾
              </div>
              <p className="mt-3">No transactions yet.</p>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-brand-50">
              {transactions.map((t) => {
                const meta = TYPE_META[t.type] ?? TYPE_META.stake;
                const positive = t.amount >= 0;
                return (
                  <li key={t.id} className="flex items-center gap-3.5 py-3.5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-lg ring-1 ring-brand-100">
                      {meta.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-black">{t.note}</div>
                      <div className="text-xs font-semibold text-ink-soft">
                        {meta.label} · {formatDateTime(t.createdAt)}
                      </div>
                    </div>
                    <div
                      className={`text-sm font-black ${
                        positive ? "text-teal-600" : "text-rose-500"
                      }`}
                    >
                      {positive ? "+" : ""}
                      {formatMoney(t.amount)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
