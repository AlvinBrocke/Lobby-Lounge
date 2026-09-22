import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { energyForCategory } from "./lib/energy";

const JAMENDO_TRACKS_URL = "https://api.jamendo.com/v3.0/tracks/";

// Maps this app's channel categories to Jamendo's genre/mood tags, best first.
// Jamendo's tag search is intermittently flaky: a tag that returns 150 tracks one
// hour can return 0 the next (seen with "electronic", "electronica" and "jazz").
// So each category lists fallbacks, and we move to the next one on an empty result.
const CATEGORY_TAGS: Record<string, string[]> = {
  Relaxing: ["chillout", "lounge"],
  Upbeat: ["pop", "dance"],
  Productivity: ["instrumental", "ambient"],
  Elegant: ["jazz", "lounge"],
  Energetic: ["electronica", "dance", "house"],
  Wellness: ["ambient", "relaxation"],
};

interface JamendoTrack {
  name: string;
  artist_name: string;
  duration: number;
  audio: string;
  image: string;
}

export const syncChannel = internalAction({
  args: {
    channelId: v.id("channels"),
    tag: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<number> => {
    const clientId = process.env.JAMENDO_CLIENT_ID;
    if (!clientId) {
      throw new Error(
        "JAMENDO_CLIENT_ID is not set. Run `npx convex env set JAMENDO_CLIENT_ID <your-client-id>`.",
      );
    }

    const channel = await ctx.runQuery(api.channels.get, { id: args.channelId });
    if (!channel) throw new Error("Channel not found");

    const tags = args.tag
      ? [args.tag]
      : (CATEGORY_TAGS[channel.category ?? ""] ?? ["lounge"]);

    let tag = tags[0];
    let results: JamendoTrack[] = [];
    for (tag of tags) {
      const url = new URL(JAMENDO_TRACKS_URL);
      url.searchParams.set("client_id", clientId);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", String(args.limit ?? 15));
      url.searchParams.set("tags", tag);
      url.searchParams.set("audioformat", "mp32");
      url.searchParams.set("order", "popularity_total");

      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error(`Jamendo request failed: ${res.status} ${res.statusText}`);
      }
      const data: { headers?: unknown; results: JamendoTrack[] } = await res.json();
      if (!Array.isArray(data.results)) {
        throw new Error(`Jamendo returned an unexpected response shape for tag "${tag}"`);
      }
      results = data.results;
      if (results.length > 0) break;
      // Jamendo's `headers` block carries its own status/warnings — useful if an
      // empty result ever turns out to be something other than search flakiness.
      console.warn(
        `syncChannel "${channel.name}": tag=${tag} returned 0 tracks`,
        JSON.stringify(data.headers),
      );
    }

    const energy = energyForCategory(channel.category);

    const existingTracks = await ctx.runQuery(api.tracks.list, {
      channelId: args.channelId,
    });
    const existingNames = new Set(existingTracks.map((t) => t.name));

    // Visible in `npx convex logs` and inline with `npx convex run`. Lets us tell a
    // short Jamendo response apart from a response that was all duplicates.
    console.log(
      `syncChannel "${channel.name}": tag=${tag} requested=${args.limit ?? 15} ` +
        `returned=${results.length} existing=${existingNames.size}`,
    );

    let inserted = 0;
    for (const track of results) {
      if (existingNames.has(track.name)) continue;
      await ctx.runMutation(internal.tracks.create, {
        name: track.name,
        artist: track.artist_name,
        duration: track.duration,
        audioUrl: track.audio,
        coverImage: track.image,
        category: channel.category,
        energy,
        channelId: args.channelId,
      });
      inserted++;
    }

    const firstTrack = results[0];
    if (firstTrack) {
      await ctx.runMutation(internal.channels.update, {
        id: args.channelId,
        audioUrl: firstTrack.audio,
        coverImage: channel.coverImage ?? firstTrack.image,
      });
    }

    return inserted;
  },
});

export const syncAllChannels = internalAction({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args): Promise<Record<string, number | string>> => {
    const channels = await ctx.runQuery(api.channels.list, {});
    const results: Record<string, number | string> = {};
    for (const channel of channels) {
      try {
        results[channel.name] = await ctx.runAction(internal.jamendo.syncChannel, {
          channelId: channel._id,
          limit: args.limit,
        });
      } catch (err) {
        results[channel.name] = `error: ${err instanceof Error ? err.message : String(err)}`;
      }
    }
    return results;
  },
});
