# Contributing to BetWFriends

Thanks for your interest in contributing. This guide covers the basics.

## Prerequisites

- Node.js 20+
- pnpm 10+ (`npm install -g pnpm`)
- A Convex deployment for backend data and auth

## Getting Started

```bash
git clone <repo-url>
cd betwfriends
pnpm install
cp .env.example .env
pnpm run convex
pnpm run seed
pnpm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).
Run `pnpm run convex` in a separate terminal during development.

## Common Commands

```bash
pnpm run dev           # start dev server with hot reload
pnpm run build         # production build
pnpm run lint          # ESLint
pnpm run convex        # run Convex dev backend/codegen
pnpm run convex:deploy # deploy Convex functions
pnpm run test          # run unit tests (Vitest)
pnpm run test:e2e      # run E2E tests (Playwright)
pnpm run seed          # load demo data
```

## Project Structure

```text
app/
  (app)/              authenticated routes (dashboard, groups, bets, wallet, profile)
  api/                Convex Auth route handler
  legal/              privacy, terms, responsible play, cookies
components/           shared React components
convex/               backend schema, auth, queries, mutations, actions, seed data
lib/                  shared betting logic, validation, env, leaderboard, utilities
tests/
  unit/               Vitest unit tests
  e2e/                Playwright E2E tests
```

## Code Style

- Double quotes for strings
- TypeScript strict mode - no `any` without justification
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

When adding Convex functions or shared business logic, add corresponding tests.

## Convex Changes

1. Edit `convex/schema.ts` and the relevant Convex function files.
2. Run `pnpm run convex` so generated types stay current.
3. Update the seed script if needed: `convex/seed.ts`.
4. Commit schema, function, generated type, and test changes together.

## Reporting Issues

Use GitHub Issues. Include:

- Steps to reproduce
- Expected vs actual behaviour
- Browser/device if it is a UI issue
