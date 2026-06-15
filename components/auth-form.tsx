"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo, BrandBlobs, Spinner, Underline } from "@/components/brand";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === "register";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload: Record<string, string> = {};
    form.forEach((v, k) => (payload[k] = String(v)));

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error — please try again");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <BrandBlobs />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <Logo size="lg" />
          </Link>
        </div>

        <div className="card p-7 animate-slide-up sm:p-9">
          <p className="eyebrow">
            {isRegister ? "Create account" : "Welcome back"}
          </p>
          <h1 className="mt-3 text-3xl font-black leading-[1.05] tracking-[-0.05em]">
            {isRegister ? (
              <>
                Let's <Underline>play.</Underline>
              </>
            ) : (
              <>
                Back for <Underline>more.</Underline>
              </>
            )}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {isRegister
              ? "Start betting with your friends in minutes."
              : "Log in to check on your bets."}
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {isRegister && (
              <div>
                <label className="label" htmlFor="name">
                  Your name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Jordan"
                  className="input"
                  required
                />
              </div>
            )}
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder={isRegister ? "At least 6 characters" : "••••••••"}
                className="input"
                required
                minLength={isRegister ? 6 : undefined}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base"
            >
              {loading ? <Spinner /> : null}
              {isRegister ? "Create account" : "Log in"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-semibold text-ink-soft">
            {isRegister ? "Already have an account? " : "New to BetWFriends? "}
            <Link
              href={isRegister ? "/login" : "/register"}
              className="font-black text-brand-600 hover:underline"
            >
              {isRegister ? "Log in" : "Create one free"}
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs font-semibold text-ink-soft">
          Keep it friendly. Play with people you know. 18+ only.
        </p>
      </div>
    </div>
  );
}
