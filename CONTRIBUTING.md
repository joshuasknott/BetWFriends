# Contributing to BetWFriends

Thanks for your interest in contributing! This guide covers the basics.

## Prerequisites

- Node.js 20+
- pnpm 10+ (`npm install -g pnpm`)
- SQLite (included via `better-sqlite3` — no separate install needed)

## Getting Started

```bash
git clone <repo-url>
cd betwfriends
pnpm install
cp .env.example .env
pnpm run db:migrate
pnpm run seed
pnpm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Common Commands

```bash
pnpm run dev          # start dev server with hot reload
pnpm run build        # production build
pnpm run lint         # ESLint
pnpm run test         # run unit tests (Vitest)
pnpm run test:e2e     # run E2E tests (Playwright)
pnpm run db:migrate   # apply Prisma migrations
pnpm run seed         # load demo data
pnpm run db:studio    # open Prisma Studio (DB browser)
```

## Project Structure

```
app/
  (app)/              authenticated routes (dashboard, groups, bets, wallet, profile)
  api/                API route handlers
  legal/              privacy, terms, responsible play, cookies
components/           shared React components
lib/                  server-side libraries (prisma, session, betting, payments, etc.)
prisma/               schema, migrations, seed
tests/
  unit/               Vitest unit tests
  e2e/                Playwright E2E tests
```

## Code Style

- **No semicolons** — match the existing codebase
- **Double quotes** for strings
- TypeScript strict mode — no `any` without justification
- Use the `@/` path alias for imports from the project root

## Making Changes

1. Create a branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Add or update tests in `tests/`
4. Ensure all checks pass:
   ```bash
   pnpm run lint && pnpm run test && pnpm run build
   ```
5. Commit with a clear message
6. Open a pull request

## Testing

- **Unit tests** (`tests/unit/`): cover business logic, utilities, validation
- **E2E tests** (`tests/e2e/`): cover the full user journey in a browser

When adding new API routes or business logic, add corresponding unit tests.

## Database Changes

1. Edit `prisma/schema.prisma`
2. Create a migration: `pnpm run db:migrate -- --name your_change`
3. Update the seed script if needed: `prisma/seed.ts`
4. Commit both the schema change and the generated migration

## Reporting Issues

Use GitHub Issues. Include:
- Steps to reproduce
- Expected vs actual behaviour
- Browser/device if it's a UI issue
