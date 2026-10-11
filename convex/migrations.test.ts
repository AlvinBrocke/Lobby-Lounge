import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";

const USER = "user_mig";

describe("migrations.channelsToPlaylists", () => {
  async function setup() {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const channelId = await t.run((ctx) =>
      ctx.db.insert("channels", {
        name: "Dinner Jazz",
        description: "Elegant jazz",
        category: "Elegant",
        coverImage: "https://example.com/jazz.jpg",
      }),
    );
    await t.run(async (ctx) => {
      await ctx.db.insert("tracks", { name: "So What", channelId });
      await ctx.db.insert("tracks", { name: "Blue Bossa", channelId });
      await ctx.db.insert("tracks", { name: "Loose Track" });
      await ctx.db.insert("scheduleBlocks", {
        clerkUserId: USER,
        day: "Mon",
        startHour: 18,
        duration: 3,
        channelId,
      });
    });
    return { t, channelId };
  }

  it("turns a channel into a curated playlist and repoints schedule blocks", async () => {
    const { t, channelId } = await setup();

    const result = await t.action(internal.migrations.channelsToPlaylists, {});
    expect(result).toEqual({ channels: 1, blocks: 1 });

    const asUser = t.withIdentity({ subject: USER });
    const [playlist] = await asUser.query(api.playlists.listCurated, {});
    expect(playlist).toMatchObject({
      name: "Dinner Jazz",
      category: "Elegant",
      section: "evening",
      coverImage: "https://example.com/jazz.jpg",
      trackCount: 2,
    });
    expect(playlist.legacyChannelId).toBeUndefined();

    const [block] = await asUser.query(api.scheduleBlocks.listByUser, {});
    expect(block.playlistId).toBe(playlist._id);
    expect(block.channelId).toBeUndefined();

    await t.run(async (ctx) => {
      expect(await ctx.db.get(channelId)).toBeNull();
      const tracks = await ctx.db.query("tracks").collect();
      expect(tracks.every((tr) => tr.channelId === undefined)).toBe(true);
    });
  });

  it("is safe to run twice", async () => {
    const { t } = await setup();
    await t.action(internal.migrations.channelsToPlaylists, {});
    const second = await t.action(internal.migrations.channelsToPlaylists, {});

    expect(second).toEqual({ channels: 0, blocks: 0 });
    const curated = await t
      .withIdentity({ subject: USER })
      .query(api.playlists.listCurated, {});
    expect(curated).toHaveLength(1);
    expect(curated[0].trackCount).toBe(2);
  });

  it("resumes a half-finished run without duplicating the playlist", async () => {
    const { t, channelId } = await setup();
    // Simulate a crash after the playlist was created but before the channel
    // was deleted: run the per-channel step, then put the channel back.
    await t.mutation(internal.migrations.migrateChannel, { channelId });
    await t.run(async (ctx) => {
      const playlist = (await ctx.db.query("playlists").collect())[0];
      const newChannel = await ctx.db.insert("channels", { name: "Dinner Jazz" });
      await ctx.db.patch(playlist._id, { legacyChannelId: newChannel });
    });

    await t.action(internal.migrations.channelsToPlaylists, {});
    const curated = await t
      .withIdentity({ subject: USER })
      .query(api.playlists.listCurated, {});
    expect(curated).toHaveLength(1);
  });
});
