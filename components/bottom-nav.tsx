"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Bottom navigation bar for mobile.
 *
 * Shows only on small screens (lg:hidden). Provides thumb-friendly access to
 * the four main destinations: Groups (dashboard), Wallet, Join, Profile. Each
 * tab is 44px+ tall for accessible touch targets.
 *
 * The top AppHeader keeps its desktop nav for lg+ screens; on mobile the nav
 * collapses and this bottom bar takes over.
 */
type Tab = {
  href: string;
  label: string;
  icon: (props: IconProps) => React.ReactElement;
  match: (p: string) => boolean;
  primary?: boolean;
};

const TABS: readonly Tab[] = [
  {
    href: "/dashboard",
    label: "Groups",
    icon: HomeIcon,
    match: (p: string) => p === "/dashboard" || p.startsWith("/groups"),
  },
  {
    href: "/wallet",
    label: "Wallet",
    icon: WalletIcon,
    match: (p: string) => p.startsWith("/wallet"),
  },
  {
    href: "/groups/new",
    label: "New",
    icon: PlusIcon,
    match: (p: string) => p === "/groups/new",
    primary: true,
  },
  {
    href: "/groups/join",
    label: "Join",
    icon: TicketIcon,
    match: (p: string) => p.startsWith("/groups/join"),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: UserIcon,
    match: (p: string) => p.startsWith("/profile"),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-100/80 bg-[#fffefe]/95 backdrop-blur-lg lg:hidden"
      // Keep the bar clear of the iOS home indicator.
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-[480px] items-stretch justify-around px-2">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          if (tab.primary) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-label={tab.label}
                aria-current={active ? "page" : undefined}
                className="-mt-5 flex flex-col items-center gap-1 px-3"
              >
                <span
                  className={`grid h-14 w-14 place-items-center rounded-full text-white shadow-lg transition active:scale-90 ${
                    active
                      ? "bg-gradient-to-br from-brand-600 to-grape"
                      : "bg-gradient-to-br from-brand-500 to-grape"
                  }`}
                  style={{ boxShadow: "0 8px 20px -6px var(--color-brand-500)" }}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-[10px] font-black text-brand-600">
                  {tab.label}
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 px-2 py-2 transition ${
                active ? "text-brand-600" : "text-ink-soft"
              }`}
            >
              <Icon className="h-5 w-5" filled={active} />
              <span className={`text-[10px] font-bold ${active ? "font-black" : ""}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* --- Icons (inline SVG, no external dependency) --- */

type IconProps = { className?: string; filled?: boolean };

function HomeIcon({ className, filled }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5" />
      <path d="M5 10v10h14V10" />
      {filled && <path d="M5 10v10h14V10L12 4z" stroke="none" opacity="0.3" />}
    </svg>
  );
}

function WalletIcon({ className, filled }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
      <path d="M3 7V5a1 1 0 0 1 1-1h11" />
      <circle cx="16" cy="13" r="1.5" fill={filled ? "#fff" : "currentColor"} stroke="none" />
    </svg>
  );
}

function PlusIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TicketIcon({ className, filled }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9a2 2 0 0 1 0-2 2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 1 0 2v6a2 2 0 0 1 0 2 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 1 0-2V9z" />
      <path d="M14 5v2M14 11v2M14 17v2" strokeDasharray="1 2" />
    </svg>
  );
}

function UserIcon({ className, filled }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}
