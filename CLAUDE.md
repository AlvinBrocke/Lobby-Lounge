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
```

Route groups use parentheses `(auth)` / `(main)` — these do not appear in URLs.

## TypeScript

`strict` mode is **off**. Do not enable it without discussion — it would require widespread fixes across the codebase.

Path alias `@/*` maps to `./src/*`.
