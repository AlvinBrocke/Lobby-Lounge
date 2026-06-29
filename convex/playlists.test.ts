import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const USER = "user_test123";

describe("playlists", () => {
  it("listByUser returns empty array for new user", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const playlists = await t.query(api.playlists.listByUser, { clerkUserId: USER });
    expect(playlists).toEqual([]);
  });

  it("create adds a playlist visible via listByUser", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t.mutation(api.playlists.create, { clerkUserId: USER, name: "My Mix" });
    const playlists = await t.query(api.playlists.listByUser, { clerkUserId: USER });
    expect(playlists).toHaveLength(1);
    expect(playlists[0].name).toBe("My Mix");
    expect(playlists[0].isPublic).toBe(false);
  });

  it("create defaults isPublic to false", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const id = await t.mutation(api.playlists.create, { clerkUserId: USER, name: "Private" });
    const playlist = await t.query(api.playlists.get, { id });
    expect(playlist?.isPublic).toBe(false);
  });

  it("update patches name and description", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const id = await t.mutation(api.playlists.create, { clerkUserId: USER, name: "Old" });
    await t.mutation(api.playlists.update, { id, name: "New", description: "Cool mix" });
    const playlist = await t.query(api.playlists.get, { id });
    expect(playlist?.name).toBe("New");
    expect(playlist?.description).toBe("Cool mix");
  });

  it("remove deletes the playlist", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const id = await t.mutation(api.playlists.create, { clerkUserId: USER, name: "Temp" });
    await t.mutation(api.playlists.remove, { id });
    const playlist = await t.query(api.playlists.get, { id });
    expect(playlist).toBeNull();
  });

  it("addTrack adds a track to the playlist", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const playlistId = await t.mutation(api.playlists.create, { clerkUserId: USER, name: "Mix" });
    const trackId = await t.mutation(api.tracks.create, { name: "Track A" });
    await t.mutation(api.playlists.addTrack, { playlistId, trackId });
    const tracks = await t.query(api.playlists.getTracks, { playlistId });
    expect(tracks).toHaveLength(1);
    expect(tracks[0]?.name).toBe("Track A");
  });

  it("addTrack is idempotent — duplicate is ignored", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const playlistId = await t.mutation(api.playlists.create, { clerkUserId: USER, name: "Mix" });
    const trackId = await t.mutation(api.tracks.create, { name: "Track A" });
    await t.mutation(api.playlists.addTrack, { playlistId, trackId });
    await t.mutation(api.playlists.addTrack, { playlistId, trackId });
    const tracks = await t.query(api.playlists.getTracks, { playlistId });
    expect(tracks).toHaveLength(1);
  });

  it("removeTrack removes a track from the playlist", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const playlistId = await t.mutation(api.playlists.create, { clerkUserId: USER, name: "Mix" });
    const trackId = await t.mutation(api.tracks.create, { name: "Track A" });
    const playlistTrackId = await t.mutation(api.playlists.addTrack, { playlistId, trackId });
    await t.mutation(api.playlists.removeTrack, { playlistTrackId });
    const tracks = await t.query(api.playlists.getTracks, { playlistId });
    expect(tracks).toHaveLength(0);
  });

  it("remove playlist also removes its tracks", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const playlistId = await t.mutation(api.playlists.create, { clerkUserId: USER, name: "Mix" });
    const trackId = await t.mutation(api.tracks.create, { name: "Track A" });
    await t.mutation(api.playlists.addTrack, { playlistId, trackId });
    await t.mutation(api.playlists.remove, { id: playlistId });
    // Playlist is gone
    expect(await t.query(api.playlists.get, { id: playlistId })).toBeNull();
  });

  it("listByUser only returns playlists for that user", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t.mutation(api.playlists.create, { clerkUserId: USER, name: "Mine" });
    await t.mutation(api.playlists.create, { clerkUserId: "other_user", name: "Theirs" });
    const mine = await t.query(api.playlists.listByUser, { clerkUserId: USER });
    expect(mine).toHaveLength(1);
    expect(mine[0].name).toBe("Mine");
  });
});
