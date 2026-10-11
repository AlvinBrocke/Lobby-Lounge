import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
  }).index("by_clerk_user", ["clerkUserId"]),

  // TEMPORARY: production still has channel data that predates curated
  // playlists. Restored so `migrations:channelsToPlaylists` can run there;
  // drop this table and every `channelId` / `legacyChannelId` once it has.
  channels: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    bpm: v.optional(v.number()),
    coverImage: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
  }),

  tracks: defineTable({
    name: v.string(),
    artist: v.optional(v.string()),
    category: v.optional(v.string()),
    duration: v.optional(v.number()), // seconds
    energy: v.optional(v.string()), // 'low' | 'mid' | 'high'
    audioUrl: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    channelId: v.optional(v.id("channels")), // legacy — see `channels`
  })
    .index("by_channel", ["channelId"])
    .searchIndex("search_name", { searchField: "name" }),

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
    // Temporary: the channel a curated playlist was migrated from. Makes
    // `migrations:channelsToPlaylists` safe to re-run. Removed once migrated.
    legacyChannelId: v.optional(v.string()),
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
    channelId: v.optional(v.id("channels")), // legacy — migrated to playlistId
    title: v.optional(v.string()),
  }).index("by_clerk_user", ["clerkUserId"]),

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
});
