import { create } from "zustand";
import { PlayerState } from "@/types";

const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  currentTrack: null,
  volume: 50,
  queue: [],

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTrack: (track) => set({ currentTrack: track, isPlaying: true }),
  setVolume: (volume) => set({ volume }),
  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
  clearQueue: () => set({ queue: [] }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  nextTrack: () =>
    set((state) => {
      if (state.queue.length === 0) return { isPlaying: false, currentTrack: null };
      const [next, ...rest] = state.queue;
      return { currentTrack: next, queue: rest, isPlaying: true };
    }),

  previousTrack: () => {
    // No-op for now: restarts the current track by toggling isPlaying.
    // The audio element in PlayerBar handles seeking to 0 on track load.
  },
}));

export default usePlayerStore;
