"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo, BrandBlobs, Spinner, Underline } from "@/components/brand";
import { useAuthActions } from "@convex-dev/auth/react";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { signIn } = useAuthActions();
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

    // 18+ age gate (register only)
    if (isRegister && payload.ageConfirm !== "on") {
      setError("You must confirm that you are 18 or over to create an account.");
      setLoading(false);
      return;
    }
    delete payload.ageConfirm;

    try {
      // Convex Auth: "password" provider handles both sign-up and sign-in.
      // It throws on bad credentials or a duplicate email.
      await signIn("password", {
        email: payload.email,
        password: payload.password,
        // `name` is read by the Password provider's `profile` callback on sign-up.
        name: payload.name ?? "",
        flow: isRegister ? "signUp" : "signIn",
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      // Convex Auth surfaces duplicate-email / wrong-password errors as messages.
      setError(
        isRegister && /exist|already/i.test(message)
          ? "An account with that email already exists"
          : !isRegister && /invalid|credential|password/i.test(message)
            ? "Incorrect email or password"
            : message,
      );
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
                placeholder={isRegister ? "At least 8 characters" : "••••••••"}
                className="input"
                required
                minLength={isRegister ? 8 : undefined}
              />
            </div>

            {isRegister && (
              <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-ink">
                <input
                  type="checkbox"
                  name="ageConfirm"
                  className="mt-0.5 h-4 w-4 shrink-0 rounded accent-brand-500"
                  required
                />
                <span>
                  I confirm I am <strong>18 or over</strong> and agree to the{" "}
                  <Link href="/legal/terms" className="font-black text-brand-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal/privacy" className="font-black text-brand-600 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            )}

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
          Keep it friendly. Play with people you know.{" "}
          <Link href="/legal/responsible-play" className="text-brand-600 hover:underline">
            18+ only · Play responsibly
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
