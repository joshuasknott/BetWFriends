import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { AvatarStack, Underline } from "@/components/brand";
import { relativeTime, formatMoneyShort } from "@/lib/utils";
import { api } from "@/convex/_generated/api";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const token = await convexAuthNextjsToken();
  const opts = token ? { token } : {};

  const [me, groups, activeBets] = await Promise.all([
    fetchQuery(api.profile.getMe, {}, opts),
    fetchQuery(api.groups.listMyGroups, {}, opts),
    fetchQuery(api.bets.listActiveBets, {}, opts),
  ]);

  const firstName = me.name.split(" ")[0];
  const totalActive = activeBets.length;

  return (
    <div className="container-app py-10 sm:py-14">
      {/* Hero greeting */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="eyebrow">Your betting circle</p>
          <h1 className="mt-4 text-4xl font-black leading-[1.02] tracking-[-0.055em] sm:text-5xl">
            Hey, {firstName}. <Underline>Game on.</Underline>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
            {groups.length === 0
              ? "Let's get your first group going — invite your mates and start the banter."
              : totalActive > 0
                ? `${totalActive} active ${totalActive === 1 ? "bet needs" : "bets need"} your call. Don't keep your mates waiting.`
                : "You're all caught up. Time to start the next one?"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/groups/join"
            className="rounded-xl border border-brand-200 bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-brand-50"
          >
            🔗 Join group
          </Link>
          <Link href="/groups/new" className="btn-primary rounded-xl px-5 py-3 text-sm">
            + New group <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* Active bets quick view */}
      {activeBets.length > 0 && (
        <section className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className="h-section">Hot bets · waiting on you</h2>
            <span className="text-xs font-bold text-amber-600">
              {totalActive} live
            </span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeBets.map((bet) => (
              <Link
                key={bet.id}
                href={`/bets/${bet.id}`}
                className="card group block p-5 transition-transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="badge text-white"
                    style={{ backgroundColor: bet.group?.color }}
                  >
                    {bet.group?.emoji} {bet.group?.name}
                  </span>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-extrabold text-amber-700">
                    ⏱ {relativeTime(bet.closesAt)}
                  </span>
                </div>
                <p className="mt-4 line-clamp-2 text-base font-black leading-snug">
                  {bet.title}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-brand-50 pt-3 text-xs font-bold">
                  <span className="text-ink-soft">
                    {formatMoneyShort(bet.amount)} stake
                  </span>
                  <span className="rounded-lg bg-brand-50 px-2.5 py-1.5 text-brand-700">
                    {bet.wagers.length} in
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Groups */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="h-section">Your groups</h2>
          {groups.length > 0 && (
            <span className="text-xs font-bold text-ink-soft">
              {groups.length} {groups.length === 1 ? "group" : "groups"}
            </span>
          )}
        </div>

        {groups.length === 0 ? (
          <div className="card mt-4 flex flex-col items-center gap-5 px-6 py-16 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-[1.75rem] bg-gradient-to-br from-brand-100 to-brand-50 text-4xl ring-1 ring-brand-100">
              🎲
            </div>
            <div className="max-w-sm">
              <h3 className="text-2xl font-black tracking-tight">
                No groups yet
              </h3>
              <p className="mx-auto mt-2 text-sm leading-relaxed text-ink-soft">
                Create a group for your flatmates, your team, your Saturday squad —
                then start making bets. Low stakes. Big banter.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2.5">
              <Link href="/groups/new" className="btn-primary rounded-xl px-5 py-3 text-sm">
                + Create a group
              </Link>
              <Link
                href="/groups/join"
                className="rounded-xl border border-brand-200 bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-brand-50"
              >
                Join with a code
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => {
              const openCount = group.bets.length;
              const members = group.members.filter(
                (m): m is NonNullable<typeof m> => m !== null,
              );
              return (
                <Link
                  key={group.id}
                  href={`/groups/${group.id}`}
                  className="card group relative overflow-hidden p-6 transition-transform hover:-translate-y-1"
                >
                  <div
                    className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-10 transition-transform group-hover:scale-125"
                    style={{ backgroundColor: group.color }}
                  />
                  <div className="relative flex items-center gap-3.5">
                    <span
                      className="grid h-14 w-14 shrink-0 place-items-center rounded-[1.1rem] text-2xl ring-1 ring-brand-100"
                      style={{ backgroundColor: `${group.color}1a` }}
                    >
                      {group.emoji}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-black tracking-tight">
                        {group.name}
                      </h3>
                      <p className="text-xs font-semibold text-ink-soft">
                        {members.length} members · {relativeTime(group.createdAt)}
                      </p>
                    </div>
                  </div>
                  {group.description && (
                    <p className="relative mt-4 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                      {group.description}
                    </p>
                  )}
                  <div className="relative mt-5 flex items-center justify-between border-t border-brand-50 pt-4">
                    <AvatarStack
                      size="sm"
                      people={members.map((m) => ({
                        name: m.user.name,
                        color: m.user.avatarColor,
                      }))}
                    />
                    {openCount > 0 ? (
                      <span className="badge bg-amber-50 text-amber-700">
                        {openCount} live
                      </span>
                    ) : (
                      <span className="badge bg-brand-50 text-brand-700">
                        view →
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
