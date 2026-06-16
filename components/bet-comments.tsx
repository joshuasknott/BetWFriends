"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Avatar, Spinner } from "@/components/brand";
import { relativeTime } from "@/lib/utils";
import { api } from "@/convex/_generated/api";

export function BetComments({ betId }: { betId: string }) {
  const comments = useQuery(api.comments.list, { betId: betId as any });
  const me = useQuery(api.profile.getMe, {});
  const addComment = useMutation(api.comments.add);
  const removeComment = useMutation(api.comments.remove);

  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function post(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);
    setPosting(true);
    try {
      await addComment({ betId: betId as any, text });
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't post comment");
    } finally {
      setPosting(false);
    }
  }

  async function remove(commentId: string) {
    try {
      await removeComment({ commentId: commentId as any });
    } catch {
      // ignore
    }
  }

  const currentUserId = me ? me.id : undefined;
  const list = comments ?? [];

  return (
    <div className="card p-6 sm:p-7">
      <h2 className="text-base font-black tracking-tight">
        Banter · {list.length}
      </h2>

      {error && (
        <div className="mt-3 rounded-2xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
          {error}
        </div>
      )}

      {/* Comments list */}
      <div className="mt-4 space-y-3">
        {comments === undefined ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-2xl bg-brand-50 px-4 py-8 text-center text-sm font-semibold text-ink-soft">
            <div className="text-3xl">💬</div>
            <p className="mt-2">No banter yet. Start the chat!</p>
          </div>
        ) : (
          list.map((c) => (
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
                {currentUserId !== undefined && c.userId === currentUserId && (
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
