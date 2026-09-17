import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";

describe("tracks", () => {
  it("list returns all tracks when no channelId filter", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t.mutation(internal.tracks.create, { name: "Track A" });
    await t.mutation(internal.tracks.create, { name: "Track B" });
    const tracks = await t.query(api.tracks.list, {});
    expect(tracks).toHaveLength(2);
  });

  it("list filters by channelId", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const channelId = await t.mutation(internal.channels.create, { name: "Jazz" });
    await t.mutation(internal.tracks.create, { name: "On Channel", channelId });
    await t.mutation(internal.tracks.create, { name: "No Channel" });
    const filtered = await t.query(api.tracks.list, { channelId });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe("On Channel");
  });

  it("get returns track by id", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const id = await t.mutation(internal.tracks.create, { name: "Blue Bossa", artist: "Chet Baker" });
    const track = await t.query(api.tracks.get, { id });
    expect(track?.name).toBe("Blue Bossa");
    expect(track?.artist).toBe("Chet Baker");
  });

  it("update patches only provided fields", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const id = await t.mutation(internal.tracks.create, { name: "Original", energy: "low" });
    await t.mutation(internal.tracks.update, { id, name: "Updated" });
    const track = await t.query(api.tracks.get, { id });
    expect(track?.name).toBe("Updated");
    expect(track?.energy).toBe("low"); // unchanged
  });

  it("remove deletes the track", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const id = await t.mutation(internal.tracks.create, { name: "Temporary" });
    await t.mutation(internal.tracks.remove, { id });
    const track = await t.query(api.tracks.get, { id });
    expect(track).toBeNull();
  });

  it("backfillEnergy fills missing energy from the channel category", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const channelId = await t.mutation(internal.channels.create, {
      name: "Morning Boost",
      category: "Upbeat",
    });
    await t.mutation(internal.tracks.create, { name: "No Energy", channelId });

    const result = await t.mutation(internal.tracks.backfillEnergy, {});
    expect(result).toMatchObject({ scanned: 1, patched: 1, remaining: 0 });

    const [track] = await t.query(api.tracks.list, { channelId });
    expect(track.energy).toBe("high");
  });

  it("backfillEnergy leaves already-set energy alone", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const channelId = await t.mutation(internal.channels.create, {
      name: "Morning Boost",
      category: "Upbeat",
    });
    const id = await t.mutation(internal.tracks.create, {
      name: "Hand Tagged",
      channelId,
      energy: "low",
    });

    const result = await t.mutation(internal.tracks.backfillEnergy, {});
    expect(result.patched).toBe(0);
    expect((await t.query(api.tracks.get, { id }))?.energy).toBe("low");
  });

  it("backfillEnergy defaults unknown categories to mid", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const channelId = await t.mutation(internal.channels.create, {
      name: "Mystery",
      category: "Polka",
    });
    const id = await t.mutation(internal.tracks.create, { name: "Unmapped", channelId });

    await t.mutation(internal.tracks.backfillEnergy, {});
    expect((await t.query(api.tracks.get, { id }))?.energy).toBe("mid");
  });

  it("backfillEnergy honours the limit and reports what is left", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const channelId = await t.mutation(internal.channels.create, {
      name: "Spa",
      category: "Wellness",
    });
    for (const name of ["A", "B", "C"]) {
      await t.mutation(internal.tracks.create, { name, channelId });
    }

    const first = await t.mutation(internal.tracks.backfillEnergy, { limit: 2 });
    expect(first).toMatchObject({ patched: 2, remaining: 1 });

    const second = await t.mutation(internal.tracks.backfillEnergy, { limit: 2 });
    expect(second).toMatchObject({ patched: 1, remaining: 0 });
  });

  it("seed populates 10 tracks", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const result = await t.mutation(internal.tracks.seed);
    expect(result).toBe("seeded");
    const tracks = await t.query(api.tracks.list, {});
    expect(tracks).toHaveLength(10);
  });

  it("seed is idempotent", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t.mutation(internal.tracks.seed);
    const result = await t.mutation(internal.tracks.seed);
    expect(result).toBe("already seeded");
    expect(await t.query(api.tracks.list, {})).toHaveLength(10);
  });
});
