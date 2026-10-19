import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

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

  it("requires sign-in", async () => {
    const { t } = await setup();
    await expect(t.query(api.artists.list, {})).rejects.toThrow("Not authenticated");
  });
});
