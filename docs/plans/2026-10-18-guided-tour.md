# Guided tour — plan

An interactive, step-by-step walkthrough of the app that starts automatically the
first time someone lands in `(main)` after onboarding, and can be replayed any time
from the existing "?" button.

## What already exists (reuse, don't rebuild)

- `src/components/layout/TourMap.tsx` — the "?" button in every dashboard page and a
  static "Tour map" modal (`stops` array with a blurb per page). This becomes the
  **replay entry point** and its `stops` copy seeds the step text.
- `zustand` (installed) — holds tour state so any component can start it.
- `Modal`, `Button`, Tailwind tokens (`bg-secondary`, `text-primary`, `app-chrome`) —
  the step card uses these so it looks native.
- `vitest` + `jsdom` — for the step-logic test.
- `posthog-js` (installed) — optional funnel events.

No new dependency. A tour library (driver.js, react-joyride) mostly gives you the
spotlight + popover, which is ~100 lines here; the hard part — crossing routes without
unmounting the player — has to be custom either way.

## Decisions

### 1. Where "has seen the tour" is stored → Clerk `unsafeMetadata.tourCompletedAt`

| Option | Problem |
|---|---|
| Convex `userProfiles` field | Staff read/write the **owner's** profile (`requireUser()` returns `venue_owner`), so the owner finishing the tour would hide it from every new curator. |
| `localStorage` | Per device: shows again on the venue's second tablet. |
| Clerk `publicMetadata` | Needs a Server Action + Backend API call for a UX-only flag. |
| **Clerk `unsafeMetadata`** | Per person, cross-device, writable from the browser with `user.update()`. Users can tamper with it — fine, the worst case is they skip their own tour. |

Write it on **finish and on skip** (both mean "don't auto-start again").
Add the type next to the existing claim types in `types/globals.d.ts`.

### 2. Moving between pages → client-side `router.push`

Every stop is inside `(main)`, so `router.push` keeps `AppLayout` (and the audio
player) mounted. Never use `<a href>` / `window.location` for a step.

### 3. Highlighting → spotlight on `data-tour="…"` attributes

Targets are marked with `data-tour` attributes, not CSS classes or ids, so restyling
never breaks the tour. The spotlight is a fixed, rounded box over the target's
`getBoundingClientRect()` with `box-shadow: 0 0 0 9999px rgb(0 0 0 / .6)` — one
element dims everything else. Repositions on resize/scroll (ResizeObserver +
`scroll` listener on the `ScrollArea`). Portalled to `<body>` like `TourMap`'s modal
(same z-index reason as the comment there).

Desktop sidebar and `MobileNav` both carry the same `data-tour` value; the engine
picks the **visible** one (`el.offsetParent !== null`), so one step list works on
phone, iPad and desktop.

If a target hasn't appeared within ~1.5 s (slow query, empty state), the card shows
centred with no spotlight instead of hanging.

## Steps

`src/components/tour/steps.ts` — plain data:

```ts
type Step = {
  id: string;
  route?: string;          // navigate here first
  target?: string;         // data-tour value; omitted = centred card
  title: string;
  body: string;
  ownerOnly?: boolean;     // hidden for curators (org:member)
};
```

1. **Welcome** (centred) — "Two minutes to get your venue sounding right." Start / Skip.
2. **Playlists** (`/playlists`, `nav-playlists`) — curated daytime & evening sets.
3. **Search** (`search`) — the topbar search box.
4. **Play something** (`playlist-card`, first card) — the one *interactive* step: the
   Next button reads "Next" but the copy invites tapping play; advancing also happens
   automatically when playback starts (subscribe to the player store).
5. **Player bar** (`player-bar`) — "Keep this tab open so the music keeps playing."
6. **Schedule** (`/schedule`, `nav-schedule`) — a playlist for every hour; repeats weekly.
7. **Announcements** (`/announcements`, `nav-announcements`).
8. **Settings** (`/settings`, `nav-settings`, `ownerOnly`) — venue, team, billing.
9. **Replay** (`help-button`) — "Tap ? any time to replay this tour or find guides."

Curators get steps without `ownerOnly` (CLAUDE.md: curators don't see Zone & staff /
Plan & billing). Trial-expired users still get the tour; step 4 just won't
auto-advance because audio is withheld — the Next button covers it.

## Files

| File | Change |
|---|---|
| `src/components/tour/steps.ts` | **new** — step data + `visibleSteps(isOwner)` filter. |
| `src/components/tour/useTour.ts` | **new** — zustand store: `active`, `index`, `start()`, `next()`, `back()`, `end(reason)`. |
| `src/components/tour/GuidedTour.tsx` | **new** — the engine: navigates, waits for the target, draws spotlight + card, keyboard (←/→, Esc), focus management. |
| `src/components/tour/useAutoStartTour.ts` | **new** — starts once when Clerk `user` is loaded, `onboardingComplete` is true, and `unsafeMetadata.tourCompletedAt` is unset. Guard with a ref so React Strict Mode's double effect doesn't start it twice. |
| `src/components/layout/app-layout.tsx` | mount `<GuidedTour />`, call `useAutoStartTour()`. |
| `src/components/layout/TourMap.tsx` | add a "Take the guided tour" button at the top of the modal → close modal, `start()`. Add `data-tour="help-button"`. |
| `Sidebar.tsx`, `topbar.tsx`, `player-bar.tsx`, playlists page card | add `data-tour` attributes only. |
| `types/globals.d.ts` | `UserUnsafeMetadata { tourCompletedAt?: number }`. |
| `src/components/tour/steps.test.ts` | **new** — `visibleSteps` drops `ownerOnly` for curators; store `next()` past the end calls `end("finished")`. |

Owner vs curator: reuse whatever `StaffPanel` / settings already use to decide role
(`useOrganization().membership.role` + `venueOwnerId`); don't add a new check.

## Accessibility

- Card is `role="dialog"` `aria-modal="false"` (the page stays usable),
  `aria-labelledby` the title, and gets focus on each step; focus returns to the "?"
  button when the tour ends.
- "Step 3 of 9" text, plus an `aria-live="polite"` region announcing the title.
- Esc = skip. Respect `prefers-reduced-motion` (no spotlight transition).
- Spotlight overlay is `pointer-events: none` so the highlighted control is still
  clickable (needed for the interactive play step).

## Edge cases

- User navigates away mid-tour via the sidebar → keep the tour, re-navigate on Next
  (simplest; don't try to "follow" them).
- Idle-timeout sign-out mid-tour → nothing is written, so it auto-starts next time.
  Acceptable.
- Invite flow: a curator lands on onboarding and passes straight through — they still
  get their own tour because the flag is per Clerk user.
- `user.update()` fails (offline) → tour still closes; it may re-show next session.

## Optional (not in first cut)

- PostHog events `tour_started` / `tour_step` / `tour_finished` / `tour_skipped` to see
  where people drop off.
- Per-page "tips" (mini-tours triggered on first visit to each page).

## Verify

1. `pnpm test` (step logic).
2. `pnpm dev`, new account → finish onboarding → tour auto-starts; finish it; reload →
   no tour; "?" → "Take the guided tour" replays it.
3. Repeat at phone width (MobileNav targets) and signed in as a curator (no Settings
   step).
4. Music keeps playing across every step's navigation.
5. `pnpm build` before the PR. Branch: `feat/guided-tour`.
