"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { Spinner } from "@/components/brand";
import { api } from "@/convex/_generated/api";

export function PasswordChanger() {
  const changePassword = useAction(api.profile.changePassword);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6 sm:p-7">
      <h2 className="text-base font-black tracking-tight">Change password</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Keep your account secure with a strong password.
      </p>

      {error && (
        <div role="alert" className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700 ring-1 ring-teal-200">
          ✓ Password changed successfully
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="label" htmlFor="currentPassword">
            Current password
          </label>
          <input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className="input"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="newPassword">
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="input"
            required
            minLength={8}
          />
        </div>
        <div>
          <label className="label" htmlFor="confirmPassword">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className="input"
            required
            minLength={8}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Spinner /> : "Update password"}
        </button>
      </form>
    </div>
  );
}
