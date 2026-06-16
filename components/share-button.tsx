"use client";

import { useState } from "react";

/**
 * Copy-to-clipboard button for sharing a link. Shows feedback on success.
 */
export function ShareButton({ url, label = "Share" }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // give up silently
      }
      document.body.removeChild(input);
    }
  }

  return (
    <button
      onClick={copy}
      className="rounded-xl border border-brand-200 bg-white px-4 py-2 text-sm font-bold text-ink-soft transition hover:bg-brand-50"
    >
      {copied ? "✓ Copied!" : `🔗 ${label}`}
    </button>
  );
}
