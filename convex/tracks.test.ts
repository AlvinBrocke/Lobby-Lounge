import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

describe("tracks", () => {
  it("list returns all tracks when no channelId filter", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t.mutation(api.tracks.create, { name: "Track A" });
    await t.mutation(api.tracks.create, { name: "Track B" });
    const tracks = await t.query(api.tracks.list, {});
    expect(tracks).toHaveLength(2);
  });

  it("list filters by channelId", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const channelId = await t.mutation(api.channels.create, { name: "Jazz" });
    await t.mutation(api.tracks.create, { name: "On Channel", channelId });
    await t.mutation(api.tracks.create, { name: "No Channel" });
    const filtered = await t.query(api.tracks.list, { channelId });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe("On Channel");
  });

  it("get returns track by id", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const id = await t.mutation(api.tracks.create, { name: "Blue Bossa", artist: "Chet Baker" });
    const track = await t.query(api.tracks.get, { id });
    expect(track?.name).toBe("Blue Bossa");
    expect(track?.artist).toBe("Chet Baker");
  });

  it("update patches only provided fields", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const id = await t.mutation(api.tracks.create, { name: "Original", energy: "low" });
    await t.mutation(api.tracks.update, { id, name: "Updated" });
    const track = await t.query(api.tracks.get, { id });
    expect(track?.name).toBe("Updated");
    expect(track?.energy).toBe("low"); // unchanged
  });

  it("remove deletes the track", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const id = await t.mutation(api.tracks.create, { name: "Temporary" });
    await t.mutation(api.tracks.remove, { id });
    const track = await t.query(api.tracks.get, { id });
    expect(track).toBeNull();
  });

  it("seed populates 10 tracks", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const result = await t.mutation(api.tracks.seed);
    expect(result).toBe("seeded");
    const tracks = await t.query(api.tracks.list, {});
    expect(tracks).toHaveLength(10);
  });

  it("seed is idempotent", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t.mutation(api.tracks.seed);
    const result = await t.mutation(api.tracks.seed);
    expect(result).toBe("already seeded");
    expect(await t.query(api.tracks.list, {})).toHaveLength(10);
  });
});
