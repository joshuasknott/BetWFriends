"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Shows a badge with the count of bets the user needs to settle.
 * Live via Convex reactive query — no polling. Shown in the desktop header.
 */
export function NotificationBadge() {
  const pending = useQuery(api.profile.getPending, {});
  const count = pending?.awaitingSettlement ?? 0;

  if (count === 0) return null;

  return (
    <Link
      href="/dashboard"
      className="relative hidden lg:flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700 ring-1 ring-amber-200 transition hover:bg-amber-100"
      aria-label={`${count} bet${count > 1 ? "s" : ""} need settling`}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white">
        {count}
      </span>
      <span>Settle</span>
    </Link>
  );
}
