"use client";

import { useEffect, useState } from "react";
import { Avatar, Spinner } from "@/components/brand";
import { api } from "@/lib/api-client";
import { relativeTime } from "@/lib/utils";

type Comment = {
  id: string;
  text: string;
  createdAt: string;
  user: { id: string; name: string; avatarColor: string };
};

export function BetComments({ betId, currentUserId }: { betId: string; currentUserId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadComments() {
      try {
        const res = await api(`/api/bets/${betId}/comments`);
        const data = await res.json();
        if (!cancelled && res.ok) setComments(data.comments ?? []);
      } catch {
        // Comments are non-critical; leave the composer usable if loading fails.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadComments();
    return () => {
      cancelled = true;
    };
  }, [betId]);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);
    setPosting(true);
    try {
      const res = await api(`/api/bets/${betId}/comments`, {
        method: "POST",
        body: { text },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't post comment");
      } else {
        setComments((prev) => [...prev, data.comment]);
        setText("");
      }
    } catch {
      setError("Network error");
    } finally {
      setPosting(false);
    }
  }

  async function remove(commentId: string) {
    try {
      const res = await api(`/api/bets/${betId}/comments?commentId=${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="card p-6 sm:p-7">
      <h2 className="text-base font-black tracking-tight">
        Banter · {comments.length}
      </h2>

      {error && (
        <div className="mt-3 rounded-2xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
          {error}
        </div>
      )}

      {/* Comments list */}
      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-2xl bg-brand-50 px-4 py-8 text-center text-sm font-semibold text-ink-soft">
            <div className="text-3xl">💬</div>
            <p className="mt-2">No banter yet. Start the chat!</p>
          </div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Avatar name={c.user.name} color={c.user.avatarColor} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="rounded-2xl bg-brand-50 px-4 py-2.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-black">{c.user.name}</span>
                    <span className="text-[10px] font-semibold text-ink-soft">
                      {relativeTime(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink">{c.text}</p>
                </div>
                {c.user.id === currentUserId && (
                  <button
                    onClick={() => remove(c.id)}
                    className="mt-1 text-[11px] font-bold text-ink-soft/60 transition hover:text-rose-500"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Composer */}
      <form onSubmit={post} className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          placeholder="Add some banter..."
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={posting || !text.trim()}
          className="btn-primary"
        >
          {posting ? <Spinner /> : "Send"}
        </button>
      </form>
    </div>
  );
}
