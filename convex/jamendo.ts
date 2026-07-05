import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

const JAMENDO_TRACKS_URL = "https://api.jamendo.com/v3.0/tracks/";

// Maps this app's channel categories to Jamendo's genre/mood tags.
const CATEGORY_TAGS: Record<string, string> = {
  Relaxing: "chillout",
  Upbeat: "pop",
  Productivity: "instrumental",
  Elegant: "jazz",
  Energetic: "electronic",
  Wellness: "ambient",
};

interface JamendoTrack {
  name: string;
  artist_name: string;
  duration: number;
  audio: string;
  image: string;
}

export const syncChannel = action({
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

    const tag = args.tag ?? CATEGORY_TAGS[channel.category ?? ""] ?? "lounge";

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
    const data: { results: JamendoTrack[] } = await res.json();

    const existingTracks = await ctx.runQuery(api.tracks.list, {
      channelId: args.channelId,
    });
    const existingNames = new Set(existingTracks.map((t) => t.name));

    let inserted = 0;
    for (const track of data.results) {
      if (existingNames.has(track.name)) continue;
      await ctx.runMutation(api.tracks.create, {
        name: track.name,
        artist: track.artist_name,
        duration: track.duration,
        audioUrl: track.audio,
        coverImage: track.image,
        category: channel.category,
        channelId: args.channelId,
      });
      inserted++;
    }

    const firstTrack = data.results[0];
    if (firstTrack) {
      await ctx.runMutation(api.channels.update, {
        id: args.channelId,
        audioUrl: firstTrack.audio,
        coverImage: channel.coverImage ?? firstTrack.image,
      });
    }

    return inserted;
  },
});

export const syncAllChannels = action({
  args: {},
  handler: async (ctx): Promise<Record<string, number>> => {
    const channels = await ctx.runQuery(api.channels.list, {});
    const results: Record<string, number> = {};
    for (const channel of channels) {
      results[channel.name] = await ctx.runAction(api.jamendo.syncChannel, {
        channelId: channel._id,
      });
    }
    return results;
  },
});
