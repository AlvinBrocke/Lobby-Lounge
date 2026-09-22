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

describe("jamendo.syncChannel", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  async function setup(category: string) {
    vi.stubEnv("JAMENDO_CLIENT_ID", "test-client");
    const t = convexTest(schema, import.meta.glob("./**/*.ts"));
    const channelId = await t.mutation(internal.channels.create, {
      name: "Morning Boost",
      category,
    });
    return { t, channelId };
  }

  it("falls back to the next tag when Jamendo returns nothing", async () => {
    const { t, channelId } = await setup("Energetic");
    const requested = stubJamendo({ electronica: [], dance: ["A", "B"] });

    const inserted = await t.action(internal.jamendo.syncChannel, { channelId });

    expect(inserted).toBe(2);
    expect(requested).toEqual(["electronica", "dance"]);
    const tracks = await t.query(api.tracks.list, { channelId });
    expect(tracks.map((x) => x.name).sort()).toEqual(["A", "B"]);
  });

  it("stops at the first tag that returns tracks", async () => {
    const { t, channelId } = await setup("Energetic");
    const requested = stubJamendo({ electronica: ["A"], dance: ["B"] });

    await t.action(internal.jamendo.syncChannel, { channelId });

    expect(requested).toEqual(["electronica"]);
  });

  it("skips tracks the channel already has", async () => {
    const { t, channelId } = await setup("Elegant");
    stubJamendo({ jazz: ["A", "B"] });
    await t.action(internal.jamendo.syncChannel, { channelId });

    stubJamendo({ jazz: ["A", "B", "C"] });
    const inserted = await t.action(internal.jamendo.syncChannel, { channelId });

    expect(inserted).toBe(1);
  });
});
