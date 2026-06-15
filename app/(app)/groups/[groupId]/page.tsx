import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AvatarStack, Avatar } from "@/components/brand";
import { CopyButton } from "@/components/copy-button";
import { BetCard } from "@/components/bet-card";
import { LeaveGroupButton } from "@/components/leave-group-button";
import { relativeTime, formatMoney } from "@/lib/utils";
import { computeLeaderboard } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const user = await requireUser();
  const { groupId } = await params;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: { user: true },
        orderBy: { joinedAt: "asc" },
      },
      bets: {
        include: {
          sides: true,
          wagers: { include: { user: true } },
          creator: true,
        },
        orderBy: { createdAt: "desc" },
      },
      createdBy: true,
    },
  });

  if (!group) notFound();

  const membership = group.members.find((m) => m.userId === user.id);
  if (!membership) notFound();

  const openBets = group.bets.filter((b) => b.status === "open");
  const resolvedBets = group.bets.filter((b) => b.status !== "open");
  const leaderboard = computeLeaderboard(group.bets, group.members);
  const hasSettledBets = resolvedBets.some((b) => b.status === "settled");

  return (
    <div className="container-app py-10 sm:py-14">
      {/* Group hero */}
      <div className="card relative overflow-hidden p-7 sm:p-9">
        <div
          className="absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-[0.12]"
          style={{ backgroundColor: group.color }}
        />
        <div
          className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full opacity-[0.06]"
          style={{ backgroundColor: group.color }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <span
              className="grid h-[4.5rem] w-[4.5rem] shrink-0 place-items-center rounded-[1.4rem] text-4xl ring-1 ring-brand-100"
              style={{ backgroundColor: `${group.color}26` }}
            >
              {group.emoji}
            </span>
            <div>
              <p className="eyebrow">Group</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-4xl">
                {group.name}
              </h1>
              {group.description && (
                <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
                  {group.description}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-ink-soft">
                <span className="flex items-center gap-2">
                  <AvatarStack
                    size="sm"
                    people={group.members.map((m) => ({
                      name: m.user.name,
                      color: m.user.avatarColor,
                    }))}
                  />
                  {group.members.length} members
                </span>
                <span className="text-ink-soft/60">·</span>
                <span>created {relativeTime(group.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2.5">
            <Link
              href={`/groups/${group.id}/bet/new`}
              className="btn-primary rounded-xl px-5 py-3 text-sm"
            >
              + New bet
            </Link>
            <div className="flex items-center gap-2.5 rounded-2xl bg-brand-50 px-4 py-2.5 ring-1 ring-brand-100">
              <div className="text-right leading-none">
                <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                  Invite code
                </div>
                <div className="mt-0.5 font-mono text-sm font-black tracking-wide text-brand-700">
                  {group.inviteCode}
                </div>
              </div>
              <CopyButton value={group.inviteCode} label="Copy" />
            </div>
          </div>
        </div>
      </div>

      {/* Open bets */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="h-section">
            Live bets {openBets.length > 0 && `· ${openBets.length}`}
          </h2>
        </div>

        {openBets.length === 0 ? (
          <div className="card mt-4 flex flex-col items-center gap-4 px-6 py-14 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-[1.3rem] bg-brand-50 text-3xl ring-1 ring-brand-100">
              🎯
            </div>
            <div className="max-w-sm">
              <h3 className="text-xl font-black tracking-tight">
                No live bets right now
              </h3>
              <p className="mx-auto mt-1.5 text-sm leading-relaxed text-ink-soft">
                Be the first to call it. What's happening in the group today?
              </p>
            </div>
            <Link
              href={`/groups/${group.id}/bet/new`}
              className="btn-primary rounded-xl px-5 py-3 text-sm"
            >
              + Start a bet
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {openBets.map((bet) => (
              <BetCard key={bet.id} bet={bet} href={`/bets/${bet.id}`} />
            ))}
          </div>
        )}
      </section>

      {/* Past bets */}
      {resolvedBets.length > 0 && (
        <section className="mt-10">
          <h2 className="h-section">Settled & past</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {resolvedBets.map((bet) => (
              <BetCard key={bet.id} bet={bet} href={`/bets/${bet.id}`} />
            ))}
          </div>
        </section>
      )}

      {/* Leaderboard */}
      {hasSettledBets && (
        <section className="mt-10">
          <h2 className="h-section">Leaderboard</h2>
          <div className="card mt-4 divide-y divide-brand-50">
            {leaderboard.map((entry, idx) => {
              const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : null;
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3.5 px-5 py-4 ${entry.userId === user.id ? "bg-brand-50/50" : ""}`}
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center text-lg font-black text-ink-soft">
                    {medal ?? idx + 1}
                  </div>
                  <Avatar name={entry.name} color={entry.avatarColor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black">
                      {entry.name}
                      {entry.userId === user.id && (
                        <span className="ml-2 text-xs font-bold text-brand-600">(you)</span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-ink-soft">
                      {entry.betsWon}W · {entry.betsLost}L
                      {entry.betsWon + entry.betsLost > 0 && (
                        <> · {Math.round(entry.winRate)}% win rate</>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-black ${entry.netProfit >= 0 ? "text-teal-600" : "text-rose-500"}`}>
                      {entry.netProfit >= 0 ? "+" : ""}
                      {formatMoney(entry.netProfit)}
                    </div>
                    <div className="text-[10px] font-bold text-ink-soft">
                      net {entry.netProfit >= 0 ? "up" : "down"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Members */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="h-section">Members · {group.members.length}</h2>
        </div>
        <div className="card mt-4 divide-y divide-brand-50">
          {group.members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3.5 px-5 py-3.5"
            >
              <Avatar name={m.user.name} color={m.user.avatarColor} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-black">
                  {m.user.name}
                  {m.userId === user.id && (
                    <span className="ml-2 text-xs font-bold text-brand-600">
                      (you)
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-ink-soft">
                  joined {relativeTime(m.joinedAt)}
                </div>
              </div>
              {m.userId === group.createdById && (
                <span className="badge bg-brand-50 text-brand-700">creator</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <LeaveGroupButton
            groupId={group.id}
            groupName={group.name}
            isCreator={group.createdById === user.id}
            memberCount={group.members.length}
          />
        </div>
      </section>
    </div>
  );
}
