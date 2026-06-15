"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo, BrandBlobs } from "@/components/brand";

/**
 * Global error boundary. Catches unexpected render errors and shows a
 * friendly branded page instead of a blank screen.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this would go to your error tracking service.
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
      <BrandBlobs />
      <div className="relative z-10 max-w-md">
        <Link href="/" className="inline-block">
          <Logo size="lg" />
        </Link>
        <div className="mt-10 text-8xl font-black text-gradient tracking-[-0.06em]">
          😵
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.04em]">
          Something went <span className="relative inline-block text-berry">wrong.</span>
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          An unexpected error occurred. Don&rsquo;t worry — your bets and balance
          are safe. Try again, or head back to the dashboard.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-4 overflow-auto rounded-2xl bg-rose-50 p-4 text-left text-xs text-rose-700 ring-1 ring-rose-200">
            {error.message}
            {error.digest && `\nDigest: ${error.digest}`}
          </pre>
        )}
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link href="/dashboard" className="btn-ghost">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
