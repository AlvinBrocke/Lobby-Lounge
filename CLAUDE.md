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

Run this after any change to `convex/` files. The Next.js dev server (`pnpm dev`) is
started separately. The local backend's ports are assigned per deployment and recorded in
`.convex/local/default/config.json` — **this project uses `127.0.0.1:3212` (site: `3213`)**,
not the `3210` Convex allocates first. `npx convex dev` prints the URL on startup, and
`NEXT_PUBLIC_CONVEX_URL` / `NEXT_PUBLIC_CONVEX_SITE_URL` in `.env.local` must match it.

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

After `npx convex deploy`, copy the printed production URL into Vercel's Production environment variables (`NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`) — Vercel cannot reach `127.0.0.1`, so a Vercel-hosted deployment always needs a real cloud Convex deployment, never the anonymous local one.

## Auth & sessions

Clerk issues the session JWT; the app never mints its own tokens. Authorization is layered:

1. **Middleware** — `src/proxy.ts` (**not** `middleware.ts`; Next.js 16 convention, do not rename). Shallow check only: reads the session JWT, never the database. Protected routes: `/dashboard`, `/account`, `/explore`, `/schedule`, `/playlists`, `/library`, `/settings`.
2. **Data Access Layer** — `src/lib/session.ts`. Any server code (Server Components, layouts, Server Actions) that needs the current user goes through `verifySession()` (redirects) or `getSession()` (nullable). `getConvexToken()` returns the Clerk JWT for calling Convex from the server with `fetchQuery`/`fetchMutation` from `convex/nextjs`. `src/app/(main)/layout.tsx` calls `verifySession()` so nothing under `(main)` renders signed-out.
3. **Convex** — `requireUser()` / `assertOwner()` in `convex/lib/auth.ts` on every user-scoped function. Shared-catalog writes (`channels.*`, `tracks.*` create/update/remove/seed, `jamendo.*`) are `internalMutation` / `internalAction` — callable only from other Convex functions or `npx convex run`, never from the browser.

**Onboarding gate:** `src/proxy.ts` reads `sessionClaims.metadata.onboardingComplete`, a custom session-token claim mirroring Clerk `publicMetadata.onboardingComplete`. It is set **only** by the `completeOnboarding` Server Action in `src/app/(auth)/signup/onboarding/actions.ts` (after the Convex profile write succeeds). Un-onboarded users on protected routes are sent to `/signup/onboarding`; onboarded users hitting that page are sent to `/dashboard`. `syncOnboardingClaim` backfills the claim for accounts whose Convex profile was completed before the claim existed. The claim's type lives in `types/globals.d.ts`. There is no `ll-onboarded` cookie any more.

This requires one manual Clerk Dashboard setting on **every** instance (dev and prod), or every user loops back to onboarding: Configure → Sessions → Customize session token → `{ "metadata": "{{user.public_metadata}}" }`. Session inactivity timeout / maximum lifetime are also configured there — the client-side `useIdleTimeout` hook is UX only.

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

Optional:

```
NEXT_PUBLIC_STRIPE_PREMIUM_PAYMENT_LINK   # https://buy.stripe.com/... — Premium plan CTA on the landing page
```

Billing is a Stripe **Payment Link** (a plain URL created in the Stripe Dashboard) — there is no Stripe SDK, secret key, or webhook in this repo. If the variable is unset, the Premium button falls back to `/signup`. After a customer pays, `userProfiles.plan` must be updated manually (e.g. `npx convex run userProfiles:...` or the Convex dashboard).

`JAMENDO_CLIENT_ID` and `CLERK_JWT_ISSUER_DOMAIN` are **not** Next.js env vars — they're read Convex-side (`convex/jamendo.ts` and `convex/auth.config.ts`), so they must be set via the Convex CLI (`npx convex env set JAMENDO_CLIENT_ID <value>`, add `--prod` for production), not in `.env.local`.

The landing page claims "1,000+ tracks". A fresh deployment starts with ~120 (15 per channel), so after seeding channels run `npx convex run jamendo:syncAllChannels '{"limit":150}'` (add `--prod` for production) to bring the catalogue above 1,000. The weekly cron tops it up from there.

## Git workflow

- Feature branches off `main`, e.g. `feat/schedule-ui`
- Merge commits (not squash)
- Conventional commit prefixes: `feat:`, `fix:`, `refactor:`, `chore:`

## Project structure

```
src/app/(auth)/     — sign-in, sign-up, onboarding routes
src/app/(main)/     — protected app routes (dashboard, settings, etc.)
src/proxy.ts        — Clerk middleware (layer 1)
src/lib/session.ts  — server-side session DAL (layer 2)
types/globals.d.ts  — Clerk session-token claim types
convex/             — Convex schema, queries, mutations
convex/lib/auth.ts  — requireUser / assertOwner (layer 3)
convex/jamendo.ts   — internal action that syncs real streamable tracks/audio from the Jamendo API into `channels`/`tracks` (`npx convex run jamendo:syncAllChannels`)
convex/crons.ts     — weekly cron that re-runs `jamendo:syncAllChannels` (backs the "Curated weekly" claim on the landing page)
```

Route groups use parentheses `(auth)` / `(main)` — these do not appear in URLs.

## TypeScript

`strict` mode is **off**. Do not enable it without discussion — it would require widespread fixes across the codebase.

Path alias `@/*` maps to `./src/*`.
