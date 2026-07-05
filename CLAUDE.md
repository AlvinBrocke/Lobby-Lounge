# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package manager

Always use `pnpm`. Never use `npm install` or `yarn`.

## Commands

```bash
pnpm dev      # Next.js dev server (port 3000)
pnpm build    # Production build — run this before opening a PR
```

**Note:** `pnpm lint` (`next lint`) is broken — `next lint` was removed in Next.js 16. There is no linting configured right now. Do not run `pnpm lint` and do not reference it. No Prettier config exists either — do not add one without asking.

## Convex (local development)

Push functions and validate the schema with:

```bash
CONVEX_AGENT_MODE=anonymous npx convex dev --once
```

Run this after any change to `convex/` files. The Next.js dev server (`pnpm dev`) is started separately. Convex runs locally on `127.0.0.1:3210`.

## Convex (production deployment)

Anonymous/local dev (above) and production are **separate deployments that do not share data or functions** — pushing to one never affects the other.

To push `convex/` code to production:

```bash
npx convex login    # one-time, opens a browser — required even if `env list --prod` appears to work
npx convex deploy   # pushes convex/ to the account's production deployment
```

Do not assume you're logged in just because `npx convex env --prod` commands return values without erroring — anonymous projects have a cloud-side bookkeeping record that some `env` reads resolve against even without a real login. The reliable check is `npx convex deploy --dry-run`: if it prints "You are currently developing anonymously... log in by running `npx convex login`", there is no real, pushable production deployment yet.

Once logged in, target production explicitly with `--prod` (or `--deployment <name>`), e.g.:

```bash
npx convex env set SOME_KEY value --prod
npx convex run someModule:someFunction --prod
```

After `npx convex deploy`, copy the printed production URL into Vercel's Production environment variables (`NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`) — Vercel cannot reach `127.0.0.1:3210`, so a Vercel-hosted deployment always needs a real cloud Convex deployment, never the anonymous local one.

## Auth middleware

The Clerk middleware lives at `src/proxy.ts` — **not** `middleware.ts`. This is intentional (Next.js 16 convention in this project). Do not rename it.

Protected routes: `/dashboard`, `/account`, `/explore`, `/schedule`, `/playlists`, `/library`, `/settings`.

Onboarding gate: enforced via the `ll-onboarded` cookie. Users without this cookie are redirected to `/signup/onboarding`.

## Environment variables

Required in `.env.local`:

```
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/signup/onboarding
CONVEX_DEPLOYMENT
NEXT_PUBLIC_CONVEX_URL
NEXT_PUBLIC_CONVEX_SITE_URL
```

`JAMENDO_CLIENT_ID` is **not** a Next.js env var — it's read by the Convex action in `convex/jamendo.ts`, so it must be set via the Convex CLI (`npx convex env set JAMENDO_CLIENT_ID <value>`, add `--prod` for production), not in `.env.local`.

## Git workflow

- Feature branches off `main`, e.g. `feat/schedule-ui`
- Merge commits (not squash)
- Conventional commit prefixes: `feat:`, `fix:`, `refactor:`, `chore:`

## Project structure

```
src/app/(auth)/     — sign-in, sign-up, onboarding routes
src/app/(main)/     — protected app routes (dashboard, settings, etc.)
src/proxy.ts        — Clerk middleware
convex/             — Convex schema, queries, mutations
convex/jamendo.ts   — action that syncs real streamable tracks/audio from the Jamendo API into `channels`/`tracks`
```

Route groups use parentheses `(auth)` / `(main)` — these do not appear in URLs.

## TypeScript

`strict` mode is **off**. Do not enable it without discussion — it would require widespread fixes across the codebase.

Path alias `@/*` maps to `./src/*`.
