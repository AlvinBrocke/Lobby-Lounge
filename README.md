# Lobby Lounge

Curated ambient music for hospitality venues. A web app that lets venue operators stream atmosphere-matched audio channels, build playlists, and schedule automatic atmosphere changes throughout the day.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Auth | Clerk |
| Database | Convex |
| Client state | Zustand |
| Styling | Tailwind CSS |
| Deployment | Vercel |
| Testing | Vitest + convex-test |

## Project structure

```
src/
  app/
    (auth)/         — sign-in, sign-up, onboarding routes
    (main)/         — protected app routes (dashboard, settings, etc.)
    landing-page/   — public marketing page
  components/
    landing/        — marketing page sections
    layout/         — sidebar, top bar, player bar
    ui/             — shared UI primitives
  store/            — Zustand player store
  proxy.ts          — Clerk auth middleware (not middleware.ts)

convex/             — database schema, queries, and mutations
  schema.ts         — table definitions
  channels.ts       — curated music stream CRUD
  tracks.ts         — individual track CRUD
  playlists.ts      — user playlist CRUD + track management
  scheduleBlocks.ts — timed atmosphere scheduling
  userProfiles.ts   — user preferences and plan
```

## Local development

**Prerequisites:** Node.js 22+, pnpm

```bash
pnpm install
```

Copy the environment template and fill in your keys (see [Environment variables](#environment-variables)):

```bash
cp .env.local.example .env.local
```

Start the Convex dev server (push schema + functions):

```bash
CONVEX_AGENT_MODE=anonymous npx convex dev --once
```

Start the Next.js dev server:

```bash
pnpm dev   # http://localhost:3000
```

> Run `npx convex dev --once` again after any change to `convex/` files.

## Environment variables

Required in `.env.local`:

```
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CONVEX_SITE_URL=
```

- **Clerk keys** — [Clerk dashboard](https://dashboard.clerk.com) → your app → API Keys
- **Convex URL** — shown after running `npx convex dev --once` (e.g. `http://127.0.0.1:3210` locally, `https://<deployment>.convex.cloud` in production)

## Database

Convex tables:

| Table | Description |
|-------|-------------|
| `channels` | Curated music streams with BPM, category, and audio URL |
| `tracks` | Individual tracks with energy level, duration, and channel assignment |
| `playlists` | User-created playlists (public or private) |
| `playlistTracks` | Join table linking tracks to playlists with ordering |
| `scheduleBlocks` | Timed blocks that automate channel switching throughout the day |
| `userProfiles` | User preferences, plan tier, and onboarding state |

Seed the database with sample channels and tracks:

```bash
npx convex run channels:seed --prod
npx convex run tracks:seed --prod
```

## Testing

```bash
pnpm test           # utils + Zustand store (jsdom, 15 tests)
pnpm test:watch     # same, watch mode
pnpm test:convex    # Convex function tests (in-memory, 33 tests)
```

All 48 tests run fully offline — no real Convex deployment is touched.

## Build

```bash
pnpm build
```

Run this before opening a pull request.

## CI/CD

GitHub Actions runs on every push and pull request to `main`:

1. **Test** — runs both test suites
2. **Type-check & Build** — `tsc --noEmit` then `next build` (only runs if tests pass)

Deployment to Vercel triggers automatically after CI passes on `main`. Pull requests get a preview deployment with a URL posted as a PR comment.

Required GitHub secrets: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CONVEX_URL`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

## Auth

- Middleware lives at `src/proxy.ts` (Next.js 16 convention in this project — do not rename to `middleware.ts`)
- Protected routes: `/dashboard`, `/account`, `/explore`, `/schedule`, `/playlists`, `/library`, `/settings`
- Unauthenticated users are redirected to `/signin`

## Git workflow

- Feature branches off `main`: `feat/my-feature`
- Merge commits (not squash)
- Commit prefixes: `feat:`, `fix:`, `refactor:`, `chore:`
