import { describe, it, expect, beforeEach } from "vitest";
import usePlayerStore from "./usePlayerStore";
import type { Track } from "@/types";

const track1: Track = { id: "1", name: "Blue Bossa", image: "" };
const track2: Track = { id: "2", name: "Autumn Leaves", image: "" };
const track3: Track = { id: "3", name: "So What", image: "" };

// Reset store state between tests so they don't bleed into each other
beforeEach(() => {
  usePlayerStore.setState({
    isPlaying: false,
    currentTrack: null,
    volume: 50,
    queue: [],
  });
});

describe("setCurrentTrack", () => {
  it("sets the track and starts playback", () => {
    usePlayerStore.getState().setCurrentTrack(track1);
    const { currentTrack, isPlaying } = usePlayerStore.getState();
    expect(currentTrack).toEqual(track1);
    expect(isPlaying).toBe(true);
  });
});

describe("togglePlay", () => {
  it("flips isPlaying from false to true", () => {
    usePlayerStore.getState().togglePlay();
    expect(usePlayerStore.getState().isPlaying).toBe(true);
  });

  it("flips isPlaying from true to false", () => {
    usePlayerStore.setState({ isPlaying: true });
    usePlayerStore.getState().togglePlay();
    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });
});

describe("setVolume", () => {
  it("updates the volume", () => {
    usePlayerStore.getState().setVolume(80);
    expect(usePlayerStore.getState().volume).toBe(80);
  });
});

describe("queue management", () => {
  it("addToQueue appends a track", () => {
    usePlayerStore.getState().addToQueue(track1);
    usePlayerStore.getState().addToQueue(track2);
    expect(usePlayerStore.getState().queue).toEqual([track1, track2]);
  });

  it("clearQueue empties the queue", () => {
    usePlayerStore.setState({ queue: [track1, track2] });
    usePlayerStore.getState().clearQueue();
    expect(usePlayerStore.getState().queue).toHaveLength(0);
  });
});

describe("nextTrack", () => {
  it("advances to the first queued track and removes it from the queue", () => {
    usePlayerStore.setState({
      currentTrack: track1,
      queue: [track2, track3],
      isPlaying: true,
    });
    usePlayerStore.getState().nextTrack();
    const { currentTrack, queue, isPlaying } = usePlayerStore.getState();
    expect(currentTrack).toEqual(track2);
    expect(queue).toEqual([track3]);
    expect(isPlaying).toBe(true);
  });

  it("stops playback and clears currentTrack when queue is empty", () => {
    usePlayerStore.setState({ currentTrack: track1, queue: [], isPlaying: true });
    usePlayerStore.getState().nextTrack();
    const { currentTrack, isPlaying } = usePlayerStore.getState();
    expect(currentTrack).toBeNull();
    expect(isPlaying).toBe(false);
  });

  it("plays through a full queue in order", () => {
    usePlayerStore.setState({ currentTrack: null, queue: [track1, track2, track3] });
    usePlayerStore.getState().nextTrack();
    expect(usePlayerStore.getState().currentTrack).toEqual(track1);
    usePlayerStore.getState().nextTrack();
    expect(usePlayerStore.getState().currentTrack).toEqual(track2);
    usePlayerStore.getState().nextTrack();
    expect(usePlayerStore.getState().currentTrack).toEqual(track3);
    usePlayerStore.getState().nextTrack();
    expect(usePlayerStore.getState().currentTrack).toBeNull();
  });
});
