# BetWFriends

Next.js frontend with Convex auth/data and Stripe or mock wallet funding. Use pnpm and the existing lockfile. Read README.md and CONTRIBUTING.md for setup.

- Start the frontend with `pnpm dev` and the intended development backend with `pnpm convex`.
- Use `pnpm lint`, `pnpm test`, and `pnpm build` for affected implementation. Use `pnpm test:e2e` for changed account, betting, wallet, or settlement flows.
- Preserve group authorization, wallet accounting, settlement/refund invariants, rate limits, and age restrictions.
- Keep mock funding visibly distinct from live Stripe activity. Verify the selected deployment before seed, migration, payment, or deployment commands; setup examples are not permission to mutate production.
- Consult the applicable Convex guidance when changing backend code. Keep generated output generated.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
