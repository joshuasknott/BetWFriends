"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Spinner } from "@/components/brand";
import { api } from "@/lib/api-client";

const COLORS = [
  "#7c3aed", "#db2777", "#0891b2", "#ea580c",
  "#16a34a", "#ca8a04", "#dc2626", "#4f46e5",
  "#0d9488", "#9333ea",
];

export function ProfileEditor({
  name: initialName,
  avatarColor: initialColor,
}: {
  name: string;
  avatarColor: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty = name !== initialName || color !== initialColor;

  async function save() {
    if (!dirty) return;
    setError(null);
    setLoading(true);
    try {
      const res = await api("/api/profile", {
        method: "PATCH",
        body: { name, avatarColor: color },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't save");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        router.refresh();
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6 sm:p-7">
      <h2 className="text-base font-black tracking-tight">Edit profile</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Update your name and avatar colour.
      </p>

      {error && (
        <div role="alert" className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
          {error}
        </div>
      )}

      <div className="mt-5 flex items-center gap-4 rounded-2xl bg-brand-50 p-4">
        <Avatar name={name || "?"} color={color} size="lg" />
        <div className="text-sm font-semibold text-ink-soft">
          Preview — this is how friends see you
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="label" htmlFor="name">
            Your name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            className="input"
            placeholder="e.g. Jordan"
          />
        </div>

        <div>
          <span className="label">Avatar colour</span>
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
          onClick={save}
          disabled={loading || !dirty}
          className="btn-primary w-full"
        >
          {loading ? <Spinner /> : saved ? "✓ Saved!" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
