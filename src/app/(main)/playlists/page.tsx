"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConvex, useConvexAuth, useMutation, useQuery } from "convex/react";
import { ListMusic, Plus, Search } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { FunctionReturnType } from "convex/server";
import { PlaylistFormModal, type PlaylistFormValues } from "@/components/playlists/PlaylistFormModal";
import { PlaylistRow } from "@/components/playlists/PlaylistRow";
import { cn } from "@/lib/utils";
import { toPlayerQueue } from "@/lib/playlists";
import usePlayerStore from "@/store/usePlayerStore";

type PlaylistSummary = FunctionReturnType<typeof api.playlists.listCurated>[number];

const SECTIONS = [
  { key: "daytime", title: "Daytime Sets", blurb: "Start strong and carry energy through the afternoon" },
  { key: "evening", title: "Evening & Night", blurb: "Wind down, dine and keep the night going" },
] as const;

function SectionHeading({ title, blurb }: { title: string; blurb?: string }) {
  return (
    <div className="mb-3">
      <h2
        className="text-[17px] font-bold text-foreground tracking-tight"
      >
        {title}
      </h2>
      {blurb && <p className="text-xs text-muted-foreground mt-0.5">{blurb}</p>}
    </div>
  );
}

function RowSkeletons({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-[76px] rounded-xl bg-card border border-border animate-pulse" />
      ))}
    </div>
  );
}

export default function PlaylistsPage() {
  const router = useRouter();
  const convex = useConvex();
  const { isAuthenticated } = useConvexAuth();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
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

  const term = search.trim().toLowerCase();
  function matches(p: PlaylistSummary) {
    return (
      (filter === "All" || p.category === filter) &&
      (!term || p.name.toLowerCase().includes(term))
    );
  }

  async function play(playlist: PlaylistSummary) {
    // Clicking the row that's already in the player pauses/resumes it.
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

  function row(p: PlaylistSummary) {
    const active = p._id === activePlaylistId;
    return (
      <PlaylistRow
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

  const myVisible = (mine ?? []).filter(matches);
  const filtering = filter !== "All" || term !== "";

  return (
    <>
      <div className="flex flex-col gap-7 w-full pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Playlists</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Curated sets for every part of the day, plus your own.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search playlists"
                aria-label="Search playlists"
                className="w-full rounded-full border border-border bg-secondary py-2 pl-9 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:opacity-90 transition-opacity shrink-0"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              aria-pressed={filter === c}
              className={cn(
                "px-4 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap border transition-colors",
                filter === c
                  ? "bg-primary text-[#04201d] border-primary"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Curated sections */}
        {curated === undefined ? (
          <section>
            <SectionHeading title={SECTIONS[0].title} blurb={SECTIONS[0].blurb} />
            <RowSkeletons count={3} />
          </section>
        ) : (
          SECTIONS.map(({ key, title, blurb }) => {
            const rows = curated.filter((p) => p.section === key && matches(p));
            if (rows.length === 0) return null;
            return (
              <section key={key}>
                <SectionHeading title={title} blurb={blurb} />
                <div className="flex flex-col gap-2">{rows.map(row)}</div>
              </section>
            );
          })
        )}

        {/* The user's own playlists */}
        <section>
          <SectionHeading title="My Playlists" />
          {mine === undefined ? (
            <RowSkeletons count={2} />
          ) : myVisible.length > 0 ? (
            <div className="flex flex-col gap-2">{myVisible.map(row)}</div>
          ) : filtering ? (
            <p className="text-sm text-muted-foreground py-4">No playlists of yours match.</p>
          ) : (
            <div className="flex items-center gap-4 rounded-xl border border-dashed border-border p-5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <ListMusic className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">No playlists yet</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Build your own mix from the catalogue.
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shrink-0"
              >
                <Plus className="w-4 h-4" />
                Create
              </button>
            </div>
          )}
        </section>
      </div>

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
