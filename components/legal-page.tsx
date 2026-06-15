import Link from "next/link";
import { Logo } from "@/components/brand";
import type { Metadata } from "next";

/**
 * Shared layout for legal/policy pages. Provides a readable prose column,
 * consistent header/footer, and metadata.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fffefe]">
      <header className="border-b border-brand-100/70">
        <div className="container-app flex items-center justify-between py-5">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <Link
            href="/"
            className="text-sm font-bold text-ink-soft transition hover:text-brand-600"
          >
            ← Back to BetWFriends
          </Link>
        </div>
      </header>

      <main className="container-app max-w-3xl py-12 sm:py-16">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-3 text-4xl font-black leading-[1.05] tracking-[-0.045em] sm:text-5xl">
          {title}
        </h1>
        {updated && (
          <p className="mt-3 text-sm font-semibold text-ink-soft">
            Last updated: {updated}
          </p>
        )}

        <div className="legal-prose mt-10 max-w-none">{children}</div>
      </main>

      <footer className="border-t border-brand-100/70">
        <div className="container-app flex flex-col items-center justify-between gap-4 py-8 text-xs text-ink-soft sm:flex-row">
          <p>© {new Date().getFullYear()} BetWFriends · 18+ only · Play responsibly</p>
          <nav className="flex flex-wrap justify-center gap-4 font-semibold">
            <Link href="/legal/privacy" className="hover:text-brand-600">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-brand-600">Terms</Link>
            <Link href="/legal/responsible-play" className="hover:text-brand-600">Responsible play</Link>
            <Link href="/legal/cookies" className="hover:text-brand-600">Cookies</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

/** Reusable prose building blocks for legal pages. */
export function LegalSection({
  heading,
  children,
}: {
  heading?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 first:mt-0">
      {heading && (
        <h2 className="text-xl font-black tracking-tight">{heading}</h2>
      )}
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-soft">
        {children}
      </div>
    </section>
  );
}

export function legalMetadata(title: string, description?: string): Metadata {
  return {
    title,
    ...(description ? { description } : {}),
    robots: { index: true, follow: true },
  };
}
