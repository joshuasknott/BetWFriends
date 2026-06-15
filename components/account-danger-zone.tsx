"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/brand";
import { api } from "@/lib/api-client";

export function AccountDangerZone() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteAccount() {
    setError(null);
    if (confirmText !== "DELETE") {
      setError('Type "DELETE" to confirm');
      return;
    }
    setLoading(true);
    try {
      const res = await api("/api/profile/delete", {
        method: "POST",
        body: { confirm: confirmText },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't delete account");
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-[1.5rem] border-2 border-rose-200 bg-rose-50/50 p-6 sm:p-7">
      <h2 className="text-base font-black tracking-tight text-rose-700">
        Danger zone
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
        Permanently delete your account and all associated data. This cannot be
        undone. Open bets you created will be cancelled and refunded. Your
        balance and transaction history will be erased.
      </p>

      {error && (
        <div role="alert" className="mt-4 rounded-2xl bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-300">
          {error}
        </div>
      )}

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="btn-danger mt-5"
        >
          Delete my account
        </button>
      ) : (
        <div className="mt-5 space-y-4 rounded-2xl bg-white p-5 ring-1 ring-rose-200">
          <p className="text-sm font-bold text-rose-700">
            ⚠️ This is permanent. Type DELETE to confirm:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="input border-rose-200 focus:border-rose-400"
            autoFocus
          />
          <div className="flex flex-wrap gap-3">
            <button
              onClick={deleteAccount}
              disabled={loading}
              className="btn-danger"
            >
              {loading ? <Spinner /> : "Yes, delete everything"}
            </button>
            <button
              onClick={() => {
                setOpen(false);
                setConfirmText("");
                setError(null);
              }}
              className="btn-ghost"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
