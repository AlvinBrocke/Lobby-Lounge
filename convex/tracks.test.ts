import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";

describe("tracks", () => {
  it("list returns all tracks", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t.mutation(internal.tracks.create, { name: "Track A" });
    await t.mutation(internal.tracks.create, { name: "Track B" });
    const tracks = await t.query(internal.tracks.list, {});
    expect(tracks).toHaveLength(2);
  });

  it("get returns track by id", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const id = await t.mutation(internal.tracks.create, { name: "Blue Bossa", artist: "Chet Baker" });
    const track = await t.query(internal.tracks.get, { id });
    expect(track?.name).toBe("Blue Bossa");
    expect(track?.artist).toBe("Chet Baker");
  });

  it("update patches only provided fields", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const id = await t.mutation(internal.tracks.create, { name: "Original", energy: "low" });
    await t.mutation(internal.tracks.update, { id, name: "Updated" });
    const track = await t.query(internal.tracks.get, { id });
    expect(track?.name).toBe("Updated");
    expect(track?.energy).toBe("low"); // unchanged
  });

  it("remove deletes the track", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const id = await t.mutation(internal.tracks.create, { name: "Temporary" });
    await t.mutation(internal.tracks.remove, { id });
    const track = await t.query(internal.tracks.get, { id });
    expect(track).toBeNull();
  });

  it("backfillEnergy fills missing energy from the track category", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const id = await t.mutation(internal.tracks.create, { name: "No Energy", category: "Upbeat" });

    const result = await t.mutation(internal.tracks.backfillEnergy, {});
    expect(result).toMatchObject({ scanned: 1, patched: 1, remaining: 0 });
    expect((await t.query(internal.tracks.get, { id }))?.energy).toBe("high");
  });

  it("backfillEnergy leaves already-set energy alone", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const id = await t.mutation(internal.tracks.create, {
      name: "Hand Tagged",
      category: "Upbeat",
      energy: "low",
    });

    const result = await t.mutation(internal.tracks.backfillEnergy, {});
    expect(result.patched).toBe(0);
    expect((await t.query(internal.tracks.get, { id }))?.energy).toBe("low");
  });

  it("backfillEnergy defaults unknown categories to mid", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const id = await t.mutation(internal.tracks.create, { name: "Unmapped", category: "Polka" });

    await t.mutation(internal.tracks.backfillEnergy, {});
    expect((await t.query(internal.tracks.get, { id }))?.energy).toBe("mid");
  });

  it("backfillEnergy honours the limit and reports what is left", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    for (const name of ["A", "B", "C"]) {
      await t.mutation(internal.tracks.create, { name, category: "Wellness" });
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
    const tracks = await t.query(internal.tracks.list, {});
    expect(tracks).toHaveLength(10);
  });

  it("seed is idempotent", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t.mutation(internal.tracks.seed);
    const result = await t.mutation(internal.tracks.seed);
    expect(result).toBe("already seeded");
    expect(await t.query(internal.tracks.list, {})).toHaveLength(10);
  });

  it("search matches track names and caps results", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t.mutation(internal.tracks.create, { name: "Blue Bossa" });
    await t.mutation(internal.tracks.create, { name: "Autumn Leaves" });
    await t.mutation(internal.tracks.create, { name: "Blue Monk" });
    const asUser = t.withIdentity({ subject: "user_search" });

    const blue = await asUser.query(api.tracks.search, { term: "blue" });
    expect(blue.map((tr) => tr.name).sort()).toEqual(["Blue Bossa", "Blue Monk"]);

    const firstPage = await asUser.query(api.tracks.search, { term: "  ", limit: 2 });
    expect(firstPage).toHaveLength(2);
  });

  it("search requires sign-in and never returns audio", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t.mutation(internal.tracks.create, { name: "Blue Bossa", audioUrl: "https://a/1.mp3" });

    await expect(t.query(api.tracks.search, { term: "blue" })).rejects.toThrow("Not authenticated");

    const asUser = t.withIdentity({ subject: "user_search" });
    const [track] = await asUser.query(api.tracks.search, { term: "blue" });
    expect(track.name).toBe("Blue Bossa");
    expect(track).not.toHaveProperty("audioUrl");
  });
});
