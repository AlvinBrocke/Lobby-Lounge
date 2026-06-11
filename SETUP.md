---
Lobby Lounge — Roadmap to Production

Here's an honest assessment of where the app stands and a prioritized plan to make it fully functional.
---

Current state summary

The app has a beautiful shell — landing page, auth flows, and all six app screens are designed and look great. But almost everything is hardcoded mock data. No screen reads from or writes to the database. The player bar is visually complete but plays nothing real. The onboarding wizard collects preferences but throws them away. Several route paths are mismatched.

---

Phase 1 — Fix broken fundamentals (do this first)

These are blockers. Nothing else works properly until these are done.

1. Fix broken routes

- Sidebar links to /playlists but the page lives at src/app/playlist/page.jsx (wrong path, wrong name)
- Sidebar links to /library but no page exists at all
- Fix: create src/app/(main)/playlists/page.tsx and src/app/(main)/library/page.tsx

2. Create the Supabase database schema
   The types file defines four tables but none of them may actually exist in Supabase yet. You need to create:

- user_profiles — one row per user, stores display_name, plan, venue_name, onboarding_completed
- channels — the music channels (seed with 6–8 rows of real data)
- tracks — songs inside ea
- schedule_blocks — the user's weekly schedule (day, start_hour, duratichannel_id, user_id)
- playlists — user-created playlists - playlist_tracks — join tcks
  Use the Supabase MCP tool editor to run themigrations.

3. Save onboarding data The onboarding wizard (/sires, mood, and preferencesbut handleSubmit just does window.location.href = "/dashboard". It need- Create a user_profiles rs Clerk ID, selected genres, and preferences - Mark onboarding_complete

- Then redirect to /dashboard

4. Seed real channel data The dashboard and music linnels with Unsplash images.Seed the Supabase channels table with at least 6 channels so the API ro(/api/channels) return rea
   ---
   Phase 2 — Connect the app to real data
5. Dashboard — replace hardcoded data dashboard/page.tsx has thrHEDULE, TRACKS) baked in.Replace them with useEffect + fetch calls to /api/channels and /api/traloading skeletons while da 6. Wire up the player bar
   This is the core feature of the product. The app has two player bars — player-bar.tsx (used in th PlayerBar.tsx (old version, disconnected). The current player-bar.tsx is completely self-contained with local
   state and plays nothing. I

- Import and use usePlayerStore to read currentTrack, isPlaying, volume
- Wire an <audio> ref to c
- Make the play/pause button call togglePlay() from the store
- Advance progress based odio.duration

7. Make channels actually
   When a user clicks a channel tile on the dashboard, call setCurrentTrack(channel)
   from usePlayerStore. The pd plays it. Right nowclicking a channel only changes activeChannel in local state — it never reaches the
   player.

8. Schedule page — connect
   The schedule calendar currently renders hardcoded dummyEvents. Replace with:

- GET /api/schedule — fetc from Supabase
- POST /api/schedule — create a new block when clicking a calendar cell
- DELETE /api/schedule/[id

9. Library page
   Build src/app/(main)/library/page.tsx as a browsable list of all tracks in the
   tracks table. Fetch from /ave a play button that calls setCurrentTrack().

10. Playlists page
    Build src/app/(main)/playle user's saved playlists.Fetch from Supabase (playlists table filtered by user_id = current user). Include a
    "New Playlist" button that

---

Phase 3 — Real user data in the UI

11. Account page — show real Clerk data
    The account page (account/e Grand Lobby" and"manager@grandlobby.com". Replace with:

- useUser() from Clerk for
- A Supabase query for user_profiles to get the plan and venue name

12. Settings page — save venue name
    The Settings page shows stusiness Name and Emaileditable fields that save back to the user_profiles table in Supabase.

13. Sidebar — show real user name
    The sidebar already uses uinitials/email — this isalready correct. Just verify it shows the right data after onboarding saves the
    profile.

14. Dashboard stats — make
    The three stat cards ("6h 42m Playing today", "247 Tracks served", "Low / Chill")
    are hardcoded. These couldocks and play history, orkept as simple aggregates stored in user_profiles.

---

Phase 4 — Polish for real

15. Empty states
    Every page that shows a list needs an empty state for new users who have no data
    yet. Example: "You haven'tck a slot to add your firstblock."

16. Loading states
    Add skeleton loaders (shimSupabase queries are inflight. Right now data either shows or doesn't — there's no transition.

17. Mobile layout
    The entire app assumes a smobile, the sidebar shouldcollapse into a bottom navigation bar or a slide-out drawer. This is a significant
    layout change but required

18. Error boundaries per p
    The global error.tsx catches catastrophic failures. Each page also needs a local
    error state for when its s., "Couldn't load yourschedule — try again").

---

Phase 5 — Launch requireme

19. Billing (Stripe)
    The account page shows a hardcoded "Pro Business · $49/mo" plan. For a real product
    you need Stripe:

- Stripe Checkout for new subscriptions
- A Stripe webhook to updayment succeeds/fails
- A billing portal link for managing subscriptions

20. Music licensing
    This is the most importantunge is a B2B music service. You cannot stream music to businesses without a commercial license (PPL/PRS in the
    UK, BMI/ASCAP/SESAC in therack Your Brand / PretzelRocks that provides pre-licensed catalogs). The current SoundHelix placeholder URLs
    are fine for development b

21. Admin — seeding real c
    Before real users can use the app, the channels and tracks tables need meaningful
    licensed content. Build a by a role check in proxy.ts) for adding channels and tracks, or use the Supabase dashboard directly.

22. Redirect logic after sign-in
    After a user signs in, thef onboarding is complete, or /signup/onboarding if not. This check should happen in proxy.ts by reading
    user_profiles.onboarding_c no such check.

---

Suggested order of work

┌──────────┬────────────────────────────────────────────────┬────────┐
│ Priority │ │ Effort │
├──────────┼────────────────────────────────────────────────┼────────┤
│ 1 │ Fix broken ro │ 1 hr │
├──────────┼────────────────────────────────────────────────┼────────┤
│ 2 │ Create Supaba │ 2 hrs │
├──────────┼────────────────────────────────────────────────┼────────┤
│ 3 │ Save onboardi │ 1 hr │
├──────────┼────────────────────────────────────────────────┼────────┤
│ 4 │ Wire player budio │ 2 hrs │
├──────────┼────────────────────────────────────────────────┼────────┤
│ 5 │ Make channel │ 30 min │
├──────────┼────────────────────────────────────────────────┼────────┤
│ 6 │ Dashboard: fe │ 2 hrs │
├──────────┼────────────────────────────────────────────────┼────────┤
│ 7 │ Schedule CRUD │ 3 hrs │
├──────────┼────────────────────────────────────────────────┼────────┤
│ 8 │ Library + Pla │ 3 hrs │
├──────────┼────────────────────────────────────────────────┼────────┤
│ 9 │ Account/Setti │ 2 hrs │
├──────────┼────────────────────────────────────────────────┼────────┤
│ 10 │ Empty states │ 2 hrs │
├──────────┼────────────────────────────────────────────────┼────────┤
│ 11 │ Mobile layout │ 4 hrs │
├──────────┼────────────────────────────────────────────────┼────────┤
│ 12 │ Onboarding re │ 1 hr │
├──────────┼────────────────────────────────────────────────┼────────┤
│ 13 │ Billing (Stri │ 4 hrs │
├──────────┼────────────────────────────────────────────────┼────────┤
│ 14 │ Music licensi │ — │
└──────────┴────────────────────────────────────────────────┴────────┘

The first five items are the most impactful — they turn the app from a static prototype into something aith in a session.
