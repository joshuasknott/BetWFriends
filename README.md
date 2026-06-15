# betwfriends

BetWFriends is a friends-only social betting app for low-stakes everyday wagers.
Groups can create private betting circles, place stakes from an internal wallet,
and settle outcomes transparently. There is no bookmaker, no house edge, and no
rake.

## What It Does

- Create private groups and invite friends with shareable codes.
- Propose playful bets with stakes, deadlines, and custom Yes/No-style sides.
- Place, switch, or withdraw wagers while a bet is open.
- Settle bets fairly, splitting the pot among winners or refunding everyone on a
  void/cancelled result.
- Manage a wallet with mock demo top-ups or live Stripe top-ups.
- Browse a polished, responsive marketing page and authenticated app UI.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS v4 with CSS-based design tokens
- Prisma 7 and SQLite through `@prisma/adapter-better-sqlite3`
- JWT sessions with `jose`, password hashing with `bcryptjs`
- Stripe for live wallet top-ups, with mock mode for local demos

## Quick Start

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run seed
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Demo Accounts

After seeding, sign in with any of these accounts. The password is `password`.

| Email | Person |
| --- | --- |
| `josh@example.com` | Josh Bennett |
| `mark@example.com` | Mark Quinn |
| `jenny@example.com` | Jenny Lee |
| `sam@example.com` | Sam Okafor |
| `alex@example.com` | Alex Day |
| `priya@example.com` | Priya Shah |

Demo invite codes:

- `LUCKY-FOX-42` for Saturday Squad
- `BOLD-BEAR-77` for Flat 4B

## Environment

Use `.env.example` as the starting point.

```bash
DATABASE_URL="file:./dev.db"
SESSION_SECRET="replace-with-a-long-random-secret"
PAYMENT_MODE="mock"
```

Mock mode makes wallet top-ups instant and free for local demos. To enable live
Stripe top-ups, set:

```bash
PAYMENT_MODE="live"
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Register a Stripe webhook for `payment_intent.succeeded` at
`/api/stripe/webhook`.

## Useful Commands

```bash
npm run dev        # start the local Next.js server
npm run build      # production build
npm run lint       # run ESLint
npm run db:migrate # apply Prisma migrations
npm run seed       # load demo users, groups, bets, and wallet data
```

## Project Structure

```text
app/
  page.tsx                public marketing page
  login/, register/       auth screens
  (app)/                  authenticated routes
    dashboard/            group overview and live bets
    groups/               group creation, joining, detail, and bet creation
    bets/                 bet detail, wagering, settlement
    wallet/               balance, top-up, transaction history
    profile/              account and betting stats
  api/                    auth, groups, bets, wallet, and Stripe routes
components/               shared UI, branding, bet cards, forms
lib/                      Prisma, sessions, validation, payments, bet logic
prisma/                   schema, migrations, seed data
public/brand/             logo assets
```

## Product Notes

BetWFriends uses a wallet model. Individual bets are internal ledger transfers,
not card payments, so release does not need a minimum bet amount. Stripe fees
apply only to top-ups, which is why wallet top-ups enforce a minimum amount.

This product is intended for small, social wagers between people who know each
other. Keep it friendly. 18+ only.
