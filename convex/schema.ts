import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  userProfiles: defineTable({
    clerkUserId: v.string(),
    displayName: v.optional(v.string()),
    venueName: v.optional(v.string()),
    plan: v.string(), // 'trial' | 'pro' | etc.
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
    channelId: v.optional(v.id("channels")),
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
});
