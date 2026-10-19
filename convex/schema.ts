import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { soundSettings } from "./lib/sound";

export default defineSchema({
  userProfiles: defineTable({
    clerkUserId: v.string(),
    displayName: v.optional(v.string()),
    venueName: v.optional(v.string()),
    plan: v.string(), // 'trial' | 'basic' — see convex/lib/billing.ts
    // Overrides the default trial end (profile creation + TRIAL_DAYS), e.g. to
    // extend a trial via `userProfiles:extendTrial`. Epoch ms.
    trialEndsAt: v.optional(v.number()),
    genres: v.array(v.string()),
    mood: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    // Business details collected during onboarding (all optional so that
    // "Skip for now" and pre-existing rows stay valid).
    businessType: v.optional(v.string()),
    country: v.optional(v.string()), // ISO 3166-1 alpha-2, e.g. "US"
    region: v.optional(v.string()), // state / province / free text
    locationCount: v.optional(v.number()),
    guestDemographics: v.optional(v.array(v.string())),
    audienceGender: v.optional(v.string()), // AUDIENCE_GENDERS id in src/lib/preferences.ts
    ageGroups: v.optional(v.array(v.string())), // AGE_GROUPS ids
    // Brand profile (Settings → Venue details → Edit brand).
    logoStorageId: v.optional(v.id("_storage")),
    brandColor: v.optional(v.string()), // a key of BRAND_COLORS in convex/lib/brand.ts
    // Settings → Preferences. Tempo matches track `energy`.
    tempo: v.optional(v.union(v.literal("low"), v.literal("mid"), v.literal("high"))),
    sound: v.optional(soundSettings),
  }).index("by_clerk_user", ["clerkUserId"]),

  tracks: defineTable({
    name: v.string(),
    artist: v.optional(v.string()),
    category: v.optional(v.string()),
    duration: v.optional(v.number()), // seconds
    energy: v.optional(v.string()), // 'low' | 'mid' | 'high'
    audioUrl: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  }).searchIndex("search_name", { searchField: "name" }),

  playlists: defineTable({
    // Absent on curated playlists, which ship with the app and have no owner.
    clerkUserId: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    isPublic: v.boolean(),
    // Curated catalogue playlists (the former "channels"). Readable by every
    // signed-in user, writable only from internal functions.
    curated: v.optional(v.boolean()),
    category: v.optional(v.string()),
    section: v.optional(v.union(v.literal("daytime"), v.literal("evening"))),
  })
    .index("by_clerk_user", ["clerkUserId"])
    .index("by_curated", ["curated"]),

  playlistTracks: defineTable({
    playlistId: v.id("playlists"),
    trackId: v.id("tracks"),
    position: v.number(),
  })
    .index("by_playlist", ["playlistId"])
    .index("by_playlist_and_track", ["playlistId", "trackId"]),

  scheduleBlocks: defineTable({
    clerkUserId: v.string(),
    day: v.string(), // 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
    startHour: v.number(), // 0-23
    duration: v.number(), // hours
    playlistId: v.optional(v.id("playlists")),
    title: v.optional(v.string()),
  }).index("by_clerk_user", ["clerkUserId"]),

  // A venue's "love" or "block" on a track. One row per user + track: blocking
  // a loved track replaces the love. Blocked tracks are skipped by the player.
  trackReactions: defineTable({
    clerkUserId: v.string(),
    trackId: v.id("tracks"),
    kind: v.union(v.literal("like"), v.literal("block")),
  })
    .index("by_clerk_user", ["clerkUserId"])
    .index("by_user_and_track", ["clerkUserId", "trackId"]),

  // Short voice messages played over the music at set times. Rules live in
  // convex/announcements.ts and are mirrored in src/lib/announcements.ts.
  announcements: defineTable({
    clerkUserId: v.string(),
    title: v.string(),
    // 'ai': `message` is a script spoken by the browser's text-to-speech.
    // 'record' | 'upload': the voiceover is an audio file in `storageId`.
    source: v.union(v.literal("ai"), v.literal("record"), v.literal("upload")),
    message: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    audioName: v.optional(v.string()),
    audioSeconds: v.optional(v.number()),
    voiceName: v.optional(v.string()), // SpeechSynthesisVoice.name; falls back to the default voice
    pitch: v.number(), // 0-100
    speed: v.number(), // 0-100
    volumeBoost: v.number(), // dB over the music: 0 | 2 | 4 | 6
    status: v.union(v.literal("scheduled"), v.literal("draft")),
    paused: v.boolean(),
    days: v.array(v.string()), // 'Mon' … 'Sun'
    // Minutes after midnight. 'once' plays at startMinute; 'multiple' repeats
    // every `everyMinutes` from startMinute up to and including endMinute.
    occurrence: v.union(v.literal("once"), v.literal("multiple")),
    startMinute: v.number(),
    endMinute: v.optional(v.number()),
    everyMinutes: v.optional(v.number()),
    interruptMusic: v.boolean(),
  }).index("by_clerk_user", ["clerkUserId"]),

  // Settings → Activity log. Append-only, written by `logActivity` in
  // convex/lib/activity.ts after a venue's mutation succeeds.
  // shortcut: rows are never pruned, add a cron that deletes rows older than 90 days once tables grow.
  activity: defineTable({
    clerkUserId: v.string(), // venue owner (what requireUser returns)
    actorId: v.string(), // identity.subject of the person who did it
    actorName: v.string(),
    summary: v.string(), // e.g. 'Moved "Morning Jazz" to Tue 9 am'
  }).index("by_clerk_user", ["clerkUserId"]),
});
