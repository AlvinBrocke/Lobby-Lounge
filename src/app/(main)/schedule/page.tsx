"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { CalendarClock, Clock, Plus } from "lucide-react";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { PageWrapper } from "@/components/layout/page-wrapper";
import {
  ScheduleBlockModal,
  type ScheduleBlockValues,
} from "@/components/schedule/ScheduleBlockModal";
import { useNow } from "@/hooks/useNow";
import { cn } from "@/lib/utils";
import {
  DAYS,
  activeBlock,
  formatHour,
  formatRange,
  todayKey,
  type Day,
} from "@/lib/schedule";

const ROW_HEIGHT = 64; // px per hour
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const SCROLL_TO_HOUR = 7; // most venues open in the morning

// Colour is picked from the channel's category so the same kind of music
// always looks the same across the week.
const PALETTE = [
  "bg-blue-500/10 text-blue-500 border-blue-500/40",
  "bg-amber-500/10 text-amber-500 border-amber-500/40",
  "bg-purple-500/10 text-purple-500 border-purple-500/40",
  "bg-rose-500/10 text-rose-500 border-rose-500/40",
  "bg-emerald-500/10 text-emerald-500 border-emerald-500/40",
  "bg-cyan-500/10 text-cyan-500 border-cyan-500/40",
];

function colourFor(key: string): string {
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

type ModalState =
  | { mode: "create"; day: Day; startHour: number }
  | { mode: "edit"; block: Doc<"scheduleBlocks"> }
  | null;

export default function SchedulePage() {
  const { isAuthenticated } = useConvexAuth();
  const now = useNow(60_000);
  const today = todayKey(now);

  // "skip" until Clerk's token reaches Convex — otherwise `requireUser` throws.
  const blocks = useQuery(api.scheduleBlocks.listByUser, isAuthenticated ? {} : "skip");
  const channels = useQuery(api.channels.list);
  const createBlock = useMutation(api.scheduleBlocks.create);
  const updateBlock = useMutation(api.scheduleBlocks.update);
  const removeBlock = useMutation(api.scheduleBlocks.remove);

  const [modal, setModal] = useState<ModalState>(null);

  const channelById = useMemo(
    () => new Map((channels ?? []).map((c) => [c._id, c])),
    [channels],
  );
  const current = blocks ? activeBlock(blocks, now) : null;

  // Start the grid scrolled to the morning instead of midnight.
  // Runs again once data arrives, because the loading state can be shorter.
  const scrollRef = useRef<HTMLDivElement>(null);
  const loading = blocks === undefined || channels === undefined;
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = SCROLL_TO_HOUR * ROW_HEIGHT;
  }, [loading]);

  function blockLabel(block: Doc<"scheduleBlocks">) {
    return block.title ?? channelById.get(block.channelId)?.name ?? "Untitled";
  }

  /** First free hour today from now on, so "New Block" opens on a usable slot. */
  function openNewBlock() {
    const taken = new Set(
      (blocks ?? [])
        .filter((b) => b.day === today)
        .flatMap((b) => Array.from({ length: b.duration }, (_, i) => b.startHour + i)),
    );
    const free = HOURS.find((h) => h >= now.getHours() && !taken.has(h));
    setModal({ mode: "create", day: today, startHour: free ?? 9 });
  }

  async function handleSubmit(values: ScheduleBlockValues) {
    if (modal?.mode === "edit") {
      // An empty title is sent as "" (not omitted) so the server clears it.
      await updateBlock({ id: modal.block._id, ...values });
    } else {
      await createBlock({ ...values, title: values.title || undefined });
    }
    setModal(null);
  }

  async function handleDelete(id: Id<"scheduleBlocks">) {
    await removeBlock({ id });
    setModal(null);
  }

  return (
    <PageWrapper
      title="Schedule"
      description="Set a channel for every hour of the week — it repeats automatically."
      action={
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1.5 text-xs text-muted-foreground">
            {current ? (
              <>
                <span className="w-2 h-2 rounded-full bg-primary live-dot" />
                On now:{" "}
                <span className="font-semibold text-foreground">{blockLabel(current)}</span>
              </>
            ) : (
              <>
                <CalendarClock className="w-3.5 h-3.5" />
                Nothing scheduled right now
              </>
            )}
          </div>
          <button
            onClick={openNewBlock}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
            New Block
          </button>
        </div>
      }
    >
      <Card className="bg-card border-border shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div ref={scrollRef} className="max-h-[calc(100vh-280px)] min-h-[400px] overflow-y-auto">
            {/* Day headers */}
            <div className="grid grid-cols-[72px_1fr] border-b border-border sticky top-0 bg-card z-30">
              <div className="p-4 border-r border-border flex items-center justify-center">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="grid grid-cols-7">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className={cn(
                      "p-4 text-center font-bold border-r border-border last:border-r-0 text-xs tracking-widest uppercase",
                      day === today ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Hour rows — empty cells open the create modal */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="grid grid-cols-[72px_1fr] border-b border-border last:border-b-0"
                  style={{ height: ROW_HEIGHT }}
                >
                  <div className="text-[11px] text-muted-foreground pr-3 font-mono font-bold flex items-start justify-end pt-1.5 uppercase tracking-tighter">
                    {formatHour(hour)}
                  </div>
                  <div className="grid grid-cols-7">
                    {DAYS.map((day) => (
                      <button
                        key={`${day}-${hour}`}
                        type="button"
                        disabled={loading}
                        aria-label={`Add block on ${day} at ${formatHour(hour)}`}
                        onClick={() => setModal({ mode: "create", day, startHour: hour })}
                        className={cn(
                          "border-r border-border last:border-r-0 hover:bg-muted/30 transition-colors group/cell relative",
                          day === today && "bg-primary/[0.03]",
                        )}
                      >
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity">
                          <Plus className="w-4 h-4 text-muted-foreground/50" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Blocks, absolutely positioned over the grid */}
              <div className="absolute top-0 left-[72px] right-0 bottom-0 pointer-events-none">
                <div className="grid grid-cols-7 h-full">
                  {DAYS.map((day) => (
                    <div key={`blocks-${day}`} className="relative h-full">
                      {day === today && (
                        <div
                          className="absolute left-0 right-0 h-0.5 bg-primary z-20"
                          style={{ top: (now.getHours() + now.getMinutes() / 60) * ROW_HEIGHT }}
                        >
                          <span className="absolute -left-1 -top-[3px] w-2 h-2 rounded-full bg-primary" />
                        </div>
                      )}
                      {(blocks ?? [])
                        .filter((b) => b.day === day)
                        .map((block) => {
                          const channel = channelById.get(block.channelId);
                          const isNow = current?._id === block._id;
                          const compact = block.duration === 1;
                          return (
                            <button
                              key={block._id}
                              type="button"
                              onClick={() => setModal({ mode: "edit", block })}
                              className={cn(
                                "absolute left-1 right-1 rounded-xl border border-l-4 bg-card pointer-events-auto text-left text-xs font-bold overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 z-10",
                                compact ? "px-2 py-1" : "p-2.5",
                                colourFor(channel?.category ?? channel?.name ?? ""),
                                isNow && "ring-2 ring-primary/50",
                              )}
                              style={{
                                top: block.startHour * ROW_HEIGHT + 3,
                                height: block.duration * ROW_HEIGHT - 6,
                              }}
                            >
                              <div className="flex items-center gap-1.5">
                                {isNow && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary live-dot shrink-0" />
                                )}
                                <span className="truncate text-[13px] tracking-tight">
                                  {blockLabel(block)}
                                </span>
                              </div>
                              <div className="flex items-center opacity-70 font-medium mt-0.5 truncate">
                                {!compact && <Clock className="w-3 h-3 mr-1 shrink-0" />}
                                {formatRange(block.startHour, block.duration)}
                              </div>
                              {!compact && block.title && channel && (
                                <div className="opacity-60 font-medium mt-0.5 truncate">
                                  {channel.name}
                                </div>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {blocks?.length === 0 && (
        <p className="text-sm text-muted-foreground text-center mt-4">
          No blocks yet — click any hour in the grid to schedule a channel. It will repeat every
          week.
        </p>
      )}

      {modal && channels && blocks && (
        <ScheduleBlockModal
          mode={modal.mode}
          initial={
            modal.mode === "edit"
              ? {
                  channelId: modal.block.channelId,
                  day: modal.block.day as Day,
                  startHour: modal.block.startHour,
                  duration: modal.block.duration,
                  title: modal.block.title,
                }
              : { day: modal.day, startHour: modal.startHour }
          }
          editingId={modal.mode === "edit" ? modal.block._id : undefined}
          channels={channels}
          blocks={blocks}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          onDelete={modal.mode === "edit" ? () => handleDelete(modal.block._id) : undefined}
        />
      )}
    </PageWrapper>
  );
}
