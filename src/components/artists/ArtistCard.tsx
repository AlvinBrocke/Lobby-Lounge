import Link from "next/link";
import type { api } from "@convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { PlaylistCover } from "@/components/playlists/PlaylistCover";
import { artistHref } from "@/lib/artists";

export type ArtistSummary = FunctionReturnType<typeof api.artists.list>[number];

/** Round cover, name and track count, linking to the artist's page. */
export function ArtistCard({ artist }: { artist: ArtistSummary }) {
  return (
    <Link
      href={artistHref(artist.name)}
      className="group w-[132px] shrink-0 flex flex-col items-center text-center gap-2 p-2.5 rounded-xl can-hover:hover:bg-foreground/[0.04] transition-colors"
    >
      <PlaylistCover
        src={artist.coverImage}
        alt=""
        className="w-[104px] h-[104px] rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.35)]"
        iconClassName="w-6 h-6"
      />
      <span className="w-full min-w-0">
        <span className="block text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
          {artist.name}
        </span>
        <span className="block text-[10px] text-faint mt-0.5">
          {artist.trackCount} {artist.trackCount === 1 ? "track" : "tracks"}
        </span>
      </span>
    </Link>
  );
}
