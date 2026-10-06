"use client";

import { useEffect, useRef } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import usePlayerStore from "@/store/usePlayerStore";
import { dueSlot } from "@/lib/announcements";
import { useNow } from "./useNow";

/**
 * Hands each announcement to the player when one of its play times comes up.
 *
 * Like the schedule autoplay, it only acts while music is playing: that's
 * when the venue is open, and browsers refuse to start audio without a user
 * gesture unless the page is already playing. A slot missed while paused is
 * skipped rather than played late.
 */
export function useAnnouncementSchedule() {
  const { isAuthenticated } = useConvexAuth();
  const announcements = useQuery(api.announcements.listByUser, isAuthenticated ? {} : "skip");
  const now = useNow(15_000);
  // Slots already handled this session, so each one plays at most once.
  const handled = useRef(new Set<string>());

  useEffect(() => {
    if (!announcements) return;
    const { isPlaying, queueAnnouncement } = usePlayerStore.getState();

    for (const a of announcements) {
      if (a.paused) continue;
      const slot = dueSlot(a, now);
      if (!slot) continue;
      const key = `${a._id}@${slot}`;
      if (handled.current.has(key)) continue;
      handled.current.add(key);

      if (!isPlaying || (a.source !== "ai" && !a.audioUrl)) continue;
      queueAnnouncement({
        key,
        title: a.title,
        message: a.message,
        audioUrl: a.audioUrl ?? undefined,
        voiceName: a.voiceName,
        pitch: a.pitch,
        speed: a.speed,
        volumeBoost: a.volumeBoost,
        interruptMusic: a.interruptMusic,
      });
    }
  }, [announcements, now]);
}
