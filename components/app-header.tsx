"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo, Avatar } from "@/components/brand";
import { api } from "@/lib/api-client";
import { formatMoneyShort } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Groups" },
  { href: "/wallet", label: "Wallet" },
  { href: "/groups/join", label: "Join group" },
  { href: "/profile", label: "Profile" },
];

export function AppHeader({
  user,
}: {
  user: { name: string; avatarColor: string; balance: number };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const showCreateGroupCta =
    pathname !== "/dashboard" && pathname !== "/groups/new";

  async function logout() {
    setLoggingOut(true);
    await api("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100/70 bg-[#fffefe]/85 backdrop-blur-lg">
      <div className="mx-auto flex h-[68px] w-full max-w-[1180px] items-center justify-between gap-3 px-5 sm:px-8 lg:px-12">
        <Link href="/dashboard" className="shrink-0">
          <Logo size="sm" />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-ink-soft lg:flex">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition hover:text-brand-600 ${
                  active ? "text-brand-700" : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/wallet"
            className="flex items-center gap-2.5 rounded-xl border border-brand-200 bg-white px-3.5 py-2 transition hover:bg-brand-50"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-grape text-sm">
              💷
            </span>
            <div className="text-right leading-none">
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                Balance
              </div>
              <div className="text-sm font-black text-brand-700">
                {formatMoneyShort(user.balance)}
              </div>
            </div>
          </Link>

          {showCreateGroupCta && (
            <Link
              href="/groups/new"
              className="btn-primary hidden rounded-xl px-4 py-2.5 text-sm sm:inline-flex"
            >
              + New group
            </Link>
          )}

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl p-1 pr-2 transition hover:bg-brand-50"
              aria-label="Account menu"
              aria-expanded={menuOpen}
            >
              <Avatar name={user.name} color={user.avatarColor} size="sm" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-12 z-50 w-56 animate-pop overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_-24px_rgba(45,27,105,0.35)] ring-1 ring-brand-100/70">
                  <div className="border-b border-brand-50 px-4 py-3.5">
                    <div className="text-sm font-black">{user.name}</div>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="text-xs font-bold text-brand-600 hover:underline"
                    >
                      View profile →
                    </Link>
                  </div>
                  <div className="p-1.5 lg:hidden">
                    {NAV_ITEMS.map((item) => {
                      const active =
                        item.href === "/dashboard"
                          ? pathname === item.href
                          : pathname.startsWith(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className={`block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-brand-50 ${
                            active ? "bg-brand-50 text-brand-700" : ""
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                  <div className="border-t border-brand-50 p-1.5">
                    {showCreateGroupCta && (
                      <Link
                        href="/groups/new"
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-brand-50 lg:hidden"
                      >
                        + New group
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      disabled={loggingOut}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-rose-600 hover:bg-rose-50"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
