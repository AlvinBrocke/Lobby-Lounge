import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { SCAN_LIMIT } from "./artists";

const USER = "user_artists1";

async function setup() {
  const t = convexTest(schema, import.meta.glob("./**/*.ts"));
  await t.run(async (ctx) => {
    const track = (name: string, artist: string | undefined, category: string) =>
      ctx.db.insert("tracks", { name, artist, category, audioUrl: `https://a/${name}.mp3`, coverImage: `https://c/${name}.jpg` });
    await track("N1", "Nora", "Jazz");
    await track("N2", "Nora", "Jazz");
    await track("N3", "Nora", "Jazz");
    await track("K1", "Kai", "Jazz");
    await track("L1", "Lio", "Pop");
    await track("Anon", undefined, "Jazz");
    await ctx.db.insert("userProfiles", { clerkUserId: USER, plan: "trial", genres: [], onboardingCompleted: true });
  });
  return { t, asUser: t.withIdentity({ subject: USER }) };
}

describe("artists", () => {
  it("lists artists by track count, skipping tracks with no artist", async () => {
    const { asUser } = await setup();
    const artists = await asUser.query(api.artists.list, {});
    expect(artists.map((a) => a.name)).toEqual(["Nora", "Kai", "Lio"]);
    expect(artists[0]).toMatchObject({ trackCount: 3, categories: ["Jazz"], coverImage: "https://c/N1.jpg" });
  });

  it("respects the limit", async () => {
    const { asUser } = await setup();
    expect(await asUser.query(api.artists.list, { limit: 1 })).toHaveLength(1);
  });

  it("relates artists that share a category", async () => {
    const { asUser } = await setup();
    expect((await asUser.query(api.artists.related, { name: "Nora" })).map((a) => a.name)).toEqual(["Kai"]);
  });

  it("returns an artist's tracks with audio during the trial", async () => {
    const { asUser } = await setup();
    const res = await asUser.query(api.artists.get, { name: "Nora" });
    expect(res!.artist.trackCount).toBe(3);
    expect(res!.tracks.every((t) => t.audioUrl)).toBe(true);
  });

  it("withholds audio when the trial has expired", async () => {
    const { t, asUser } = await setup();
    await t.run(async (ctx) => {
      const profile = await ctx.db.query("userProfiles").first();
      await ctx.db.patch(profile!._id, { trialEndsAt: Date.now() - 1000 });
    });
    const res = await asUser.query(api.artists.get, { name: "Nora" });
    expect(res!.tracks).toHaveLength(3);
    expect(res!.tracks.every((t) => t.audioUrl === undefined)).toBe(true);
  });

  it("never returns audio from list or related", async () => {
    const { asUser } = await setup();
    const all = [...(await asUser.query(api.artists.list, {})), ...(await asUser.query(api.artists.related, { name: "Nora" }))];
    expect(JSON.stringify(all)).not.toContain(".mp3");
  });

  it("returns null for an unknown artist", async () => {
    const { asUser } = await setup();
    expect(await asUser.query(api.artists.get, { name: "Nobody" })).toBeNull();
  });

  it("groups albums by artist, skipping tracks without one", async () => {
    const { t, asUser } = await setup();
    await t.run(async (ctx) => {
      await ctx.db.insert("tracks", { name: "B1", artist: "Nora", album: "Blue", coverImage: "https://c/B1.jpg" });
      await ctx.db.insert("tracks", { name: "B2", artist: "Nora", album: "Blue" });
      await ctx.db.insert("tracks", { name: "B3", artist: "Kai", album: "Blue" });
    });
    expect(await asUser.query(api.artists.albums, {})).toEqual([
      { album: "Blue", artist: "Nora", trackCount: 2, coverImage: "https://c/B1.jpg" },
      { album: "Blue", artist: "Kai", trackCount: 1, coverImage: undefined },
    ]);
  });

  it("counts and lists a song once when several playlists carry a copy", async () => {
    const { t, asUser } = await setup();
    await t.run(async (ctx) => {
      // The Jamendo sync stores one row per playlist, so the same song can appear twice.
      await ctx.db.insert("tracks", { name: "N1", artist: "Nora", category: "Lounge", album: "Blue" });
      await ctx.db.insert("tracks", { name: "N4", artist: "Nora", album: "Blue" });
    });
    const nora = (await asUser.query(api.artists.list, {})).find((a) => a.name === "Nora")!;
    expect(nora.trackCount).toBe(4);
    expect(nora.categories).toEqual(["Jazz", "Lounge"]);
    const res = await asUser.query(api.artists.get, { name: "Nora" });
    expect(res!.tracks.map((tr) => tr.name)).toEqual(["N1", "N2", "N3", "N4"]);
    expect(res!.artist.trackCount).toBe(4);
    expect((await asUser.query(api.artists.albums, {}))[0]).toMatchObject({ album: "Blue", trackCount: 2 });
  });

  it("stops scanning at SCAN_LIMIT so a huge catalogue degrades instead of throwing", async () => {
    const { t, asUser } = await setup();
    await t.run(async (ctx) => {
      for (let i = 0; i < SCAN_LIMIT; i++) await ctx.db.insert("tracks", { name: `F${i}`, artist: "Filler" });
      await ctx.db.insert("tracks", { name: "Late", artist: "Latecomer" }); // past the cap
    });
    const names = (await asUser.query(api.artists.list, { limit: 50 })).map((a) => a.name);
    expect(names).toContain("Nora");
    expect(names).not.toContain("Latecomer");
  });

  it("requires sign-in", async () => {
    const { t } = await setup();
    await expect(t.query(api.artists.list, {})).rejects.toThrow("Not authenticated");
  });
});
