import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";

// All authenticated app routes are dynamic — they depend on the signed-in
// user and live Convex data, so they must never be statically prerendered.
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The proxy already gates this route on authentication, so a token is present.
  const token = await convexAuthNextjsToken();
  const user = await fetchQuery(
    api.profile.getMe,
    {},
    token ? { token } : {},
  );

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        user={{
          name: user.name,
          avatarColor: user.avatarColor,
          balance: user.balance,
        }}
      />
      {/* pb-20 on mobile clears the fixed bottom nav; lg:pb-0 removes it on desktop */}
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <footer className="hidden border-t border-brand-100/70 bg-[#fffefe] lg:block">
        <div className="container-app flex items-center justify-between gap-3 py-6 text-xs text-ink-soft">
          <p>18+ only · Play responsibly · © {new Date().getFullYear()} BetWFriends</p>
          <nav className="flex flex-wrap gap-4 font-semibold">
            <Link href="/legal/privacy" className="hover:text-brand-600">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-brand-600">Terms</Link>
            <Link href="/legal/responsible-play" className="hover:text-brand-600">Responsible play</Link>
            <Link href="/legal/cookies" className="hover:text-brand-600">Cookies</Link>
          </nav>
        </div>
      </footer>
      <BottomNav />
    </div>
  );
}
