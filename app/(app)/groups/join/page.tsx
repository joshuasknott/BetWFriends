"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Spinner, Underline } from "@/components/brand";
import { api } from "@/lib/api-client";

export default function JoinGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const inviteCode = String(form.get("inviteCode") ?? "").trim().toUpperCase();

    try {
      const res = await api("/api/groups/join", {
        method: "POST",
        body: { inviteCode },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not join group");
        setLoading(false);
        return;
      }
      router.push(`/groups/${data.groupId}`);
      router.refresh();
    } catch {
      setError("Network error — please try again");
      setLoading(false);
    }
  }

  return (
    <div className="container-app py-10 sm:py-14">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-bold text-ink-soft transition hover:text-brand-600"
      >
        ← Back to groups
      </Link>

      <div className="mx-auto max-w-xl">
        <p className="eyebrow">Join a group</p>
        <h1 className="mt-3 text-4xl font-black leading-[1.02] tracking-[-0.055em] sm:text-5xl">
          Got a <Underline>code?</Underline>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          Pop in an invite code from a friend and you're in.
        </p>

        <div className="card mt-8 p-6 sm:p-8">
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200"
            >
              {error}
            </div>
          )}

          <div className="mb-7 rounded-[1.25rem] bg-gradient-to-br from-brand-50 to-brand-100/60 p-6 text-center ring-1 ring-brand-100">
            <div className="grid h-14 w-14 mx-auto place-items-center rounded-2xl bg-white text-3xl shadow-sm">
              🎟️
            </div>
            <p className="mt-3 text-sm font-semibold text-ink-soft">
              Invite codes look like{" "}
              <span className="font-mono font-black tracking-wide text-brand-700">
                LUCKY-FOX-42
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="inviteCode">
                Invite code
              </label>
              <input
                id="inviteCode"
                name="inviteCode"
                required
                autoFocus
                placeholder="LUCKY-FOX-42"
                className="input text-center font-mono text-lg uppercase tracking-[0.2em]"
                onChange={(e) =>
                  (e.target.value = e.target.value.toUpperCase())
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base"
            >
              {loading ? <Spinner /> : null}
              Join group <span aria-hidden="true">→</span>
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm font-semibold text-ink-soft">
          Rather start your own?{" "}
          <Link
            href="/groups/new"
            className="font-black text-brand-600 hover:underline"
          >
            Create a group →
          </Link>
        </p>
      </div>
    </div>
  );
}
