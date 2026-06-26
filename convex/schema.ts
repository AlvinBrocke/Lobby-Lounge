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
  }).index("by_channel", ["channelId"]),

  playlists: defineTable({
    clerkUserId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    isPublic: v.boolean(),
  }).index("by_clerk_user", ["clerkUserId"]),

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
    channelId: v.optional(v.id("channels")),
    title: v.optional(v.string()),
  }).index("by_clerk_user", ["clerkUserId"]),
});
