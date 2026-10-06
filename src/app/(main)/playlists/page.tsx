"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useConvex, useConvexAuth, useMutation, useQuery } from "convex/react";
import { ListMusic, Plus } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { FunctionReturnType } from "convex/server";
import { PlaylistCard } from "@/components/playlists/PlaylistCard";
import { PlaylistCarousel } from "@/components/playlists/PlaylistCarousel";
import { PlaylistFormModal, type PlaylistFormValues } from "@/components/playlists/PlaylistFormModal";
import { cn } from "@/lib/utils";
import { toPlayerQueue } from "@/lib/playlists";
import usePlayerStore from "@/store/usePlayerStore";

type PlaylistSummary = FunctionReturnType<typeof api.playlists.listCurated>[number];

const SECTIONS = [
  { key: "daytime", title: "Daytime Sets", blurb: "Start strong and carry energy through the afternoon" },
  { key: "evening", title: "Evening & Night", blurb: "Curated for when the lights go down" },
] as const;

function CardSkeletons({ count }: { count: number }) {
  return (
    <div className="flex gap-[11px] overflow-hidden mb-7">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="w-[220px] min-w-[220px] h-[190px] rounded-[11px] bg-card border border-white/5 animate-pulse" />
      ))}
    </div>
  );
}

export default function PlaylistsPage() {
  const router = useRouter();
  const convex = useConvex();
  const { isAuthenticated } = useConvexAuth();
  // The search box lives in the top bar and writes `?q=` to the URL.
  const term = (useSearchParams().get("q") ?? "").trim().toLowerCase();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // "skip" until Clerk's token reaches Convex — otherwise the query runs
  // unauthenticated and `requireUser` throws.
  const curated = useQuery(api.playlists.listCurated, isAuthenticated ? {} : "skip");
  const mine = useQuery(api.playlists.listByUser, isAuthenticated ? {} : "skip");
  const createPlaylist = useMutation(api.playlists.create);

  const activePlaylistId = usePlayerStore((s) => s.activePlaylistId);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playQueue = usePlayerStore((s) => s.playQueue);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  const categories = [
    "All",
    ...Array.from(
      new Set([...(curated ?? []), ...(mine ?? [])].map((p) => p.category).filter(Boolean)),
    ).sort(),
  ];

  function matches(p: PlaylistSummary) {
    return (
      (filter === "All" || p.category === filter) &&
      (!term || `${p.name} ${p.category ?? ""}`.toLowerCase().includes(term))
    );
  }

  async function play(playlist: PlaylistSummary) {
    // The playlist that's already in the player pauses/resumes instead.
    if (playlist._id === activePlaylistId) {
      togglePlay();
      return;
    }
    setLoadingId(playlist._id);
    try {
      // A one-off read, not a subscription: the queue is a snapshot taken
      // at the moment you press play.
      const tracks = await convex.query(api.playlists.getTracks, { playlistId: playlist._id });
      playQueue(toPlayerQueue(tracks), playlist._id);
    } finally {
      setLoadingId(null);
    }
  }

  function card(p: PlaylistSummary) {
    const active = p._id === activePlaylistId;
    return (
      <PlaylistCard
        key={p._id}
        playlist={p}
        active={active}
        playing={active && isPlaying}
        loading={loadingId === p._id}
        onPlay={() => play(p)}
      />
    );
  }

  async function handleCreate({ name, description }: PlaylistFormValues) {
    const id: Id<"playlists"> = await createPlaylist({
      name,
      description: description || undefined,
    });
    router.push(`/playlists/${id}`);
  }

  const filtering = filter !== "All" || term !== "";
  const curatedSections = SECTIONS.map((s) => ({
    ...s,
    rows: (curated ?? []).filter((p) => p.section === s.key && matches(p)),
  })).filter((s) => s.rows.length > 0);
  const myVisible = (mine ?? []).filter(matches);
  const nothingFound =
    filtering && curated !== undefined && mine !== undefined &&
    curatedSections.length === 0 && myVisible.length === 0;

  const newButton = (
    <button
      onClick={() => setShowModal(true)}
      className="flex items-center gap-1 h-[29px] px-3 rounded-full bg-primary text-primary-foreground text-[11px] font-bold hover:opacity-90 transition-opacity"
    >
      <Plus className="w-3 h-3" strokeWidth={3} />
      New
    </button>
  );

  return (
    <>
      {/* Genre chips */}
      <div className="flex gap-1.5 flex-wrap pb-3 mb-[18px] border-b border-primary/[0.08]">
        {categories.map((c) => {
          const active = filter === c;
          return (
            <button
              key={c}
              onClick={() => setFilter(c)}
              aria-pressed={active}
              className={cn(
                "px-[13px] py-[5px] rounded-full text-[11px] font-semibold border transition-colors",
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-muted-foreground border-primary/20 hover:border-primary hover:text-foreground",
              )}
            >
              {c}
            </button>
          );
        })}
      </div>

      {term && (
        <p className="text-xs text-muted-foreground mb-4">
          Showing playlists matching <span className="text-foreground font-semibold">“{term}”</span>
        </p>
      )}

      {curated === undefined ? (
        <CardSkeletons count={5} />
      ) : (
        curatedSections.map(({ key, title, blurb, rows }) => (
          <PlaylistCarousel key={key} title={title} blurb={blurb}>
            {rows.map(card)}
          </PlaylistCarousel>
        ))
      )}

      {/* The user's own playlists */}
      {mine === undefined ? (
        <CardSkeletons count={2} />
      ) : myVisible.length > 0 ? (
        <PlaylistCarousel title="My Playlists" blurb="Mixes you've built from the catalogue" action={newButton}>
          {myVisible.map(card)}
        </PlaylistCarousel>
      ) : !filtering ? (
        <section className="mb-7">
          <h2 className="text-sm font-bold tracking-tight text-foreground mb-2.5">My Playlists</h2>
          <div className="flex items-center gap-4 rounded-[11px] border border-dashed border-primary/20 bg-card/50 p-5">
            <div className="w-11 h-11 rounded-[10px] bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <ListMusic className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-foreground">No playlists yet</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Build your own mix from the catalogue.
              </p>
            </div>
            {newButton}
          </div>
        </section>
      ) : null}

      {nothingFound && (
        <div className="py-10 text-center rounded-[11px] bg-secondary">
          <p className="text-[13px] font-bold text-foreground">No playlists found</p>
          <p className="text-[11px] text-muted-foreground mt-1">Try a genre, mood, or playlist name.</p>
        </div>
      )}

      {showModal && (
        <PlaylistFormModal
          mode="create"
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
        />
      )}
    </>
  );
}
