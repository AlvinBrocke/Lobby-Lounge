# Figma dashboard parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the remaining gaps between the app and the Figma Make prototype ("Moodboard for B2B Onboarding (Copy)", `src/Dashboard.tsx`): Tasks page, drag-and-drop schedule, activity log, artist discovery, Library artists/albums, and the live-announcement banner.

**Architecture:** Each feature reuses the existing layering: Convex queries/mutations guarded by `requireUser()` (layer 3), client pages under `src/app/(main)/`, pure logic in `src/lib/*.ts` with a vitest file next to it. Setup-task completion is *derived* from data that already exists, never stored. Activity is one new append-only table written from existing mutations. Artists are derived from `tracks.artist` via a new index.

**Tech Stack:** Next.js 16 App Router, Convex (+ `convex-test`), Clerk (Organizations), Zustand player store, Tailwind, vitest.

**Spec:** The gap analysis in the conversation of 2026-10-19 plus the prototype source (`TasksView`, `ScheduleView`, `AccountView → Activity log`, `ArtistSpotlight` / `RelatedArtists`, `LibraryView`, `AnnouncementBanner`).

## Global Constraints

- Package manager: `pnpm` only. No new dependencies (HTML5 drag-and-drop, no dnd library).
- Branch off `main`: `git checkout main && git pull && git checkout -b feat/figma-parity`. Merge commits, conventional prefixes (`feat:`, `fix:`).
- After any `convex/` change: `CONVEX_AGENT_MODE=anonymous npx convex dev --once`. Never `pkill` the user's dev servers.
- Convex tests: `pnpm test:convex`. Client lib tests: `pnpm test`. Before the PR: `pnpm build`. Do **not** run `pnpm lint`.
- Every user-scoped Convex function calls `requireUser()`; every write to an existing doc calls `assertOwner()`. Throw `ConvexError` for messages the user should see.
- Audio URLs only leave Convex through queries that call `canPlay()` (`playlists.getTracks` today; `artists.get` after Task 5). Update the CLAUDE.md sentence that says so.
- Landing/in-app copy may only claim shipped features: no "$20/month", no "save 10% annually", no tipping.
- New protected routes go in **both** `src/proxy.ts` `isProtectedRoute` and the CLAUDE.md protected-routes list.
- TypeScript `strict` stays off. Match the surrounding file's Tailwind tokens (`bg-secondary`, `text-primary`, `text-faint`, `panel`, `card`).
- Explicitly out of scope (decided): tip-the-artist, in-app card form / invoice list, multiple zones, vote counts, audio-quality/gapless toggles.

## Review Focus

1. **Curator role** — a curator (`org:member`) must not see billing or team tasks/tabs anywhere. Test in Task 1 and Task 2 (`setupTasks` with `isCurator: true`).
2. **Drop onto an occupied slot / past midnight** — the drop must be refused with the server's message shown inline, the block staying where it was. Test in Task 3 (`fitsAt`) plus the existing `scheduleBlocks.update` overlap test.
3. **Expired trial on the artist page** — `artists.get` must return tracks without `audioUrl`. Test in Task 5.
4. **Staff actions in the activity log** — rows are written under the *owner's* id (what `requireUser()` returns) but name the *acting* person. Test in Task 4 with a `venue_owner` identity.
5. **Artist names with `/`, `&`, spaces or accents** in the `/artists/[name]` URL — must round-trip via `encodeURIComponent` / `decodeURIComponent`. Test in Task 5 (`artistHref`).

---

### Task 1: Stop curators seeing Plan & billing

`src/app/(main)/settings/page.tsx` lists `{ key: "billing", label: "Plan & billing" }` twice; the second copy has no `adminOnly`, so the curator filter leaves billing visible.

**Files:**
- Modify: `src/app/(main)/settings/page.tsx` (the `TABS` array)
- Create: `src/lib/settingsTabs.ts`, `src/lib/settingsTabs.test.ts`

**Interfaces:**
- Produces: `SETTINGS_TABS` (readonly array of `{ key: SettingsTabKey; label: string; adminOnly?: true }`), `type SettingsTabKey = "venue" | "staff" | "billing" | "preferences" | "activity"`, `visibleTabs(isCurator: boolean): typeof SETTINGS_TABS[number][]`. Task 4 appends the `activity` tab here.

- [ ] **Step 1: Write the failing test** in `src/lib/settingsTabs.test.ts`

```ts
it("hides admin tabs from curators", () => {
  const keys = visibleTabs(true).map((t) => t.key);
  expect(keys).not.toContain("billing");
  expect(keys).not.toContain("staff");
});
it("lists each tab once", () => {
  const keys = visibleTabs(false).map((t) => t.key);
  expect(new Set(keys).size).toBe(keys.length);
});
```

- [ ] **Step 2: Run** `pnpm test src/lib/settingsTabs.test.ts` — Expected: FAIL (module not found).
- [ ] **Step 3: Move `TABS` into `src/lib/settingsTabs.ts`** without the duplicate entry (order: venue, staff, billing, preferences), add `visibleTabs`, and use it from the settings page. Leave `activity` out until Task 4.
- [ ] **Step 4: Run** `pnpm test src/lib/settingsTabs.test.ts` — Expected: PASS.
- [ ] **Step 5: Commit** — `fix: hide Plan & billing tab from curators`

---

### Task 2: Tasks page (setup checklist)

Prototype: `TasksView`. Five cards in a 2-column grid, an eyebrow, title, description and a button each, a progress bar "N of 5", a "Setup complete" state, and an amber count badge on the sidebar item. **Completion is derived, not ticked by hand.**

**Files:**
- Create: `src/lib/tasks.ts`, `src/lib/tasks.test.ts`
- Create: `src/hooks/useSetupTasks.ts`
- Create: `src/app/(main)/tasks/page.tsx`
- Modify: `src/components/layout/Sidebar.tsx` (`navItems`, badge for `/tasks`, both `Sidebar` and `MobileNav`)
- Modify: `src/proxy.ts` (`"/tasks(.*)"` in `isProtectedRoute`), `CLAUDE.md` (protected routes list)

**Interfaces:**
- Produces:
  ```ts
  export type SetupTaskKey = "subscribe" | "venue" | "music" | "team" | "schedule";
  export interface SetupInput {
    plan?: string; venueName?: string; logoStorageId?: string;
    genres?: string[]; tempo?: string;
    membersCount?: number;      // Clerk organization.membersCount; undefined = no org
    scheduleBlockCount: number;
    isCurator: boolean;
  }
  export interface SetupTask {
    key: SetupTaskKey; eyebrow: string; title: string; description: string;
    button: string; href: string; done: boolean;
  }
  export function setupTasks(input: SetupInput): SetupTask[];
  // src/hooks/useSetupTasks.ts
  export function useSetupTasks(): { tasks: SetupTask[]; remaining: number; loading: boolean };
  ```

Done rules and links (exact):

| key | done when | href | adminOnly |
|---|---|---|---|
| subscribe | `plan === "basic"` | `/settings?tab=billing` | yes |
| venue | `venueName` non-empty **and** `logoStorageId` set | `/settings` | no |
| music | `genres.length > 0` **and** `tempo` set | `/settings?tab=preferences` | no |
| team | `membersCount > 1` | `/settings?tab=staff` | yes |
| schedule | `scheduleBlockCount > 0` | `/schedule` | no |

Copy (shipped features only): subscribe — eyebrow "Billing", title "Choose your plan", description "Subscribe before your free trial ends so the music keeps playing.", button "Go to billing". venue — "Complete setup" / "Update your profile" / "Add your venue name and logo so your team and guests see your brand." / "Edit venue details". music — "Music" / "Set your music preferences" / "Pick genres and a tempo so suggestions fit your space." / "Open preferences". team — "Zone & staff" / "Invite your team" / "Invite teammates as Admins or Curators so they can run schedules and playback." / "Manage team". schedule — "Schedule" / "Schedule your music" / "Plan playlists for the week ahead — they repeat automatically." / "Open schedule".

- [ ] **Step 1: Write the failing tests** in `src/lib/tasks.test.ts`

```ts
const base: SetupInput = { scheduleBlockCount: 0, isCurator: false };
it("returns five tasks, none done, for a fresh account", () => {
  const t = setupTasks(base);
  expect(t.map((x) => x.key)).toEqual(["subscribe", "venue", "music", "team", "schedule"]);
  expect(t.every((x) => !x.done)).toBe(true);
});
it("hides subscribe and team from curators", () => {
  expect(setupTasks({ ...base, isCurator: true }).map((x) => x.key)).toEqual(["venue", "music", "schedule"]);
});
it("needs both name and logo for venue", () => {
  expect(setupTasks({ ...base, venueName: "Grand" }).find((x) => x.key === "venue")!.done).toBe(false);
  expect(setupTasks({ ...base, venueName: "Grand", logoStorageId: "s1" }).find((x) => x.key === "venue")!.done).toBe(true);
});
it("counts the owner alone as no team", () => {
  expect(setupTasks({ ...base, membersCount: 1 }).find((x) => x.key === "team")!.done).toBe(false);
  expect(setupTasks({ ...base, membersCount: 2 }).find((x) => x.key === "team")!.done).toBe(true);
});
it("marks subscribe done only on basic", () => {
  expect(setupTasks({ ...base, plan: "trial" })[0].done).toBe(false);
  expect(setupTasks({ ...base, plan: "basic" })[0].done).toBe(true);
});
```

- [ ] **Step 2: Run** `pnpm test src/lib/tasks.test.ts` — Expected: FAIL (module not found).
- [ ] **Step 3: Implement `setupTasks`** in `src/lib/tasks.ts` from the table above.
- [ ] **Step 4: Run** `pnpm test src/lib/tasks.test.ts` — Expected: PASS.
- [ ] **Step 5: Implement `useSetupTasks()`** — profile from `useAccess()?.profile`, `useQuery(api.scheduleBlocks.listByUser, isAuthenticated ? {} : "skip")` (same subscription the schedule page uses), `useOrganization().organization?.membersCount`, `useAuth().orgRole === "org:member"` for `isCurator`. `loading` is true while the profile or blocks are `undefined`.
- [ ] **Step 6: Build `src/app/(main)/tasks/page.tsx`** with `PageWrapper` (title "Tasks", description "Complete these steps to get the most out of Lobby & Lounge."), progress bar, a "Setup complete" card when `remaining === 0`, and the card grid (`grid-cols-1 sm:grid-cols-2`). Each card's button is a `<Link href={task.href}>`; a done card shows a check and a ghost button.
- [ ] **Step 7: Add the nav item** `{ name: "Tasks", short: "Tasks", href: "/tasks", icon: ListChecks }` last in `navItems`, with an amber badge (`bg-amber-400 text-background`, title "`N` setup tasks remaining") when `remaining > 0`. Hide the badge, not the item, when everything is done.
- [ ] **Step 8: Add `/tasks` to `src/proxy.ts` and CLAUDE.md.** Run `pnpm build` — Expected: success, `/tasks` listed.
- [ ] **Step 9: Commit** — `feat: add setup Tasks page with derived progress`

---

### Task 3: Drag-and-drop schedule

Prototype: `ScheduleView` — an "Available playlists" panel whose items drag onto the grid, and blocks that drag to a new day/hour. The server already supports moves (`scheduleBlocks.update` with `day` / `startHour`, overlap check excludes the block itself), so this is UI plus one pure helper. Click-to-add and click-to-edit stay as they are; they are the touch fallback.

**Files:**
- Modify: `src/lib/schedule.ts`, `src/lib/schedule.test.ts`
- Create: `src/components/schedule/PlaylistTray.tsx`
- Modify: `src/app/(main)/schedule/page.tsx`

**Interfaces:**
- Produces:
  ```ts
  // src/lib/schedule.ts
  export const DROP_DURATION = 2; // hours given to a playlist dropped from the tray
  export function fitsAt(blocks: (BlockSlot & { _id?: string })[], slot: BlockSlot, ignoreId?: string): boolean;
  // drag payload, set with dataTransfer.setData("application/x-ll-schedule", JSON.stringify(payload))
  export type DragPayload = { kind: "block"; id: string; duration: number } | { kind: "playlist"; playlistId: string };
  ```
- Consumes: `overlaps()` (existing), `api.scheduleBlocks.create` / `update`.

- [ ] **Step 1: Write the failing tests** in `src/lib/schedule.test.ts`

```ts
const blocks = [{ _id: "a", day: "Mon", startHour: 9, duration: 2 }];
it("fits in a free slot", () => expect(fitsAt(blocks, { day: "Mon", startHour: 11, duration: 2 })).toBe(true));
it("rejects an overlap", () => expect(fitsAt(blocks, { day: "Mon", startHour: 10, duration: 2 })).toBe(false));
it("ignores the block being moved", () => expect(fitsAt(blocks, { day: "Mon", startHour: 10, duration: 2 }, "a")).toBe(true));
it("rejects running past midnight", () => expect(fitsAt([], { day: "Tue", startHour: 23, duration: 2 })).toBe(false));
```

- [ ] **Step 2: Run** `pnpm test src/lib/schedule.test.ts` — Expected: FAIL (`fitsAt` not exported).
- [ ] **Step 3: Implement `fitsAt`** — false if `startHour + duration > 24`, else no `overlaps()` with any block whose `_id !== ignoreId`.
- [ ] **Step 4: Run** `pnpm test src/lib/schedule.test.ts` — Expected: PASS.
- [ ] **Step 5: Build `PlaylistTray`** — props `{ curated: PlaylistSummary[]; mine: PlaylistSummary[] }`; heading "Available playlists"; each row (cover + name) is `draggable` and sets a `{ kind: "playlist" }` payload. Render it beside the grid on `lg+` (`grid lg:grid-cols-[1fr_220px]`), hidden below `lg`.
- [ ] **Step 6: Wire the grid** in `schedule/page.tsx`: blocks get `draggable` + `onDragStart` (block payload); each hour cell gets `onDragOver` (call `preventDefault()` and set a `hover: { day, hour, ok }` state using `fitsAt`, so the cell tints `bg-primary/20` when ok and `bg-destructive/20` when not) and `onDrop` (block → `updateBlock({ id, day, startHour })`; playlist → `createBlock({ playlistId, day, startHour, duration: DROP_DURATION })`). Read the payload with `getData` only in `onDrop` (browsers hide it during `dragover`; keep the active payload in a `useRef` set in `onDragStart` for the hover check). Catch errors into a `dropError` string shown above the grid in `text-destructive text-xs`, cleared on the next drag start. Give the blocks container `pointer-events-none` while dragging so cells under blocks receive drops.
- [ ] **Step 7: Manual check** in `pnpm dev`: drag a block to a free slot (moves), onto another block (red tint, then the overlap message), and a tray playlist onto an empty hour (creates a 2-hour block). Clicking cells and blocks still opens the modal.
- [ ] **Step 8: Commit** — `feat: drag playlists and blocks on the schedule`

---

### Task 4: Activity log

Prototype: `AccountView → Activity log` ("Workspace activity"). One append-only table, written by a helper called from the venue's existing mutations, and a new Settings tab.

**Files:**
- Modify: `convex/schema.ts` (new `activity` table)
- Create: `convex/lib/activity.ts`, `convex/activity.ts`, `convex/activity.test.ts`
- Modify: `convex/scheduleBlocks.ts`, `convex/announcements.ts`, `convex/playlists.ts`, `convex/userProfiles.ts` (`saveBrand` only)
- Create: `src/components/settings/ActivityPanel.tsx`
- Modify: `src/lib/settingsTabs.ts` (append `{ key: "activity", label: "Activity log" }`, visible to all roles), `src/app/(main)/settings/page.tsx`

**Interfaces:**
- Produces:
  ```ts
  // schema
  activity: defineTable({
    clerkUserId: v.string(),  // venue owner (what requireUser returns)
    actorId: v.string(),      // identity.subject of who did it
    actorName: v.string(),
    summary: v.string(),      // e.g. 'Moved "Morning Jazz" to Tue 9 am'
  }).index("by_clerk_user", ["clerkUserId"])
  // convex/lib/activity.ts
  export async function logActivity(ctx: MutationCtx, clerkUserId: string, summary: string): Promise<void>;
  // convex/activity.ts
  export const listRecent: query({ args: {} }) → Doc<"activity">[] // newest first, at most 50
  ```
- `actorName` = `identity.name ?? identity.email ?? "Someone"`.

Summaries to write (exact):

| mutation | summary |
|---|---|
| `scheduleBlocks.create` | `Scheduled "<label>" on <Day> at <formatHour>` |
| `scheduleBlocks.update` | `Updated "<label>" on <Day> at <formatHour>` |
| `scheduleBlocks.remove` | `Removed "<label>" from <Day>` |
| `announcements.create` / `update` / `remove` | `Created` / `Updated` / `Deleted announcement "<title>"` |
| `announcements.setPaused` | `Paused` / `Resumed announcement "<title>"` |
| `playlists.create` / `update` / `remove` | `Created` / `Updated` / `Deleted playlist "<name>"` |
| `userProfiles.saveBrand` | `Updated the venue brand` |

`<label>` = block title, else playlist name, else "a block".

- [ ] **Step 1: Write the failing tests** in `convex/activity.test.ts`

```ts
it("logs a schedule change for the owner", async () => {
  // setup as in scheduleBlocks.test.ts; asUser = t.withIdentity({ subject: USER, name: "Alex" })
  await asUser.mutation(api.scheduleBlocks.create, { playlistId, day: "Mon", startHour: 9, duration: 2 });
  const rows = await asUser.query(api.activity.listRecent, {});
  expect(rows[0].summary).toBe('Scheduled "Lounge" on Mon at 9 am');
  expect(rows[0].actorName).toBe("Alex");
});
it("files staff actions under the owner but names the staff member", async () => {
  const asStaff = t.withIdentity({ subject: "user_staff", name: "Sam", venue_owner: USER });
  await asStaff.mutation(api.scheduleBlocks.create, { playlistId, day: "Tue", startHour: 10, duration: 1 });
  const rows = await t.withIdentity({ subject: USER }).query(api.activity.listRecent, {});
  expect(rows[0].clerkUserId).toBe(USER);
  expect(rows[0].actorId).toBe("user_staff");
  expect(rows[0].actorName).toBe("Sam");
});
it("never shows another venue's activity", async () => {
  await asUser.mutation(api.scheduleBlocks.create, { playlistId, day: "Mon", startHour: 9, duration: 2 });
  expect(await t.withIdentity({ subject: OTHER }).query(api.activity.listRecent, {})).toEqual([]);
});
it("returns at most 50, newest first", async () => { /* insert 55 rows via t.run, assert length 50 and order */ });
```

- [ ] **Step 2: Run** `pnpm test:convex convex/activity.test.ts` — Expected: FAIL (`api.activity` undefined).
- [ ] **Step 3: Add the table, `logActivity`, and `listRecent`** (`.withIndex("by_clerk_user").order("desc").take(50)`). Add `// shortcut: rows are never pruned, add a cron that deletes rows older than 90 days once tables grow.` on the table.
- [ ] **Step 4: Call `logActivity`** at the end of each mutation in the table above, after the write succeeds.
- [ ] **Step 5: Run** `CONVEX_AGENT_MODE=anonymous npx convex dev --once` then `pnpm test:convex` — Expected: all suites PASS (existing ones too).
- [ ] **Step 6: Build `ActivityPanel`** — a `Card` titled "Workspace activity", one row per entry: initials avatar (`initialsOf` from `src/components/layout`), `actorName`, `summary`, and relative time from `_creationTime`. Empty state: "Changes to your schedule, playlists and announcements will show up here." Add the tab to `settingsTabs.ts` and render it in the settings page.
- [ ] **Step 7: Commit** — `feat: add venue activity log`

---

### Task 5: Artist discovery and Library → Artists

Prototype: `ArtistSpotlight` ("Artist spotlight", "Play artist"), `RelatedArtists` ("Related artists"), `DiscoveryTracks` ("Songs on rotation"), and an artists section in the Library.

**Decision:** artist tracks need audio to be playable, so `artists.get` returns `audioUrl` behind the same `canPlay()` gate as `playlists.getTracks`. Update the CLAUDE.md line "Audio URLs are only ever returned by `playlists.getTracks`" to name both.

**Files:**
- Modify: `convex/schema.ts` (`tracks` gets `.index("by_artist", ["artist"])`)
- Create: `convex/artists.ts`, `convex/artists.test.ts`
- Create: `src/lib/artists.ts`, `src/lib/artists.test.ts`
- Create: `src/components/artists/ArtistCard.tsx`, `src/app/(main)/artists/[name]/page.tsx`
- Modify: `src/app/(main)/playlists/page.tsx` (an "Artist spotlight" `PlaylistCarousel` row after the curated sections), `src/app/(main)/library/page.tsx` (`"artists"` section)
- Modify: `src/proxy.ts` (`"/artists(.*)"`), `CLAUDE.md`

**Interfaces:**
- Produces:
  ```ts
  type ArtistSummary = { name: string; trackCount: number; coverImage?: string; categories: string[] };
  export const list: query({ limit?: number }) → ArtistSummary[]           // by trackCount desc, default 12, max 50
  export const get: query({ name: string }) → { artist: ArtistSummary; tracks: (Doc<"tracks"> & { audioUrl?: string })[] } | null
  export const related: query({ name: string; limit?: number }) → ArtistSummary[] // share a category, excludes self, default 6
  // src/lib/artists.ts
  export function artistHref(name: string): string;   // `/artists/${encodeURIComponent(name)}`
  export function artistFromParam(param: string): string; // decodeURIComponent
  ```
- Consumes: `canPlay` from `convex/lib/auth.ts`, `toPlayerQueue` + `usePlayerStore().playQueue` for "Play artist".

- [ ] **Step 1: Write the failing tests.** `src/lib/artists.test.ts`:

```ts
it.each(["AC/DC", "Simon & Garfunkel", "Sigur Rós", "Two Words"])("round-trips %s", (name) => {
  expect(artistFromParam(artistHref(name).split("/").pop()!)).toBe(name);
});
```

`convex/artists.test.ts` (seed 3 tracks by "Nora" in "Jazz", 1 by "Kai" in "Jazz", 1 by "Lio" in "Pop"):

```ts
it("lists artists by track count", async () => {
  expect((await asUser.query(api.artists.list, {})).map((a) => a.name)).toEqual(["Nora", "Kai", "Lio"]);
});
it("relates artists that share a category", async () => {
  expect((await asUser.query(api.artists.related, { name: "Nora" })).map((a) => a.name)).toEqual(["Kai"]);
});
it("withholds audio when the trial has expired", async () => {
  // insert userProfiles row for USER with plan "trial", trialEndsAt: Date.now() - 1000
  const res = await asUser.query(api.artists.get, { name: "Nora" });
  expect(res!.tracks).toHaveLength(3);
  expect(res!.tracks.every((t) => t.audioUrl === undefined)).toBe(true);
});
it("returns null for an unknown artist", async () => {
  expect(await asUser.query(api.artists.get, { name: "Nobody" })).toBeNull();
});
```

- [ ] **Step 2: Run** `pnpm test src/lib/artists.test.ts` and `pnpm test:convex convex/artists.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement.** `list` and `related` read `ctx.db.query("tracks").collect()` and group by `artist` (skip tracks with no artist); mark it `// shortcut: scans the whole catalogue (~1–2k rows) per call, precompute an artists table in the Jamendo sync if it passes ~10k.` `get` uses `withIndex("by_artist")`. All three call `requireUser()`. `list`/`related` never return `audioUrl`.
- [ ] **Step 4: Run** `CONVEX_AGENT_MODE=anonymous npx convex dev --once`, then both test commands — Expected: PASS.
- [ ] **Step 5: Build the UI.** `ArtistCard` (round cover, name, "N tracks", links to `artistHref`). Artist page: header with cover + name + "Play artist" button (calls `playQueue(toPlayerQueue(tracks), null, 0)`; disabled with the trial copy from `TrialBanner` when no track has audio), "Songs on rotation" track list, and a "Related artists" carousel. Playlists page: "Artist spotlight" carousel of `artists.list({ limit: 12 })`. Library: add `{ key: "artists", label: "Artists", icon: Mic2 }` to `SECTIONS` showing a grid of `ArtistCard` from `artists.list({ limit: 50 })`.
- [ ] **Step 6: Add `/artists` to `src/proxy.ts`, update CLAUDE.md** (protected routes + the audio sentence). Run `pnpm build` — Expected: success.
- [ ] **Step 7: Commit** — `feat: add artist spotlight, artist pages and Library artists`

---

### Task 6: Live announcement banner

Prototype: `AnnouncementBanner` — an amber strip under the top bar: pulsing dot, "Announcement Live", the message, "Playing between tracks", and a dismiss ✕.

**Files:**
- Create: `src/components/announcements/LiveAnnouncementBanner.tsx`
- Modify: `src/components/layout/app-layout.tsx` (render directly under `<TrialBanner />`)

**Interfaces:**
- Consumes: `usePlayerStore((s) => s.announcing)` — `{ cue: AnnouncementCue; advanceAfter: boolean } | null`.

- [ ] **Step 1: Build the banner.** Renders only while `announcing` is set and `announcing.cue.key !== dismissedKey` (local `useState`). Text: `cue.title` in amber bold, then `cue.message` if present (`truncate`), then "Playing between tracks" on `sm+`. ✕ is a `<button aria-label="Hide announcement banner">`. Dot uses `animate-pulse`. `role="status"` so screen readers hear it.
- [ ] **Step 2: Manual check** in `pnpm dev`: create an announcement for the current minute on Announcements, wait for it to play — banner appears, disappears when it ends, ✕ hides it for that play only.
- [ ] **Step 3: Commit** — `feat: show a banner while an announcement plays`

---

### Task 7 (optional): Library → Albums

Needs album data the catalogue does not have yet. Only tracks synced **after** this ships get an album; older rows show under artists only.

**Files:**
- Modify: `convex/schema.ts` (`tracks.album: v.optional(v.string())`), `convex/tracks.ts` (`create` accepts `album`), `convex/jamendo.ts` (map `album_name` → `album`, through `decodeEntities`; add `album_name: string` to the response type)
- Modify: `convex/artists.ts` (add `albums: query({ limit?: number }) → { album: string; artist: string; coverImage?: string; trackCount: number }[]`), `convex/artists.test.ts`
- Modify: `src/app/(main)/library/page.tsx` (`"albums"` section, `Disc3` icon)

- [ ] **Step 1: Write the failing test** — seed 2 tracks with `album: "Blue"` by "Nora" and 1 without; `expect(await asUser.query(api.artists.albums, {})).toEqual([expect.objectContaining({ album: "Blue", artist: "Nora", trackCount: 2 })])`.
- [ ] **Step 2: Run** `pnpm test:convex convex/artists.test.ts` — Expected: FAIL.
- [ ] **Step 3: Implement** the field, the Jamendo mapping and `albums` (group by `artist + album`, skip tracks without an album).
- [ ] **Step 4: Run** `CONVEX_AGENT_MODE=anonymous npx convex dev --once` and `pnpm test:convex` — Expected: PASS.
- [ ] **Step 5: Add the Library section**, empty state "Albums appear as the weekly catalogue sync brings in new music."
- [ ] **Step 6: Commit** — `feat: add albums to the Library`

---

### Finish

- [ ] `pnpm test && pnpm test:convex && pnpm build` — all pass.
- [ ] Production needs no manual Clerk/Convex settings for this plan. Vercel's build deploys the schema changes (new `activity` table, new `tracks` index and optional field — all additive, so no prod data check is needed).
- [ ] Open a PR from `feat/figma-parity` to `main`.
