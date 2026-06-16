"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "convex/react";
import { Spinner, Underline } from "@/components/brand";
import { api } from "@/convex/_generated/api";

const EMOJIS = [
  "🎲", "🍺", "⚽", "🎮", "🎸", "🏆", "🍕", "🎬",
  "🏖️", "🚀", "🔥", "👑", "🎯", "🎪", "🎰", "💪",
];

const COLORS = [
  "#7c3aed", "#db2777", "#0891b2", "#ea580c",
  "#16a34a", "#ca8a04", "#dc2626", "#0d9488",
];

export default function NewGroupPage() {
  const router = useRouter();
  const createGroup = useMutation(api.groups.createGroup);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emoji, setEmoji] = useState("🎲");
  const [color, setColor] = useState(COLORS[0]);
  const [name, setName] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const description = String(form.get("description") ?? "");

    try {
      const result = await createGroup({
        name: String(form.get("name") ?? ""),
        description: description || undefined,
        emoji,
        color,
      });
      router.push(`/groups/${result.groupId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error — please try again");
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
        <p className="eyebrow">New group</p>
        <h1 className="mt-3 text-4xl font-black leading-[1.02] tracking-[-0.055em] sm:text-5xl">
          Start a <Underline>group.</Underline>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          Your group is your betting circle. Add your mates with an invite code
          and let the banter begin.
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

          {/* Live preview */}
          <div
            className="mb-7 flex items-center gap-4 rounded-2xl p-5 ring-1"
            style={{
              backgroundColor: `${color}14`,
              boxShadow: `inset 0 0 0 1px ${color}26`,
            }}
          >
            <span
              className="grid h-16 w-16 place-items-center rounded-[1.25rem] text-3xl ring-1 ring-white/60"
              style={{ backgroundColor: `${color}33` }}
            >
              {emoji}
            </span>
            <div>
              <div className="text-lg font-black tracking-tight">
                {name || "Your group"}
              </div>
              <div className="text-xs font-semibold text-ink-soft">
                1 member (you)
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label" htmlFor="name">
                Group name
              </label>
              <input
                id="name"
                name="name"
                required
                maxLength={50}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Saturday Squad"
                className="input"
              />
            </div>

            <div>
              <label className="label" htmlFor="description">
                Description <span className="font-normal normal-case tracking-normal text-ink-soft/70">(optional)</span>
              </label>
              <textarea
                id="description"
                name="description"
                maxLength={200}
                rows={2}
                placeholder="Who's in this group?"
                className="input resize-none"
              />
            </div>

            <div>
              <span className="label">Pick an emoji</span>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmoji(e)}
                    className={`grid h-11 w-11 place-items-center rounded-xl text-xl transition ${
                      emoji === e
                        ? "bg-brand-100 ring-2 ring-brand-400"
                        : "bg-brand-50 hover:bg-brand-100"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="label">Pick a colour</span>
              <div className="flex flex-wrap gap-2.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-10 w-10 rounded-full transition ${
                      color === c
                        ? "ring-2 ring-offset-2 ring-brand-500 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Colour ${c}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base"
            >
              {loading ? <Spinner /> : null}
              Create group <span aria-hidden="true">→</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
