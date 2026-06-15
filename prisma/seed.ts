import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";

const adapter = new PrismaBetterSqlite3({
  url: path.join(process.cwd(), "dev.db"),
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding BetWFriends demo data...");

  // Wipe existing data (dev only)
  await prisma.wager.deleteMany();
  await prisma.betSide.deleteMany();
  await prisma.bet.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password", 10);

  const users = await Promise.all(
    [
      { name: "Josh Bennett", email: "josh@example.com", avatarColor: "#7c3aed", balance: 4500 },
      { name: "Mark Quinn", email: "mark@example.com", avatarColor: "#db2777", balance: 1800 },
      { name: "Jenny Lee", email: "jenny@example.com", avatarColor: "#0d9488", balance: 3200 },
      { name: "Sam Okafor", email: "sam@example.com", avatarColor: "#ea580c", balance: 600 },
      { name: "Alex Day", email: "alex@example.com", avatarColor: "#0891b2", balance: 950 },
      { name: "Priya Shah", email: "priya@example.com", avatarColor: "#9333ea", balance: 2400 },
    ].map((u) =>
      prisma.user.create({ data: { ...u, passwordHash } }),
    ),
  );

  const [josh, mark, jenny, sam, alex, priya] = users;

  // Group 1: Saturday Squad
  const squad = await prisma.group.create({
    data: {
      name: "Saturday Squad",
      description: "Weekend warriors. Mostly here to roast Mark.",
      emoji: "🍺",
      color: "#7c3aed",
      inviteCode: "LUCKY-FOX-42",
      createdById: josh.id,
      members: {
        create: users.map((u) => ({ userId: u.id })),
      },
    },
  });

  // Group 2: Flat 4B
  const flat = await prisma.group.create({
    data: {
      name: "Flat 4B",
      description: "Chores, bins, and who finished the milk.",
      emoji: "🏠",
      color: "#0d9488",
      inviteCode: "BOLD-BEAR-77",
      createdById: josh.id,
      members: {
        create: [josh, jenny, sam].map((u) => ({ userId: u.id })),
      },
    },
  });

  // Helper to create a yes/no bet
  async function createBet(opts: {
    groupId: string;
    creatorId: string;
    title: string;
    description?: string;
    amount: number;
    closesInHours: number;
    wagers?: { userId: string; side: "yes" | "no" }[];
  }) {
    const closesAt = new Date(Date.now() + opts.closesInHours * 3_600_000);
    const bet = await prisma.bet.create({
      data: {
        groupId: opts.groupId,
        creatorId: opts.creatorId,
        title: opts.title,
        description: opts.description ?? null,
        amount: opts.amount,
        closesAt,
        sides: { create: [{ label: "Yes" }, { label: "No" }] },
      },
      include: { sides: true },
    });
    const [yesSide, noSide] = bet.sides;
    if (opts.wagers) {
      await Promise.all(
        opts.wagers.map((w) =>
          prisma.wager.create({
            data: {
              betId: bet.id,
              sideId: w.side === "yes" ? yesSide.id : noSide.id,
              userId: w.userId,
              amount: opts.amount,
            },
          }),
        ),
      );
      // Debit stakes via transactions + balance (for realism)
      await Promise.all(
        opts.wagers.map((w) =>
          prisma.user.update({
            where: { id: w.userId },
            data: { balance: { decrement: opts.amount } },
          }),
        ),
      );
      await Promise.all(
        opts.wagers.map((w) =>
          prisma.transaction.create({
            data: {
              userId: w.userId,
              type: "stake",
              amount: -opts.amount,
              note: `Stake: ${opts.title}`,
            },
          }),
        ),
      );
    }
    return bet;
  }

  // Open bets in Saturday Squad
  await createBet({
    groupId: squad.id,
    creatorId: josh.id,
    title: "Mark blacks out before midnight",
    description: "It's Saturday. We all know how this ends.",
    amount: 1000,
    closesInHours: 3,
    wagers: [
      { userId: josh.id, side: "yes" },
      { userId: jenny.id, side: "yes" },
      { userId: priya.id, side: "no" },
      { userId: mark.id, side: "no" },
    ],
  });

  await createBet({
    groupId: squad.id,
    creatorId: jenny.id,
    title: "Sam actually cooks dinner tonight",
    description: "Deliveroo is on speed dial though...",
    amount: 500,
    closesInHours: 6,
    wagers: [
      { userId: jenny.id, side: "no" },
      { userId: alex.id, side: "no" },
      { userId: sam.id, side: "yes" },
    ],
  });

  await createBet({
    groupId: squad.id,
    creatorId: alex.id,
    title: "Jordan's band plays past 11pm",
    amount: 200,
    closesInHours: 48,
    wagers: [{ userId: alex.id, side: "yes" }],
  });

  // A settled bet to show the resolved state
  const settled = await prisma.bet.create({
    data: {
      groupId: squad.id,
      creatorId: priya.id,
      title: "Jenny runs the Sunday 5k",
      description: "She swore she would. She did not.",
      amount: 300,
      status: "settled",
      outcome: "No",
      closesAt: new Date(Date.now() - 86400000),
      settledAt: new Date(Date.now() - 3600000),
      sides: { create: [{ label: "Yes" }, { label: "No" }] },
    },
    include: { sides: true },
  });
  const [yesS, noS] = settled.sides;
  await prisma.wager.createMany({
    data: [
      { betId: settled.id, sideId: yesS.id, userId: josh.id, amount: 300 },
      { betId: settled.id, sideId: noS.id, userId: priya.id, amount: 300 },
      { betId: settled.id, sideId: noS.id, userId: mark.id, amount: 300 },
    ],
  });
  // Priya & Mark won the pot (600 split = 300 each)
  await prisma.user.update({
    where: { id: priya.id },
    data: { balance: { increment: 450 } },
  });
  await prisma.user.update({
    where: { id: mark.id },
    data: { balance: { increment: 450 } },
  });

  // Flat bets
  await createBet({
    groupId: flat.id,
    creatorId: jenny.id,
    title: "Sam takes the bins out on Tuesday",
    amount: 200,
    closesInHours: 30,
    wagers: [
      { userId: jenny.id, side: "no" },
      { userId: josh.id, side: "no" },
    ],
  });

  console.log("✅ Seed complete!");
  console.log("");
  console.log("Demo login (any of these):");
  users.forEach((u) =>
    console.log(`   ${u.email.padEnd(22)} password: "password"`),
  );
  console.log("");
  console.log(`Invite codes: ${squad.inviteCode}, ${flat.inviteCode}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
