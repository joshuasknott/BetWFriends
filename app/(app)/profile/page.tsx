import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Avatar, Underline } from "@/components/brand";
import { ProfileEditor } from "@/components/profile-editor";
import { PasswordChanger } from "@/components/password-changer";
import { AccountDangerZone } from "@/components/account-danger-zone";
import { formatDate, formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();

  const [groupsCount, betsCreated, wagersPlaced, wins] = await Promise.all([
    prisma.groupMember.count({ where: { userId: user.id } }),
    prisma.bet.count({ where: { creatorId: user.id } }),
    prisma.wager.count({ where: { userId: user.id } }),
    prisma.transaction.findMany({
      where: { userId: user.id, type: "payout", note: { startsWith: "Winnings" } },
      select: { amount: true },
    }),
  ]);

  const totalWon = wins.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="container-app py-10 sm:py-14">
      <p className="eyebrow">Profile</p>
      <h1 className="mt-3 text-4xl font-black leading-[1.02] tracking-[-0.055em] sm:text-5xl">
        Your <Underline>stats.</Underline>
      </h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Identity card */}
        <div className="card p-7 text-center">
          <div className="mx-auto w-fit">
            <Avatar
              name={user.name}
              color={user.avatarColor}
              size="lg"
              className="!h-24 !w-24 !text-3xl"
            />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight">{user.name}</h2>
          <p className="text-sm font-semibold text-ink-soft">{user.email}</p>
          <p className="mt-1 text-xs font-semibold text-ink-soft">
            Member since {formatDate(user.createdAt)}
          </p>

          <div className="mt-6 rounded-[1.25rem] bg-gradient-to-br from-brand-50 to-brand-100/50 p-5 ring-1 ring-brand-100">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-ink-soft">
              Balance
            </div>
            <div className="mt-1 text-3xl font-black text-brand-700">
              {formatMoney(user.balance)}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="card p-7">
          <h2 className="text-base font-black tracking-tight">Your record</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Groups" value={groupsCount} emoji="👥" />
            <Stat label="Bets made" value={betsCreated} emoji="🎯" />
            <Stat label="Bets entered" value={wagersPlaced} emoji="🎲" />
            <Stat label="Wins" value={wins.length} emoji="🏆" />
            <div className="rounded-[1.1rem] bg-gradient-to-br from-amber-50 to-amber-100/40 p-4 text-center ring-1 ring-amber-100">
              <div className="text-2xl">💰</div>
              <div className="mt-1 text-xl font-black text-amber-700">
                {formatMoney(totalWon)}
              </div>
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-amber-600">
                total won
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings sections */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ProfileEditor name={user.name} avatarColor={user.avatarColor} />
        <PasswordChanger />
      </div>

      <AccountDangerZone />
    </div>
  );
}

function Stat({
  label,
  value,
  emoji,
}: {
  label: string;
  value: number;
  emoji: string;
}) {
  return (
    <div className="rounded-[1.1rem] bg-brand-50 p-4 text-center ring-1 ring-brand-100">
      <div className="text-2xl">{emoji}</div>
      <div className="mt-1 text-2xl font-black text-brand-700">{value}</div>
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-600">
        {label}
      </div>
    </div>
  );
}
