import { convexTest } from "convex-test";
import { describe, it, expect, afterEach, vi } from "vitest";
import { api, internal } from "./_generated/api";
import schema from "./schema";

const track = (name: string) => ({
  name,
  artist_name: "Artist",
  duration: 180,
  audio: `https://example.com/${name}.mp3`,
  image: `https://example.com/${name}.jpg`,
});

// Stubs Jamendo: each tag maps to the track names it should return.
function stubJamendo(byTag: Record<string, string[]>) {
  const requestedTags: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string) => {
      const tag = new URL(input).searchParams.get("tags") ?? "";
      requestedTags.push(tag);
      const results = (byTag[tag] ?? []).map(track);
      return new Response(JSON.stringify({ headers: { status: "success" }, results }));
    }),
  );
  return requestedTags;
}

describe("jamendo.syncPlaylist", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  async function setup(category: string) {
    vi.stubEnv("JAMENDO_CLIENT_ID", "test-client");
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const playlistId = await t.run((ctx) =>
      ctx.db.insert("playlists", {
        name: "Morning Boost",
        category,
        curated: true,
        isPublic: true,
      }),
    );
    return { t, playlistId };
  }

  it("falls back to the next tag when Jamendo returns nothing", async () => {
    const { t, playlistId } = await setup("Energetic");
    const requested = stubJamendo({ electronica: [], dance: ["A", "B"] });

    const inserted = await t.action(internal.jamendo.syncPlaylist, { playlistId });

    expect(inserted).toBe(2);
    expect(requested).toEqual(["electronica", "dance"]);
    const tracks = await t
      .withIdentity({ subject: "user_x" })
      .query(api.playlists.getTracks, { playlistId });
    // Linked into the playlist in Jamendo's order, tagged with its category.
    expect(tracks.map((x) => x.name)).toEqual(["A", "B"]);
    expect(tracks[0].category).toBe("Energetic");
  });

  it("stops at the first tag that returns tracks", async () => {
    const { t, playlistId } = await setup("Energetic");
    const requested = stubJamendo({ electronica: ["A"], dance: ["B"] });

    await t.action(internal.jamendo.syncPlaylist, { playlistId });

    expect(requested).toEqual(["electronica"]);
  });

  it("skips tracks the playlist already has", async () => {
    const { t, playlistId } = await setup("Elegant");
    stubJamendo({ jazz: ["A", "B"] });
    await t.action(internal.jamendo.syncPlaylist, { playlistId });

    stubJamendo({ jazz: ["A", "B", "C"] });
    const inserted = await t.action(internal.jamendo.syncPlaylist, { playlistId });

    expect(inserted).toBe(1);
  });

  it("syncAllCurated syncs every curated playlist and reports errors per playlist", async () => {
    vi.stubEnv("JAMENDO_CLIENT_ID", "test-client");
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    await t.mutation(internal.playlists.seedCurated, {});
    stubJamendo({ chillout: ["A"], jazz: ["B", "C"] });

    const results = await t.action(internal.jamendo.syncAllCurated, {});

    expect(results["Dinner Jazz"]).toBe(2);
    expect(results["Lounge & Chill"]).toBe(1);
    expect(Object.keys(results)).toHaveLength(8);
  });
});
