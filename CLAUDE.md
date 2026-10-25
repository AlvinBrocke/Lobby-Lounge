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

Vercel deploys Convex automatically: `vercel.json` sets the build command to `scripts/vercel-build.sh`, which runs `convex deploy --cmd 'pnpm build'` when `CONVEX_DEPLOY_KEY` is set (Vercel env var, a Convex **Production** deploy key, scoped to **Production only**) and plain `pnpm build` otherwise — so preview builds never push functions to production.

After `npx convex deploy`, copy the printed production URL into Vercel's Production environment variables (`NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`) — Vercel cannot reach `127.0.0.1`, so a Vercel-hosted deployment always needs a real cloud Convex deployment, never the anonymous local one.

## Auth & sessions

Clerk issues the session JWT; the app never mints its own tokens. Authorization is layered:

1. **Middleware** — `src/proxy.ts` (**not** `middleware.ts`; Next.js 16 convention, do not rename). Shallow check only: reads the session JWT, never the database. Protected routes: `/dashboard`, `/account`, `/explore`, `/schedule`, `/playlists`, `/library`, `/settings`, `/announcements`, `/tasks`, `/artists`.
2. **Data Access Layer** — `src/lib/session.ts`. Any server code (Server Components, layouts, Server Actions) that needs the current user goes through `verifySession()` (redirects) or `getSession()` (nullable). `getConvexToken()` returns the Clerk JWT for calling Convex from the server with `fetchQuery`/`fetchMutation` from `convex/nextjs`. `src/app/(main)/layout.tsx` calls `verifySession()` so nothing under `(main)` renders signed-out.
3. **Convex** — `requireUser()` / `assertOwner()` in `convex/lib/auth.ts` on every user-scoped function. Shared-catalog writes (`playlists.seedCurated` / `appendTracks`, `tracks.*` create/update/remove/seed, `jamendo.*`) are `internalMutation` / `internalAction` — callable only from other Convex functions or `npx convex run`, never from the browser.

**Onboarding gate:** `src/proxy.ts` reads `sessionClaims.metadata.onboardingComplete`, a custom session-token claim mirroring Clerk `publicMetadata.onboardingComplete`. It is set **only** by the `completeOnboarding` Server Action in `src/app/(auth)/signup/onboarding/actions.ts` (after the Convex profile write succeeds). Un-onboarded users on protected routes are sent to `/signup/onboarding`; onboarded users hitting that page are sent to `/dashboard`. `syncOnboardingClaim` backfills the claim for accounts whose Convex profile was completed before the claim existed. The claim's type lives in `types/globals.d.ts`. There is no `ll-onboarded` cookie any more.

This requires one manual Clerk Dashboard setting on **every** instance (dev and prod), or every user loops back to onboarding: Configure → Sessions → Customize session token → `{ "metadata": "{{user.public_metadata}}" }`. Session inactivity timeout / maximum lifetime are also configured there — the client-side `useIdleTimeout` hook is UX only.

`/signup` sends `firstName` / `lastName` to `signUp.create`, so on **every** instance also enable Configure → User & authentication → **First and last name** (optional is fine). Without it Clerk rejects the sign-up form.

**Sign-up / onboarding flow** (Figma "Screen-FLOW_Onboarding", light theme via the `.ll-auth` token scope in `globals.css`, set by `AuthShell`): `/signup` entry → account form → 6-digit code → verified → `/signup/onboarding` steps Business (name + type) → Audience (gender, age groups, lifestyle) → Genres (max 5) → Playback (tempo, volume) → "Your Lobby" screen, which runs `completeOnboarding` and only says "all set" once it returns. Option lists live in `src/lib/preferences.ts`; genre ids must keep prefix-matching Jamendo tags (`suggestedPlaylists`).

## Venue staff (Clerk Organizations)

A venue's team is a Clerk **organization**, created by `createVenueTeam` (`src/app/(main)/settings/actions.ts`) with the venue name and `publicMetadata.venueOwnerId` = the owner's user id. It's idempotent (returns an existing membership's org) and runs automatically at the end of `completeOnboarding`; `ActivateVenue` calls it on page load for onboarded accounts that still have no org (older accounts, or a failed onboarding call). Settings → Zone & staff → "Set up your team" is the manual fallback. Only the Backend API can write that metadata. Roles are Clerk's built-ins: `org:admin` is "Admin" and `org:member` is "Curator". "Owner" is the admin whose id matches `venueOwnerId`. Curators don't see Zone & staff or Plan & billing.

**No data migration.** Every row stays keyed by the owner's user id. `requireUser()` returns the token's `venue_owner` claim when there is one, so staff read and write the owner's rows; otherwise it returns `identity.subject`. `ActivateVenue` (`src/app/ConvexClientProvider.tsx`) makes a staff member's venue org active, because the claim only exists while it is.

Invitations are sent by `inviteStaff` with `redirectUrl` = `/signup`. That page and `/signin` redeem the `__clerk_ticket`. Invitees then land on onboarding, see the venue's finished profile, and are passed straight through.

Manual Clerk Dashboard setup, on **every** instance (dev and prod):

1. Configure → Organizations → enable Organizations. Turn **off** "Allow users to create organizations": venues are only created by `createVenueTeam`.
2. Configure → JWT templates → `convex` → add this claim to the existing ones:
   ```json
   "venue_owner": "{{org.public_metadata.venueOwnerId}}"
   ```
   Without it, staff see an empty account of their own instead of the venue.
3. Same template → also add `"name": "{{user.full_name}}"` and `"email": "{{user.primary_email_address}}"`. Settings → Activity log names whoever made each change from these claims (`convex/lib/activity.ts`); without them every row says "Someone".

Someone who is **signed in** when they click an invite link can't redeem it straight away: Clerk rejects a ticket while a session is active (`session_exists`). `proxy.ts` lets any auth route through when the URL has `__clerk_ticket`, and `/signup` then offers "Sign out and continue", which signs out back to the same link.

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

### Billing (Stripe)

Checkout, the customer portal and the webhook all run in Convex (`convex/billing.ts`, routed by `convex/http.ts`). There is no Stripe SDK: `convex/lib/stripe.ts` calls the REST API with `fetch` and verifies webhook signatures with Web Crypto, so everything runs in the default Convex runtime. No Stripe keys go in `.env.local` or Vercel.

Convex env vars (`npx convex env set NAME value`, add `--prod` for production — use **test-mode** keys on dev, **live** keys on prod):

```
STRIPE_SECRET_KEY       # sk_test_... / sk_live_... (a restricted key works: write on Customers, Checkout Sessions, Customer portal; read on Subscriptions)
STRIPE_WEBHOOK_SECRET   # whsec_... from the webhook endpoint below
STRIPE_PRICE_ID         # the recurring $20/mo price of "L&L Basic Plan" in that mode
SITE_URL                # where Stripe sends people back, e.g. https://www.lobbyloungemusic.com or http://localhost:3000
```

Stripe Dashboard, in each mode:

1. Developers → Webhooks → Add endpoint `<NEXT_PUBLIC_CONVEX_SITE_URL>/stripe/webhook` with events `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `customer.subscription.paused`, `customer.subscription.resumed`. Copy its signing secret into `STRIPE_WEBHOOK_SECRET`. Locally: `stripe listen --forward-to 127.0.0.1:3213/stripe/webhook`.
2. Settings → Billing → Customer portal → activate it (allow updating payment methods, viewing invoices, cancelling at period end).
3. Settings → Billing → Subscriptions and emails → turn on "Send emails about upcoming trial endings" and choose what happens after failed retries (cancel or mark unpaid — both end access).

**Test mode = the "LL Basic Plan Sandbox" Stripe account** (`acct_1UUJR1Bd9dxtZlQt`). Dev deployments always use it; only the production deployment gets live keys. It already has the product `prod_VVYQ846N0MITXu` (L&L Basic Plan) with the $20/mo price `price_1UUXJOBd9dxtZlQtO55WZMH7`, and a default customer-portal configuration (`bpc_1UUXJcBd9dxtZlQtuQICIHVO`: card updates, invoices, cancel at period end). `pnpm stripe:sandbox` sets `STRIPE_SECRET_KEY` (prompts; rejects anything but a test key), `STRIPE_PRICE_ID` and `SITE_URL` on the dev deployment; then run `stripe listen --forward-to 127.0.0.1:3213/stripe/webhook` and set the `whsec_` it prints as `STRIPE_WEBHOOK_SECRET`. Test card: 4242 4242 4242 4242. As a backstop, `stripeRequest` refuses a live key when `SITE_URL` is localhost (`assertKeyMatchesSite`).

**Flow.** Settings → Plan & billing → "Add payment method" (`billing.startCheckout`) creates a Stripe customer for the venue owner (stored as `stripeCustomerId`) and a Checkout session for `STRIPE_PRICE_ID`. During the free trial the session sets `subscription_data.trial_end` to the app's trial end (`checkoutTrialEnd` in `convex/lib/billing.ts`), so the card is collected now and first charged when the trial ends; within 48 h of the end (Stripe's minimum) or after it, the first $20 is charged at checkout. The webhook re-fetches the subscription and `billing.syncSubscription` sets `plan` = `"basic"` while Stripe's status is `trialing`, `active` or `past_due`, and back to `"trial"` (i.e. expired, once the trial dates have passed) when it is cancelled/unpaid. "Manage subscription & invoices" (`billing.openPortal`) opens the Stripe customer portal. Both are keyed by `requireUser()`, so an admin paying for a venue credits the owner.

**Trial & access** (`convex/lib/billing.ts`): `plan` is `"trial"` or `"basic"`. A trial lasts `TRIAL_DAYS` (30) from profile creation, unless `trialEndsAt` overrides it. No card is needed to start it. When it ends, `playlists.getTracks` withholds `audioUrl` (browsing still works) and a banner prompts to subscribe. For support cases outside Stripe (add `--prod` for production; a later webhook for that venue overwrites a manual `plan`):

```bash
npx convex run userProfiles:setPlan '{"clerkUserId":"user_...","plan":"basic"}'
npx convex run userProfiles:extendTrial '{"clerkUserId":"user_...","days":14}'   # days from now; default 30
```

Audio URLs are only ever returned by `playlists.getTracks` and `artists.get`, both behind `canPlay()`; `tracks.search`, `artists.list` and `artists.related` strip them and `tracks.list`/`get` are internal. Keep it that way, or the gate can be bypassed.

`JAMENDO_CLIENT_ID`, `CLERK_JWT_ISSUER_DOMAIN` and the `STRIPE_*` / `SITE_URL` vars above are **not** Next.js env vars — they're read Convex-side (`convex/jamendo.ts` and `convex/auth.config.ts`), so they must be set via the Convex CLI (`npx convex env set JAMENDO_CLIENT_ID <value>`, add `--prod` for production), not in `.env.local`.

There are no channels: the catalogue is **curated playlists** — `playlists` rows with `curated: true` and no `clerkUserId`, grouped into `section: "daytime" | "evening"` on the Playlists page. Users can read them but never modify them (`assertOwner` rejects ownerless docs). Schedule blocks point at a playlist via `playlistId`.

The landing page claims "1,000+ tracks". A fresh deployment has none, so run `npx convex run playlists:seedCurated` then `npx convex run jamendo:syncAllCurated '{"limit":150}'` (add `--prod` for production) to bring the catalogue above 1,000. The weekly cron tops it up from there.

## Git workflow

- Feature branches off `main`, e.g. `feat/schedule-ui`
- Merge commits (not squash)
- Conventional commit prefixes: `feat:`, `fix:`, `refactor:`, `chore:`

## Project structure

```
src/app/(auth)/     — sign-in, sign-up, onboarding routes
src/app/(main)/     — protected app routes (playlists, schedule, settings, etc.; `/dashboard` just redirects to `/playlists`)
src/proxy.ts        — Clerk middleware (layer 1)
src/lib/session.ts  — server-side session DAL (layer 2)
types/globals.d.ts  — Clerk session-token claim types
convex/             — Convex schema, queries, mutations
convex/lib/auth.ts  — requireUser / assertOwner (layer 3)
convex/jamendo.ts   — internal action that syncs real streamable tracks/audio from the Jamendo API into the curated playlists (`npx convex run jamendo:syncAllCurated`)
convex/lib/curated.ts — the curated playlist catalogue used by `playlists:seedCurated`
convex/billing.ts   — Stripe Checkout, customer portal and webhook (`/stripe/webhook` via convex/http.ts)
convex/crons.ts     — weekly cron that re-runs `jamendo:syncAllCurated` (backs the "Curated weekly" claim on the landing page)
```

Route groups use parentheses `(auth)` / `(main)` — these do not appear in URLs.

## TypeScript

`strict` mode is **off**. Do not enable it without discussion — it would require widespread fixes across the codebase.

Path alias `@/*` maps to `./src/*`.
