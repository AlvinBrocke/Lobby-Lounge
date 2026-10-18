import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { CATEGORY_TAGS, energyForCategory } from "./lib/energy";
import { decodeEntities } from "./lib/text";

const JAMENDO_TRACKS_URL = "https://api.jamendo.com/v3.0/tracks/";

// An empty result is usually that flakiness rather than a genuinely empty tag, and
// asking again moments later typically succeeds — so retry once before falling back.
const EMPTY_RESULT_ATTEMPTS = 2;
const EMPTY_RESULT_RETRY_MS = 500;

interface JamendoTrack {
  name: string;
  artist_name: string;
  duration: number;
  audio: string;
  image: string;
}

export const syncPlaylist = internalAction({
  args: {
    playlistId: v.id("playlists"),
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

    const playlist = await ctx.runQuery(internal.playlists.getCurated, { id: args.playlistId });
    if (!playlist) throw new Error("Curated playlist not found");

    const tags = args.tag
      ? [args.tag]
      : (CATEGORY_TAGS[playlist.category ?? ""] ?? ["lounge"]);

    let tag = tags[0];
    let results: JamendoTrack[] = [];
    search: for (tag of tags) {
      for (let attempt = 1; attempt <= EMPTY_RESULT_ATTEMPTS; attempt++) {
        if (attempt > 1) await new Promise((r) => setTimeout(r, EMPTY_RESULT_RETRY_MS));
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
        if (results.length > 0) break search;
        // Jamendo's `headers` block carries its own status/warnings — useful if an
        // empty result ever turns out to be something other than search flakiness.
        console.warn(
          `syncPlaylist "${playlist.name}": tag=${tag} returned 0 tracks ` +
            `(attempt ${attempt}/${EMPTY_RESULT_ATTEMPTS})`,
          JSON.stringify(data.headers),
        );
      }
    }

    const energy = energyForCategory(playlist.category);

    const existingNames = new Set(
      await ctx.runQuery(internal.playlists.curatedTrackNames, { playlistId: args.playlistId }),
    );

    // Visible in `npx convex logs` and inline with `npx convex run`. Lets us tell a
    // short Jamendo response apart from a response that was all duplicates.
    console.log(
      `syncPlaylist "${playlist.name}": tag=${tag} requested=${args.limit ?? 15} ` +
        `returned=${results.length} existing=${existingNames.size}`,
    );

    const trackIds = [];
    for (const track of results) {
      // Jamendo HTML-escapes some names ("Dada &amp; the Weathermen"); store plain text.
      // Decoded before the duplicate check so it matches names stored by earlier syncs.
      const name = decodeEntities(track.name);
      if (existingNames.has(name)) continue;
      existingNames.add(name);
      trackIds.push(
        await ctx.runMutation(internal.tracks.create, {
          name,
          artist: decodeEntities(track.artist_name),
          duration: track.duration,
          audioUrl: track.audio,
          coverImage: track.image,
          category: playlist.category,
          energy,
        }),
      );
    }

    // One mutation for the whole batch, so positions are assigned in order.
    await ctx.runMutation(internal.playlists.appendTracks, {
      playlistId: args.playlistId,
      trackIds,
    });

    return trackIds.length;
  },
});

export const syncAllCurated = internalAction({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args): Promise<Record<string, number | string>> => {
    const playlists = await ctx.runQuery(internal.playlists.listCuratedInternal, {});
    const results: Record<string, number | string> = {};
    for (const playlist of playlists) {
      try {
        results[playlist.name] = await ctx.runAction(internal.jamendo.syncPlaylist, {
          playlistId: playlist._id,
          limit: args.limit,
        });
      } catch (err) {
        results[playlist.name] = `error: ${err instanceof Error ? err.message : String(err)}`;
      }
    }
    return results;
  },
});
