import { internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./lib/auth";
import { energyForCategory } from "./lib/energy";
import { decodeEntities } from "./lib/text";

export const list = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tracks").collect();
  },
});

/**
 * Catalogue search for the "Add songs" dialog. Uses the `search_name` full-text
 * index so we never ship the whole 1,000+ track catalogue to the browser.
 * An empty term returns the first page of tracks so the dialog isn't blank.
 */
export const search = query({
  args: { term: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    const limit = Math.min(args.limit ?? 25, 50);
    const term = args.term.trim();
    const tracks = term
      ? await ctx.db
          .query("tracks")
          .withSearchIndex("search_name", (q) => q.search("name", term))
          .take(limit)
      : await ctx.db.query("tracks").take(limit);
    // Search is for adding songs, not playing them. Audio only comes from
    // `playlists.getTracks`, which checks the caller's trial/plan.
    return tracks.map(({ audioUrl: _audioUrl, ...track }) => track);
  },
});

export const get = internalQuery({
  args: { id: v.id("tracks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = internalMutation({
  args: {
    name: v.string(),
    artist: v.optional(v.string()),
    category: v.optional(v.string()),
    duration: v.optional(v.number()),
    energy: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tracks", args);
  },
});

export const update = internalMutation({
  args: {
    id: v.id("tracks"),
    name: v.optional(v.string()),
    artist: v.optional(v.string()),
    category: v.optional(v.string()),
    duration: v.optional(v.number()),
    energy: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    coverImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined),
    );
    await ctx.db.patch(id, patch);
  },
});

export const remove = internalMutation({
  args: { id: v.id("tracks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/**
 * Fills in `energy` on tracks that predate the field.
 *
 * `jamendo.syncPlaylist` only sets `energy` on newly inserted tracks, and it
 * skips tracks it has already synced — so rows written before the field existed
 * would otherwise stay unset forever.
 *
 * Runs in capped batches because a single Convex mutation is a transaction with
 * a bounded read/write budget; call it repeatedly until `remaining` is 0:
 *   npx convex run tracks:backfillEnergy '{}'
 */
export const backfillEnergy = internalMutation({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;
    const tracks = await ctx.db.query("tracks").collect();
    const missing = tracks.filter((t) => t.energy === undefined);

    let patched = 0;
    for (const track of missing.slice(0, limit)) {
      await ctx.db.patch(track._id, { energy: energyForCategory(track.category) });
      patched++;
    }

    return {
      scanned: tracks.length,
      patched,
      remaining: missing.length - patched,
    };
  },
});

/**
 * One-off fix for tracks synced before `jamendo.syncPlaylist` decoded HTML
 * entities, whose names/artists were stored as e.g. "Dada &amp; the Weathermen".
 *
 * Same capped-batch shape as `backfillEnergy`; repeat until `remaining` is 0:
 *   npx convex run tracks:backfillDecodeEntities '{}'
 */
export const backfillDecodeEntities = internalMutation({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;
    const tracks = await ctx.db.query("tracks").collect();
    const encoded = tracks.filter(
      (t) => decodeEntities(t.name) !== t.name || (t.artist && decodeEntities(t.artist) !== t.artist),
    );

    let patched = 0;
    for (const track of encoded.slice(0, limit)) {
      await ctx.db.patch(track._id, {
        name: decodeEntities(track.name),
        artist: track.artist && decodeEntities(track.artist),
      });
      patched++;
    }

    return {
      scanned: tracks.length,
      patched,
      remaining: encoded.length - patched,
    };
  },
});

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("tracks").first();
    if (existing) return "already seeded";

    const tracksData = [
      { name: "Blue Bossa", artist: "Chet Baker Trio", category: "Jazz", duration: 262, energy: "low" },
      { name: "Autumn Leaves", artist: "Coltrane Quartet", category: "Jazz", duration: 287, energy: "low" },
      { name: "So What", artist: "Miles Davis", category: "Jazz", duration: 314, energy: "mid" },
      { name: "Fly Me to the Moon", artist: "Frank Sinatra", category: "Jazz", duration: 188, energy: "low" },
      { name: "Floating", artist: "Ethereal Waves", category: "Ambient", duration: 432, energy: "low" },
      { name: "Rain Garden", artist: "Nature Sounds", category: "Ambient", duration: 480, energy: "low" },
      { name: "Deep Focus Flow", artist: "Ambient Collective", category: "Focus", duration: 370, energy: "low" },
      { name: "Morning Flow", artist: "Study Sessions", category: "Focus", duration: 345, energy: "low" },
      { name: "Neon City", artist: "Synthwave Kids", category: "Electronic", duration: 295, energy: "high" },
      { name: "Golden Hour", artist: "Indie Folk", category: "Pop", duration: 235, energy: "mid" },
    ];

    for (const track of tracksData) {
      await ctx.db.insert("tracks", track);
    }

    return "seeded";
  },
});
