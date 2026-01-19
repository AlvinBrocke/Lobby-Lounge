import { create } from "zustand";
import { PlayerState } from "@/types";

const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  currentTrack: null,
  volume: 0.5,
  queue: [],

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTrack: (track) => set({ currentTrack: track, isPlaying: true }),
  setVolume: (volume) => set({ volume }),
  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
  clearQueue: () => set({ queue: [] }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
}));

export default usePlayerStore;
