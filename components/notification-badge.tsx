"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api-client";

/**
 * Shows a badge with the count of bets the user needs to settle.
 * Polls every 60s while on authenticated pages. Shown in the desktop header.
 */
export function NotificationBadge() {
  const [count, setCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    let active = true;

    async function check() {
      try {
        const res = await api("/api/me/pending");
        if (res.ok) {
          const data = await res.json();
          if (active) setCount(data.awaitingSettlement ?? 0);
        }
      } catch {
        // silent — don't disrupt UX for notification failures
      }
    }

    check();
    const interval = setInterval(check, 60_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [pathname]);

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
