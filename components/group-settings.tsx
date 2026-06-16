"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Spinner } from "@/components/brand";
import { api } from "@/convex/_generated/api";

const EMOJIS = [
  "🎲", "🍺", "⚽", "🎮", "🎸", "🏆", "🍕", "🎬",
  "🏖️", "🚀", "🔥", "👑", "🎯", "🎪", "🎰", "💪",
];

const COLORS = [
  "#7c3aed", "#db2777", "#0891b2", "#ea580c",
  "#16a34a", "#ca8a04", "#dc2626", "#0d9488",
];

export function GroupSettings({
  groupId,
  initialName,
  initialDescription,
  initialEmoji,
  initialColor,
}: {
  groupId: string;
  initialName: string;
  initialDescription: string | null;
  initialEmoji: string;
  initialColor: string;
}) {
  const router = useRouter();
  const updateGroup = useMutation(api.groups.updateGroup);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [emoji, setEmoji] = useState(initialEmoji);
  const [color, setColor] = useState(initialColor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    name !== initialName ||
    description !== (initialDescription ?? "") ||
    emoji !== initialEmoji ||
    color !== initialColor;

  async function save() {
    if (!dirty) return;
    setError(null);
    setLoading(true);
    try {
      await updateGroup({
        groupId: groupId as any,
        name,
        description,
        emoji,
        color,
      });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border border-brand-200 bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-brand-50"
      >
        ⚙️ Settings
      </button>
    );
  }

  return (
    <div className="card p-6 sm:p-7">
      <h2 className="text-base font-black tracking-tight">Group settings</h2>

      {error && (
        <div role="alert" className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
          {error}
        </div>
      )}

      <div className="mt-5 space-y-4">
        <div>
          <label className="label">Group name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            className="input"
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            rows={2}
            className="input resize-none"
            placeholder="Who's in this group?"
          />
        </div>

        <div>
          <span className="label">Emoji</span>
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
          <span className="label">Colour</span>
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

        <div className="flex gap-3 pt-2">
          <button onClick={save} disabled={loading || !dirty} className="btn-primary flex-1">
            {loading ? <Spinner /> : "Save changes"}
          </button>
          <button
            onClick={() => {
              setOpen(false);
              setName(initialName);
              setDescription(initialDescription ?? "");
              setEmoji(initialEmoji);
              setColor(initialColor);
              setError(null);
            }}
            className="btn-ghost"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
