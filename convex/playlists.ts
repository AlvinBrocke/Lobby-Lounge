import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { assertOwner, requireUser } from "./lib/auth";
import { energyForCategory, type Energy } from "./lib/energy";
import { CURATED_PLAYLISTS, appendTracksTo } from "./lib/curated";

/**
 * Read access to a playlist: the owner, anyone when it is marked public, and
 * everyone for curated playlists.
 * Returns null for a genuinely missing id; throws when access is denied.
 */
async function readablePlaylist(
  ctx: QueryCtx | MutationCtx,
  id: Id<"playlists">,
  clerkUserId: string,
): Promise<Doc<"playlists"> | null> {
  const playlist = await ctx.db.get(id);
  if (!playlist) return null;
  if (playlist.clerkUserId !== clerkUserId && !playlist.isPublic && !playlist.curated) {
    throw new Error("Not authorized");
  }
  return playlist;
}

const MAX_NAME = 80;
const MAX_DESCRIPTION = 300;

/** Trims and bounds a playlist name; throws on empty/oversized input. */
function cleanName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Playlist name is required");
  if (trimmed.length > MAX_NAME) {
    throw new Error(`Playlist name must be ${MAX_NAME} characters or fewer`);
  }
  return trimmed;
}

function cleanDescription(description: string | undefined): string | undefined {
  if (description === undefined) return undefined;
  const trimmed = description.trim();
  if (trimmed.length > MAX_DESCRIPTION) {
    throw new Error(`Description must be ${MAX_DESCRIPTION} characters or fewer`);
  }
  return trimmed;
}

/** Loads a playlist and throws unless the caller owns it. */
async function ownedPlaylist(
  ctx: MutationCtx,
  id: Id<"playlists">,
  clerkUserId: string,
): Promise<Doc<"playlists">> {
  const playlist = await ctx.db.get(id);
  assertOwner(playlist, clerkUserId, "Playlist");
  return playlist;
}

/** Tracks of a playlist in play order, skipping any that left the catalogue. */
async function orderedTracks(
  ctx: QueryCtx | MutationCtx,
  playlistId: Id<"playlists">,
): Promise<Doc<"tracks">[]> {
  const entries = await ctx.db
    .query("playlistTracks")
    .withIndex("by_playlist", (q) => q.eq("playlistId", playlistId))
    .collect();
  entries.sort((a, b) => a.position - b.position);
  return (await Promise.all(entries.map((e) => ctx.db.get(e.trackId)))).filter(
    (t): t is Doc<"tracks"> => t !== null,
  );
}

/** The most common track energy, or "mid" for an empty playlist. */
function dominantEnergy(tracks: Doc<"tracks">[]): Energy {
  const counts: Record<Energy, number> = { low: 0, mid: 0, high: 0 };
  for (const t of tracks) {
    if (t.energy === "low" || t.energy === "mid" || t.energy === "high") counts[t.energy]++;
  }
  const top = (Object.keys(counts) as Energy[]).sort((a, b) => counts[b] - counts[a])[0];
  return counts[top] > 0 ? top : "mid";
}

/**
 * A playlist plus the stats its row/card shows, so list pages need one query
 * instead of one per playlist.
 */
async function summarise(ctx: QueryCtx, playlist: Doc<"playlists">) {
  const tracks = await orderedTracks(ctx, playlist._id);
  return {
    ...playlist,
    trackCount: tracks.length,
    totalDuration: tracks.reduce((sum, t) => sum + (t.duration ?? 0), 0),
    coverImage: playlist.coverImage ?? tracks.find((t) => t.coverImage)?.coverImage,
    // Curated playlists have a category that fixes their energy; a user's
    // playlist is whatever its tracks mostly are.
    energy: playlist.curated ? energyForCategory(playlist.category) : dominantEnergy(tracks),
  };
}

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await requireUser(ctx);
    const playlists = await ctx.db
      .query("playlists")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .collect();

    const enriched = await Promise.all(playlists.map((p) => summarise(ctx, p)));
    // Newest first.
    return enriched.sort((a, b) => b._creationTime - a._creationTime);
  },
});

/** The curated catalogue playlists, in the order they were seeded. */
export const listCurated = query({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    const playlists = await ctx.db
      .query("playlists")
      .withIndex("by_curated", (q) => q.eq("curated", true))
      .collect();
    return await Promise.all(playlists.map((p) => summarise(ctx, p)));
  },
});

export const get = query({
  args: { id: v.id("playlists") },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);
    return await readablePlaylist(ctx, args.id, clerkUserId);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);
    return await ctx.db.insert("playlists", {
      clerkUserId,
      name: cleanName(args.name),
      description: cleanDescription(args.description),
      coverImage: args.coverImage,
      isPublic: args.isPublic ?? false,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("playlists"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);
    const { id, ...fields } = args;

    await ownedPlaylist(ctx, id, clerkUserId);

    if (fields.name !== undefined) fields.name = cleanName(fields.name);
    fields.description = cleanDescription(fields.description);

    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined),
    );
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("playlists") },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);
    await ownedPlaylist(ctx, args.id, clerkUserId);

    // Remove all tracks from playlist first
    const tracks = await ctx.db
      .query("playlistTracks")
      .withIndex("by_playlist", (q) => q.eq("playlistId", args.id))
      .collect();
    for (const t of tracks) {
      await ctx.db.delete(t._id);
    }
    await ctx.db.delete(args.id);
  },
});

export const addTrack = mutation({
  args: {
    playlistId: v.id("playlists"),
    trackId: v.id("tracks"),
    position: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);
    await ownedPlaylist(ctx, args.playlistId, clerkUserId);

    // Prevent duplicates
    const existing = await ctx.db
      .query("playlistTracks")
      .withIndex("by_playlist_and_track", (q) =>
        q.eq("playlistId", args.playlistId).eq("trackId", args.trackId),
      )
      .unique();
    if (existing) return existing._id;

    const track = await ctx.db.get(args.trackId);
    if (!track) throw new Error("Track not found");

    const entries = await ctx.db
      .query("playlistTracks")
      .withIndex("by_playlist", (q) => q.eq("playlistId", args.playlistId))
      .collect();
    // Append after the highest position, not at `entries.length`: after a
    // removal the count is lower than the last position, which would collide.
    const nextPosition =
      entries.reduce((max, e) => Math.max(max, e.position), -1) + 1;

    return await ctx.db.insert("playlistTracks", {
      playlistId: args.playlistId,
      trackId: args.trackId,
      position: args.position ?? nextPosition,
    });
  },
});

export const removeTrack = mutation({
  args: { playlistTrackId: v.id("playlistTracks") },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);

    const playlistTrack = await ctx.db.get(args.playlistTrackId);
    if (!playlistTrack) throw new Error("Playlist track not found");
    await ownedPlaylist(ctx, playlistTrack.playlistId, clerkUserId);

    await ctx.db.delete(args.playlistTrackId);
  },
});

export const getTracks = query({
  args: { playlistId: v.id("playlists") },
  handler: async (ctx, args) => {
    const clerkUserId = await requireUser(ctx);
    const playlist = await readablePlaylist(ctx, args.playlistId, clerkUserId);
    if (!playlist) return [];

    const playlistTracks = await ctx.db
      .query("playlistTracks")
      .withIndex("by_playlist", (q) => q.eq("playlistId", args.playlistId))
      .collect();

    playlistTracks.sort((a, b) => a.position - b.position);

    const tracks = await Promise.all(
      playlistTracks.map(async (pt) => {
        const track = await ctx.db.get(pt.trackId);
        // A track can vanish from the catalogue (e.g. a Jamendo resync). Drop
        // it here — spreading `null` would yield a truthy half-empty object.
        if (!track) return null;
        return { ...track, playlistTrackId: pt._id, position: pt.position };
      }),
    );

    return tracks.filter((t) => t !== null);
  },
});

/* ── Curated catalogue (internal only) ───────────────────────────────────── */

/**
 * Catalogue-side append used by the Jamendo sync. Internal, so it skips the
 * ownership check that `addTrack` does — curated playlists have no owner.
 */
export const appendTracks = internalMutation({
  args: { playlistId: v.id("playlists"), trackIds: v.array(v.id("tracks")) },
  handler: async (ctx, args) => {
    return await appendTracksTo(ctx, args.playlistId, args.trackIds);
  },
});

/** Curated playlist by id, for internal actions (actions can't read the db). */
export const getCurated = internalQuery({
  args: { id: v.id("playlists") },
  handler: async (ctx, args) => {
    const playlist = await ctx.db.get(args.id);
    return playlist?.curated ? playlist : null;
  },
});

/** Curated playlists without the auth check, for the weekly sync cron. */
export const listCuratedInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("playlists")
      .withIndex("by_curated", (q) => q.eq("curated", true))
      .collect();
  },
});

/** Track names already in a curated playlist, so a resync can skip them. */
export const curatedTrackNames = internalQuery({
  args: { playlistId: v.id("playlists") },
  handler: async (ctx, args) => {
    const playlist = await ctx.db.get(args.playlistId);
    if (!playlist?.curated) return [];
    return (await orderedTracks(ctx, args.playlistId)).map((t) => t.name);
  },
});

/**
 * Creates the curated playlists on a fresh deployment. Follow with
 * `npx convex run jamendo:syncAllCurated '{"limit":150}'` to fill them.
 */
export const seedCurated = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("playlists")
      .withIndex("by_curated", (q) => q.eq("curated", true))
      .first();
    if (existing) return "already seeded";

    for (const p of CURATED_PLAYLISTS) {
      await ctx.db.insert("playlists", { ...p, curated: true, isPublic: true });
    }
    return "seeded";
  },
});
