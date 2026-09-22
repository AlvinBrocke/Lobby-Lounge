"use client";

import { useState } from "react";
import { ConvexError } from "convex/values";
import { Trash2 } from "lucide-react";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { Modal, primaryButton, secondaryButton } from "@/components/playlists/Modal";
import { ConfirmDialog } from "@/components/playlists/ConfirmDialog";
import { DAYS, MAX_TITLE, formatHour, overlaps, type Day } from "@/lib/schedule";

export interface ScheduleBlockValues {
  channelId: Id<"channels">;
  day: Day;
  startHour: number;
  duration: number;
  title: string;
}

interface ScheduleBlockModalProps {
  mode: "create" | "edit";
  initial: Partial<ScheduleBlockValues> & { day: Day; startHour: number };
  /** The block being edited — excluded from the overlap check. */
  editingId?: Id<"scheduleBlocks">;
  channels: Doc<"channels">[];
  blocks: Doc<"scheduleBlocks">[];
  onClose: () => void;
  onSubmit: (values: ScheduleBlockValues) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const fieldClass =
  "w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition";

const labelClass =
  "text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function ScheduleBlockModal({
  mode,
  initial,
  editingId,
  channels,
  blocks,
  onClose,
  onSubmit,
  onDelete,
}: ScheduleBlockModalProps) {
  const [channelId, setChannelId] = useState<Id<"channels"> | "">(
    initial.channelId ?? channels[0]?._id ?? "",
  );
  const [day, setDay] = useState<Day>(initial.day);
  const [startHour, setStartHour] = useState(initial.startHour);
  const [endHour, setEndHour] = useState(
    Math.min(initial.startHour + (initial.duration ?? 2), 24),
  );
  const [title, setTitle] = useState(initial.title ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const duration = endHour - startHour;
  const clash = blocks.find(
    (b) => b._id !== editingId && overlaps(b, { day, startHour, duration }),
  );
  const selectedChannel = channels.find((c) => c._id === channelId);
  const canSubmit = channelId !== "" && duration >= 1 && !clash && !saving;

  function handleStartChange(h: number) {
    setStartHour(h);
    // Keep the block's length when moving the start, clamped to midnight.
    setEndHour(Math.min(h + Math.max(duration, 1), 24));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || channelId === "") return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ channelId, day, startHour, duration, title: title.trim() });
    } catch (err) {
      // ConvexError messages are written for users; anything else is not.
      setError(
        err instanceof ConvexError
          ? String(err.data)
          : "Couldn't save the block. Please try again.",
      );
      setSaving(false);
    }
  }

  if (confirmDelete && onDelete) {
    return (
      <ConfirmDialog
        title="Delete block?"
        message={
          <>
            <span className="font-semibold text-foreground">
              {title.trim() || selectedChannel?.name || "This block"}
            </span>{" "}
            will be removed from every {day}.
          </>
        }
        confirmLabel="Delete"
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDelete}
      />
    );
  }

  return (
    <Modal
      title={mode === "create" ? "New Block" : "Edit Block"}
      onClose={onClose}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="block-channel" className={labelClass}>
            Channel
          </label>
          {channels.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No channels available yet — add channels before scheduling.
            </p>
          ) : (
            <div className="flex items-center gap-3">
              {selectedChannel?.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedChannel.coverImage}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
              )}
              <select
                id="block-channel"
                autoFocus
                value={channelId}
                onChange={(e) => setChannelId(e.target.value as Id<"channels">)}
                className={fieldClass}
              >
                {channels.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                    {c.category ? ` · ${c.category}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="block-day" className={labelClass}>
              Day
            </label>
            <select
              id="block-day"
              value={day}
              onChange={(e) => setDay(e.target.value as Day)}
              className={fieldClass}
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="block-start" className={labelClass}>
              Start
            </label>
            <select
              id="block-start"
              value={startHour}
              onChange={(e) => handleStartChange(Number(e.target.value))}
              className={fieldClass}
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="block-end" className={labelClass}>
              End
            </label>
            <select
              id="block-end"
              value={endHour}
              onChange={(e) => setEndHour(Number(e.target.value))}
              className={fieldClass}
            >
              {HOURS.filter((h) => h + 1 > startHour).map((h) => (
                <option key={h + 1} value={h + 1}>
                  {formatHour(h + 1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="block-title" className={labelClass}>
            Title <span className="normal-case tracking-normal font-normal">(optional)</span>
          </label>
          <input
            id="block-title"
            type="text"
            maxLength={MAX_TITLE}
            placeholder={selectedChannel?.name ?? "e.g. Breakfast Chill"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldClass}
          />
        </div>

        {clash && (
          <p className="text-xs text-destructive">
            Overlaps &ldquo;{clash.title ?? "another block"}&rdquo; ({formatHour(clash.startHour)}–
            {formatHour(clash.startHour + clash.duration)}) on {clash.day}.
          </p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex gap-3 pt-1">
          {mode === "edit" && onDelete && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete block"
              className="px-3 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button type="button" onClick={onClose} className={secondaryButton}>
            Cancel
          </button>
          <button type="submit" disabled={!canSubmit} className={primaryButton}>
            {saving ? "Saving…" : mode === "create" ? "Add Block" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
