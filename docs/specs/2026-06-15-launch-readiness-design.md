# BetWFriends — Launch Readiness Design

**Date:** 2026-06-15
**Goal:** Take the existing, polished BetWFriends codebase from "working prototype" to a real, launchable, legally-backed product with tests, CI/CD, deployment config, legal pages, mobile+web polish, and a clean Git history of 100+ professional commits in a fresh GitHub repo.

## Current State Assessment

The codebase is already genuinely strong:
- Next.js 16 App Router, React 19, TypeScript, Tailwind v4
- Prisma 7 + SQLite via `better-sqlite3`, transactional betting logic
- JWT sessions (jose), bcrypt hashing, zod validation
- Stripe + mock payment modes with idempotent webhook
- Polished marketing page, auth, dashboard, groups, bets, wallet, profile
- Build passes, lint passes, types pass

## Gap Analysis (what "launch-ready" still needs)

### 1. Version Control Hygiene
- All work is uncommitted (only the Create Next App initial commit exists)
- Need: commit the existing work in logical chunks, create fresh GitHub repo

### 2. Testing (currently zero tests)
- **Unit tests:** `computePayouts`, `cancelBet`, money utils, validation schemas, bet stats
- **Integration tests:** API routes (auth, bets, wager, resolve, cancel, groups, join, topup)
- **E2E tests (Playwright):** register → create group → create bet → place wager → settle → check payouts; mobile + desktop viewports

### 3. Legal & Compliance (critical for a money-adjacent product)
- Privacy Policy page
- Terms of Service page
- Responsible Play / Safer Gambling page (links to GamCare, BeGambleAware)
- Cookie Policy page
- 18+ enforcement and clear disclaimers
- Footer with legal links on every page
- Marketing page must not imply it's a gambling operator

### 4. Security Hardening
- Security headers (HSTS, X-Frame-Options, CSP, etc.) via `next.config.ts`
- Rate limiting on auth + payment endpoints (in-memory token bucket)
- CSRF protection for state-changing POST routes (double-submit cookie)
- Input sanitization review (XSS — React escapes by default, but audit)
- Session secret validation at startup (fail fast in production if default)
- Withdrawal endpoint is referenced but doesn't exist — remove reference or implement

### 5. Mobile-First Polish (user priority)
- Audit every screen at 375px (iPhone SE) and 390px (iPhone 14)
- Add a bottom mobile nav bar for thumb-friendly navigation
- Ensure tap targets ≥ 44px
- Fix any horizontal overflow / text clipping
- Sticky action buttons on key screens
- Test forms for mobile keyboard UX (inputMode, autocomplete)

### 6. Production Deployment
- Dockerfile + docker-compose for self-hosting
- Postgres support for production (Prisma supports multiple providers via env)
- `vercel.json` / deployment docs
- Health check endpoint
- Proper error boundary + production error page (500)

### 7. Product Features for "real product" feel
- Email/password is fine, but add: password change, account deletion (GDPR)
- Group settings (rename, leave group)
- Bet comments / banter feed (lightweight)
- Notification preferences (in-app)
- Profile editing (name, avatar color)
- Leaderboard per group
- Settled bet history with filters

### 8. Developer Experience / Ops
- CI/CD via GitHub Actions (lint, typecheck, test, build)
- CONTRIBUTING.md, expanded README with deploy instructions
- Structured logging
- Environment variable validation at boot

## Execution Plan

The work is broken into commit-sized chunks so the resulting Git history is professional and reviewable. Each numbered item is ≥1 commit.

**Phase A — Foundation & VCS (commits 1-5)**
1. Commit existing codebase in logical chunks
2. Add `.env.example` validation + boot-time secret check
3. Expand README with full deploy docs

**Phase B — Security (commits 6-12)**
4. Security headers in next.config
5. Rate limiting middleware
6. CSRF double-submit token
7. Session secret validation
8. Remove dead withdrawal reference
9. Input sanitization audit

**Phase C — Legal (commits 13-17)**
10. Privacy Policy page + content
11. Terms of Service page + content
12. Responsible Play page + resources
13. Cookie Policy page
14. Footer with legal links + 18+ enforcement banner

**Phase D — Mobile-First Polish (commits 18-25)**
15. Bottom mobile nav bar component
16. Tap target + spacing audit across all screens
17. Bet detail mobile layout
18. Dashboard mobile grid
19. Marketing page mobile audit
20. Forms mobile keyboard UX
21. Sticky action buttons

**Phase E — Product Features (commits 26-40)**
22. Profile editing (name, avatar color)
23. Account deletion (GDPR)
24. Password change
25. Leave group
26. Group settings (rename, description, emoji)
27. Bet comments / banter
28. Group leaderboard
29. Bet history filters
30. Notification (in-app) basics

**Phase F — Testing (commits 41-55)**
31. Vitest setup + config
32. Unit tests: betting logic (payouts, edge cases)
33. Unit tests: utils (money, time, invite codes)
34. Unit tests: validation schemas
35. Integration tests: auth routes
36. Integration tests: bet/wager/resolve/cancel
37. Integration tests: groups + join
38. Integration tests: wallet + payments
39. Playwright E2E setup
40. E2E: full happy path (desktop)
41. E2E: full happy path (mobile viewport)

**Phase G — Production Deploy (commits 56-62)**
42. Dockerfile + docker-compose
43. Postgres provider support
44. Health check endpoint
45. Error boundary + 500 page
46. Structured logging
47. Deployment docs

**Phase H — CI/CD + Polish (commits 63-70+)**
48. GitHub Actions CI (lint, typecheck, test, build)
49. CONTRIBUTING.md
50. Final README polish
51. Create GitHub repo + push
52. Final verification

## Non-Goals (YAGNI)
- Real-time WebSockets (polling/refresh is fine for friends-scale)
- Native mobile apps (PWA is sufficient for this scope)
- KYC/AML (this is a friends-only social pot, not a gambling operator)
- Multi-currency (GBP only for launch)
- Admin dashboard (can be added post-launch)

## Key Design Decisions

1. **Stay on SQLite for dev, support Postgres for prod.** Prisma makes this clean. Self-hosters can use SQLite; managed deployments use Postgres.
2. **In-memory rate limiting** (no Redis dependency for launch). Simple token-bucket per IP+endpoint.
3. **Double-submit CSRF cookie** (no external dependency, works with JWT auth).
4. **Vitest for unit/integration, Playwright for E2E.** Standard Next.js testing stack.
5. **Legal pages as real content**, not placeholders — written for a UK friends-only social betting context with appropriate disclaimers that it's not a licensed gambling operator.
