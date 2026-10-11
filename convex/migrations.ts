import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { appendTracksTo, sectionFor } from "./lib/curated";

/**
 * One-off: turns every channel into a curated playlist.
 *
 *   npx convex run migrations:channelsToPlaylists        (add --prod for production)
 *
 * Idempotent — each playlist remembers the channel it came from in
 * `legacyChannelId`, so re-running finds it instead of creating a duplicate.
 * Must finish on every deployment before the schema drops the `channels` table
 * and `legacyChannelId` — a push fails while any document still has them.
 */
export const channelsToPlaylists = internalAction({
  args: {},
  handler: async (ctx): Promise<{ channels: number; blocks: number }> => {
    const channelIds = await ctx.runQuery(internal.migrations.channelIds, {});
    // One mutation per channel: each is its own transaction, which keeps any
    // single one well under Convex's per-transaction read/write limits.
    for (const channelId of channelIds) {
      await ctx.runMutation(internal.migrations.migrateChannel, { channelId });
    }
    const blocks = await ctx.runMutation(internal.migrations.schedulesToPlaylists, {});
    // Last, so a run that dies part-way can still be resumed via the ids.
    await ctx.runMutation(internal.migrations.clearLegacyChannelIds, {});
    return { channels: channelIds.length, blocks };
  },
});

export const channelIds = internalQuery({
  args: {},
  handler: async (ctx) => {
    return (await ctx.db.query("channels").collect()).map((c) => c._id);
  },
});

async function playlistForChannel(
  ctx: MutationCtx,
  channelId: string,
): Promise<Doc<"playlists"> | null> {
  const curated = await ctx.db
    .query("playlists")
    .withIndex("by_curated", (q) => q.eq("curated", true))
    .collect();
  return curated.find((p) => p.legacyChannelId === channelId) ?? null;
}

export const migrateChannel = internalMutation({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    const channel = await ctx.db.get(args.channelId);
    if (!channel) return;

    const existing = await playlistForChannel(ctx, channel._id);
    const playlistId =
      existing?._id ??
      (await ctx.db.insert("playlists", {
        name: channel.name,
        description: channel.description,
        category: channel.category,
        coverImage: channel.coverImage,
        section: sectionFor(channel.name),
        curated: true,
        isPublic: true,
        legacyChannelId: channel._id,
      }));

    const tracks = await ctx.db
      .query("tracks")
      .withIndex("by_channel", (q) => q.eq("channelId", channel._id))
      .collect();
    await appendTracksTo(
      ctx,
      playlistId,
      tracks.map((t) => t._id),
    );
    for (const track of tracks) {
      // `undefined` in a patch removes the field.
      await ctx.db.patch(track._id, { channelId: undefined });
    }

    await ctx.db.delete(channel._id);
  },
});

/** Points every schedule block at the playlist its channel became. */
export const schedulesToPlaylists = internalMutation({
  args: {},
  handler: async (ctx) => {
    const blocks = await ctx.db.query("scheduleBlocks").collect();
    let migrated = 0;
    for (const block of blocks) {
      if (block.channelId === undefined) continue;
      const playlist = await playlistForChannel(ctx, block.channelId);
      await ctx.db.patch(block._id, {
        playlistId: block.playlistId ?? playlist?._id,
        channelId: undefined,
      });
      migrated++;
    }
    return migrated;
  },
});

/** Removes the temporary `legacyChannelId` once every block is repointed. */
export const clearLegacyChannelIds = internalMutation({
  args: {},
  handler: async (ctx) => {
    const curated = await ctx.db
      .query("playlists")
      .withIndex("by_curated", (q) => q.eq("curated", true))
      .collect();
    for (const playlist of curated) {
      if (playlist.legacyChannelId !== undefined) {
        await ctx.db.patch(playlist._id, { legacyChannelId: undefined });
      }
    }
  },
});
