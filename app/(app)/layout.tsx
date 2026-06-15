import Link from "next/link";
import { requireUser, publicUser } from "@/lib/session";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const pub = publicUser(user);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader user={pub} />
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
