# BetWFriends

**Bet on life, with your mates.**

BetWFriends is a friends-only social betting app for low-stakes everyday wagers.
Groups create private betting circles, place stakes from an internal wallet, and
settle outcomes transparently. No bookmaker. No house edge. No rake.

## Features

- **Private groups** with shareable invite codes
- **Playful bets** with custom Yes/No sides, stakes, and deadlines
- **Live wagering** - place, switch, or withdraw wagers while a bet is open
- **Fair settlement** - winners split the pot proportionally; voids refund everyone
- **Internal wallet** with demo top-ups or live Stripe payments
- **Group leaderboard** tracking wins, losses, and net profit
- **Profile management** - edit name/avatar, change password, delete account
- **Mobile-first design** with bottom nav bar and PWA installability
- **Legal compliance** - Privacy Policy, Terms, Responsible Play, Cookie Policy, 18+ enforcement
- **Security hardened** - Convex Auth, route gating, rate limiting, and security headers

## Tech Stack

- **Next.js 16** App Router, **React 19**, **TypeScript**
- **Tailwind CSS v4** with CSS-based design tokens
- **Convex** for data, auth, realtime queries, mutations, and HTTP actions
- **Stripe** for live wallet top-ups (with mock mode for demos)
- **Vitest** for unit tests, **Playwright** for E2E tests

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm run convex
pnpm run seed
pnpm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).
Run `pnpm run convex` in a separate terminal while developing so the Convex
backend stays available.

### Demo Accounts

After seeding, sign in with any of these. Password: `password`.

| Email | Person |
| --- | --- |
| `josh@example.com` | Josh Bennett |
| `mark@example.com` | Mark Quinn |
| `jenny@example.com` | Jenny Lee |
| `sam@example.com` | Sam Okafor |
| `alex@example.com` | Alex Day |
| `priya@example.com` | Priya Shah |

Demo invite codes: `LUCKY-FOX-42` (Saturday Squad) and `BOLD-BEAR-77` (Flat 4B).

## Environment

Copy `.env.example` to `.env`:

```bash
NEXT_PUBLIC_CONVEX_URL="https://your-deployment.convex.cloud"
PAYMENT_MODE="mock"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Live Stripe Payments

```bash
PAYMENT_MODE="live"
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Register a Stripe webhook for `payment_intent.succeeded` at your Convex HTTP
action: `https://<deployment>.convex.site/stripe`.

## Commands

```bash
pnpm run dev           # start dev server
pnpm run build         # production build
pnpm run start         # run production build
pnpm run lint          # ESLint
pnpm run convex        # run Convex dev backend/codegen
pnpm run convex:deploy # deploy Convex functions
pnpm run test          # unit tests (Vitest)
pnpm run test:e2e      # E2E tests (Playwright)
pnpm run seed          # load demo data
```

## Deployment

### Docker

```bash
# Build and run with docker-compose
docker compose up -d

# Or build manually
docker build -t betwfriends .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_CONVEX_URL="https://your-deployment.convex.cloud" \
  betwfriends
```

The Docker image uses Next.js standalone output for a minimal size. The backend
and persisted data live in Convex, not inside the container.

### Vercel / Managed Platforms

Deploy the Convex backend with `pnpm run convex:deploy`, then set
`NEXT_PUBLIC_CONVEX_URL` on the frontend hosting platform. For live Stripe
payments, set Stripe secrets as Convex deployment variables.

## Project Structure

```text
app/
  page.tsx              marketing landing
  login/ register/      auth screens
  (app)/                authenticated routes
    dashboard/          group overview + live bets
    groups/             create, join, detail, bet creation
    bets/               bet detail, wagering, settlement
    wallet/             balance, top-up, transactions
    profile/            stats, edit, password, delete account
  api/                  Convex Auth route handler
  legal/                privacy, terms, responsible play, cookies
  error.tsx             production error boundary
components/             shared UI (header, bottom nav, bet cards, forms)
convex/                 schema, auth, queries, mutations, actions, seed data
lib/                    pure betting logic, validation, env config,
                        leaderboard, and shared utilities
tests/                  unit (Vitest) and e2e (Playwright)
proxy.ts                security proxy and route gating
```

## Testing

```bash
pnpm run test           # unit tests
pnpm run test:e2e       # Playwright E2E (desktop + mobile viewports)
```

Unit tests cover: betting payout logic, money/time utilities, validation schemas,
leaderboard computation, and environment helpers.

E2E tests cover: authentication, group navigation, wallet, profile, legal pages.

## Legal & Responsible Play

BetWFriends is a **private social wagering app**, not a licensed gambling operator.
There is no bookmaker, no odds-setting, and no rake. It is intended for small,
friendly wagers between consenting adults (18+) who know each other.

- [Privacy Policy](https://betwfriends.app/legal/privacy)
- [Terms of Service](https://betwfriends.app/legal/terms)
- [Responsible Play](https://betwfriends.app/legal/responsible-play)
- [Cookie Policy](https://betwfriends.app/legal/cookies)

If betting stops being fun, contact [GamCare](https://www.gamcare.org.uk) (0808 8020 133)
or [BeGambleAware](https://www.begambleaware.org).

## License

Proprietary. Copyright BetWFriends. All rights reserved.
