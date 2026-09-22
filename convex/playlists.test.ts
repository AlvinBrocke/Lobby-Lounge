import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";

const USER = "user_test123";
const OTHER = "user_other";

describe("playlists", () => {
  it("listByUser returns empty array for new user", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const playlists = await asUser.query(api.playlists.listByUser, {});
    expect(playlists).toEqual([]);
  });

  it("create adds a playlist visible via listByUser", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    await asUser.mutation(api.playlists.create, { name: "My Mix" });
    const playlists = await asUser.query(api.playlists.listByUser, {});
    expect(playlists).toHaveLength(1);
    expect(playlists[0].clerkUserId).toBe(USER);
    expect(playlists[0].name).toBe("My Mix");
    expect(playlists[0].isPublic).toBe(false);
  });

  it("create defaults isPublic to false", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const id = await asUser.mutation(api.playlists.create, { name: "Private" });
    const playlist = await asUser.query(api.playlists.get, { id });
    expect(playlist?.isPublic).toBe(false);
  });

  it("update patches name and description", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const id = await asUser.mutation(api.playlists.create, { name: "Old" });
    await asUser.mutation(api.playlists.update, {
      id,
      name: "New",
      description: "Cool mix",
    });
    const playlist = await asUser.query(api.playlists.get, { id });
    expect(playlist?.name).toBe("New");
    expect(playlist?.description).toBe("Cool mix");
  });

  it("remove deletes the playlist", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const id = await asUser.mutation(api.playlists.create, { name: "Temp" });
    await asUser.mutation(api.playlists.remove, { id });
    const playlist = await asUser.query(api.playlists.get, { id });
    expect(playlist).toBeNull();
  });

  it("addTrack adds a track to the playlist", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const playlistId = await asUser.mutation(api.playlists.create, { name: "Mix" });
    const trackId = await t.mutation(internal.tracks.create, { name: "Track A" });
    await asUser.mutation(api.playlists.addTrack, { playlistId, trackId });
    const tracks = await asUser.query(api.playlists.getTracks, { playlistId });
    expect(tracks).toHaveLength(1);
    expect(tracks[0]?.name).toBe("Track A");
  });

  it("addTrack is idempotent — duplicate is ignored", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const playlistId = await asUser.mutation(api.playlists.create, { name: "Mix" });
    const trackId = await t.mutation(internal.tracks.create, { name: "Track A" });
    await asUser.mutation(api.playlists.addTrack, { playlistId, trackId });
    await asUser.mutation(api.playlists.addTrack, { playlistId, trackId });
    const tracks = await asUser.query(api.playlists.getTracks, { playlistId });
    expect(tracks).toHaveLength(1);
  });

  it("removeTrack removes a track from the playlist", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const playlistId = await asUser.mutation(api.playlists.create, { name: "Mix" });
    const trackId = await t.mutation(internal.tracks.create, { name: "Track A" });
    const playlistTrackId = await asUser.mutation(api.playlists.addTrack, {
      playlistId,
      trackId,
    });
    await asUser.mutation(api.playlists.removeTrack, { playlistTrackId });
    const tracks = await asUser.query(api.playlists.getTracks, { playlistId });
    expect(tracks).toHaveLength(0);
  });

  it("remove playlist also removes its tracks", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const playlistId = await asUser.mutation(api.playlists.create, { name: "Mix" });
    const trackId = await t.mutation(internal.tracks.create, { name: "Track A" });
    await asUser.mutation(api.playlists.addTrack, { playlistId, trackId });
    await asUser.mutation(api.playlists.remove, { id: playlistId });
    // Playlist is gone
    expect(await asUser.query(api.playlists.get, { id: playlistId })).toBeNull();
  });

  it("listByUser only returns playlists for that user", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t
      .withIdentity({ subject: USER })
      .mutation(api.playlists.create, { name: "Mine" });
    await t
      .withIdentity({ subject: OTHER })
      .mutation(api.playlists.create, { name: "Theirs" });
    const mine = await t
      .withIdentity({ subject: USER })
      .query(api.playlists.listByUser, {});
    expect(mine).toHaveLength(1);
    expect(mine[0].name).toBe("Mine");
  });

  it("rejects unauthenticated calls", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const id = await asUser.mutation(api.playlists.create, { name: "Mine" });
    const trackId = await t.mutation(internal.tracks.create, { name: "Track A" });
    const playlistTrackId = await asUser.mutation(api.playlists.addTrack, {
      playlistId: id,
      trackId,
    });

    await expect(t.query(api.playlists.listByUser, {})).rejects.toThrow(
      /Not authenticated/,
    );
    await expect(t.query(api.playlists.get, { id })).rejects.toThrow(
      /Not authenticated/,
    );
    await expect(
      t.query(api.playlists.getTracks, { playlistId: id }),
    ).rejects.toThrow(/Not authenticated/);
    await expect(
      t.mutation(api.playlists.create, { name: "Nobody" }),
    ).rejects.toThrow(/Not authenticated/);
    await expect(
      t.mutation(api.playlists.update, { id, name: "Hijacked" }),
    ).rejects.toThrow(/Not authenticated/);
    await expect(t.mutation(api.playlists.remove, { id })).rejects.toThrow(
      /Not authenticated/,
    );
    await expect(
      t.mutation(api.playlists.addTrack, { playlistId: id, trackId }),
    ).rejects.toThrow(/Not authenticated/);
    await expect(
      t.mutation(api.playlists.removeTrack, { playlistTrackId }),
    ).rejects.toThrow(/Not authenticated/);
  });

  it("another user cannot update or remove someone else's playlist", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const asOther = t.withIdentity({ subject: OTHER });
    const id = await asUser.mutation(api.playlists.create, { name: "Mine" });

    await expect(
      asOther.mutation(api.playlists.update, { id, name: "Hijacked" }),
    ).rejects.toThrow(/Not authorized/);
    await expect(asOther.mutation(api.playlists.remove, { id })).rejects.toThrow(
      /Not authorized/,
    );

    const playlist = await asUser.query(api.playlists.get, { id });
    expect(playlist?.name).toBe("Mine");
  });

  it("another user cannot add or remove tracks on someone else's playlist", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const asOther = t.withIdentity({ subject: OTHER });
    const playlistId = await asUser.mutation(api.playlists.create, { name: "Mine" });
    const trackId = await t.mutation(internal.tracks.create, { name: "Track A" });
    const playlistTrackId = await asUser.mutation(api.playlists.addTrack, {
      playlistId,
      trackId,
    });

    await expect(
      asOther.mutation(api.playlists.addTrack, { playlistId, trackId }),
    ).rejects.toThrow(/Not authorized/);
    await expect(
      asOther.mutation(api.playlists.removeTrack, { playlistTrackId }),
    ).rejects.toThrow(/Not authorized/);

    const tracks = await asUser.query(api.playlists.getTracks, { playlistId });
    expect(tracks).toHaveLength(1);
  });

  it("a private playlist is not readable by another user", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const asOther = t.withIdentity({ subject: OTHER });
    const id = await asUser.mutation(api.playlists.create, { name: "Secret" });
    const trackId = await t.mutation(internal.tracks.create, { name: "Track A" });
    await asUser.mutation(api.playlists.addTrack, { playlistId: id, trackId });

    await expect(asOther.query(api.playlists.get, { id })).rejects.toThrow(
      /Not authorized/,
    );
    await expect(
      asOther.query(api.playlists.getTracks, { playlistId: id }),
    ).rejects.toThrow(/Not authorized/);
  });

  it("a public playlist is readable by another user", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const asOther = t.withIdentity({ subject: OTHER });
    const id = await asUser.mutation(api.playlists.create, {
      name: "Shared",
      isPublic: true,
    });
    const trackId = await t.mutation(internal.tracks.create, { name: "Track A" });
    await asUser.mutation(api.playlists.addTrack, { playlistId: id, trackId });

    const playlist = await asOther.query(api.playlists.get, { id });
    expect(playlist?.name).toBe("Shared");
    const tracks = await asOther.query(api.playlists.getTracks, { playlistId: id });
    expect(tracks).toHaveLength(1);
  });

  it("create trims the name and rejects empty or oversized names", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const id = await asUser.mutation(api.playlists.create, { name: "  Brunch  " });
    expect((await asUser.query(api.playlists.get, { id }))?.name).toBe("Brunch");

    await expect(
      asUser.mutation(api.playlists.create, { name: "   " }),
    ).rejects.toThrow(/name is required/);
    await expect(
      asUser.mutation(api.playlists.create, { name: "x".repeat(81) }),
    ).rejects.toThrow(/80 characters/);
    await expect(
      asUser.mutation(api.playlists.update, { id, name: "" }),
    ).rejects.toThrow(/name is required/);
  });

  it("listByUser includes track count, total duration and a cover fallback", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const playlistId = await asUser.mutation(api.playlists.create, { name: "Mix" });
    const a = await t.mutation(internal.tracks.create, { name: "A", duration: 100 });
    const b = await t.mutation(internal.tracks.create, {
      name: "B",
      duration: 50,
      coverImage: "https://example.com/b.jpg",
    });
    await asUser.mutation(api.playlists.addTrack, { playlistId, trackId: a });
    await asUser.mutation(api.playlists.addTrack, { playlistId, trackId: b });

    const [playlist] = await asUser.query(api.playlists.listByUser, {});
    expect(playlist.trackCount).toBe(2);
    expect(playlist.totalDuration).toBe(150);
    expect(playlist.coverImage).toBe("https://example.com/b.jpg");
  });

  it("getTracks skips tracks that no longer exist", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const playlistId = await asUser.mutation(api.playlists.create, { name: "Mix" });
    const keep = await t.mutation(internal.tracks.create, { name: "Keep" });
    const gone = await t.mutation(internal.tracks.create, { name: "Gone" });
    await asUser.mutation(api.playlists.addTrack, { playlistId, trackId: keep });
    await asUser.mutation(api.playlists.addTrack, { playlistId, trackId: gone });
    await t.mutation(internal.tracks.remove, { id: gone });

    const tracks = await asUser.query(api.playlists.getTracks, { playlistId });
    expect(tracks.map((tr) => tr.name)).toEqual(["Keep"]);
  });

  it("addTrack appends after the last position even after a removal", async () => {
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const asUser = t.withIdentity({ subject: USER });
    const playlistId = await asUser.mutation(api.playlists.create, { name: "Mix" });
    const [a, b, c] = await Promise.all(
      ["A", "B", "C"].map((name) => t.mutation(internal.tracks.create, { name })),
    );
    const ptA = await asUser.mutation(api.playlists.addTrack, { playlistId, trackId: a });
    await asUser.mutation(api.playlists.addTrack, { playlistId, trackId: b });
    await asUser.mutation(api.playlists.removeTrack, { playlistTrackId: ptA });
    await asUser.mutation(api.playlists.addTrack, { playlistId, trackId: c });

    const tracks = await asUser.query(api.playlists.getTracks, { playlistId });
    expect(tracks.map((tr) => tr.name)).toEqual(["B", "C"]);
    expect(new Set(tracks.map((tr) => tr.position)).size).toBe(2);
  });
});
