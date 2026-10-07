"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import usePlayerStore from "@/store/usePlayerStore";
import { announcementVolume } from "@/lib/announcements";
import { speak } from "@/lib/speech";

/**
 * Plays the current announcement (an audio file, or the script read aloud by
 * text-to-speech) and shows a banner while it's on air. Music pauses itself
 * in PlayerBar while `announcing` is set.
 */
export function AnnouncementPlayer() {
  const announcing = usePlayerStore((s) => s.announcing);
  const nextUp = usePlayerStore((s) => s.pendingAnnouncements[0]);

  // Announcements that interrupt the music start right away; the rest wait
  // for PlayerBar to reach the end of the current song.
  useEffect(() => {
    if (!announcing && nextUp?.interruptMusic) usePlayerStore.getState().startAnnouncement(false);
  }, [announcing, nextUp]);

  useEffect(() => {
    if (!announcing) return;
    const { cue } = announcing;
    const volume = announcementVolume(usePlayerStore.getState().volume, cue.volumeBoost);
    // Guards against finishing twice: stopping playback can fire end/error events.
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      usePlayerStore.getState().finishAnnouncement();
    };

    if (cue.audioUrl) {
      const audio = new Audio(cue.audioUrl);
      audio.volume = volume;
      audio.onended = finish;
      audio.onerror = finish;
      audio.play().catch(finish);
      return () => {
        settled = true;
        audio.pause();
      };
    }

    const speech = speak(cue.message ?? cue.title, { ...cue, volume });
    speech.done.then(finish);
    return () => {
      settled = true;
      speech.cancel();
    };
  }, [announcing]);

  if (!announcing) return null;
  const { cue, advanceAfter } = announcing;

  return (
    <div
      role="status"
      className="flex items-center gap-3 px-5 py-2.5 shrink-0 border-b border-warning-500/30 bg-gradient-to-r from-warning-500/[0.14] to-warning-500/[0.06]"
    >
      <span className="w-[7px] h-[7px] rounded-full bg-warning-500 shadow-[0_0_6px_theme(colors.warning.500)] shrink-0 animate-pulse" />
      <p className="flex-1 min-w-0 truncate text-[11px]">
        <span className="font-bold text-warning-500 mr-2">Announcement Live</span>
        <span className="text-muted-foreground">{cue.message ?? cue.title}</span>
      </p>
      <span className="hidden sm:block text-[10px] text-faint mr-1 shrink-0">
        {advanceAfter ? "Playing between tracks" : "Music paused"}
      </span>
      <button
        onClick={() => usePlayerStore.getState().finishAnnouncement()}
        aria-label="Stop announcement"
        title="Stop announcement"
        className="text-faint hover:text-muted-foreground transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
