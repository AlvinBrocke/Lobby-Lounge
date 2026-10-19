"use client";

import type { api } from "@convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { PlaylistCover } from "@/components/playlists/PlaylistCover";
import type { DragPayload } from "@/lib/schedule";

type PlaylistSummary = FunctionReturnType<typeof api.playlists.listCurated>[number];

/** Playlists to drag onto the schedule grid. */
export function PlaylistTray({
  curated,
  mine,
  onDragStart,
  onDragEnd,
}: {
  curated: PlaylistSummary[];
  mine: PlaylistSummary[];
  onDragStart: (payload: DragPayload) => void;
  onDragEnd: () => void;
}) {
  const groups = [
    { label: "My playlists", items: mine },
    { label: "Curated", items: curated },
  ].filter((g) => g.items.length > 0);

  return (
    <aside className="hidden lg:flex flex-col bg-secondary border border-white/[0.07] rounded-[14px] p-3 max-h-[calc(100vh-264px)] min-h-[426px]">
      <h2 className="text-xs font-extrabold text-foreground">Available playlists</h2>
      <p className="text-[10px] text-faint mt-0.5 mb-3">Drag one onto any hour.</p>
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-3">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-faint mb-1.5">{g.label}</div>
            <div className="flex flex-col gap-1">
              {g.items.map((p) => (
                <div
                  key={p._id}
                  draggable
                  onDragStart={(e) => {
                    const payload: DragPayload = { kind: "playlist", playlistId: p._id };
                    e.dataTransfer.setData("application/x-ll-schedule", JSON.stringify(payload));
                    e.dataTransfer.effectAllowed = "copy";
                    onDragStart(payload);
                  }}
                  onDragEnd={onDragEnd}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing hover:bg-primary/5 transition-colors"
                >
                  <PlaylistCover src={p.coverImage} alt="" className="w-7 h-7 rounded shrink-0" iconClassName="w-3 h-3" />
                  <span className="text-[11px] font-semibold text-foreground truncate">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
