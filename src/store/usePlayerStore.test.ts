import { describe, it, expect, beforeEach } from "vitest";
import usePlayerStore, { shuffle } from "./usePlayerStore";
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
    activePlaylistId: null,
    playlistTracks: [],
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

  it("stops playback and clears currentTrack when the queue is empty and no playlist is active", () => {
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

describe("playlist looping", () => {
  it("refills the queue from the playlist instead of going silent", () => {
    usePlayerStore.getState().playQueue([track1, track2, track3], "pl_1", 0);
    usePlayerStore.getState().nextTrack(); // track2
    usePlayerStore.getState().nextTrack(); // track3 — queue now empty
    usePlayerStore.getState().nextTrack(); // new pass
    const { currentTrack, queue, isPlaying } = usePlayerStore.getState();
    expect(isPlaying).toBe(true);
    expect(currentTrack).not.toBeNull();
    expect(queue).toHaveLength(2);
    // Each pass plays every track exactly once.
    const pass = [currentTrack, ...queue].map((t) => t.id).sort();
    expect(pass).toEqual(["1", "2", "3"]);
  });

  it("never opens a new pass with the track that just finished", () => {
    for (let i = 0; i < 50; i++) {
      usePlayerStore.getState().playQueue([track1, track2], "pl_1", 0);
      usePlayerStore.getState().nextTrack(); // track2, queue empty
      usePlayerStore.getState().nextTrack(); // new pass
      expect(usePlayerStore.getState().currentTrack.id).toBe("1");
    }
  });

  it("replays a one-track playlist as a new track object", () => {
    usePlayerStore.getState().playQueue([track1], "pl_1");
    const before = usePlayerStore.getState().currentTrack;
    usePlayerStore.getState().nextTrack();
    const after = usePlayerStore.getState().currentTrack;
    expect(after).toEqual(track1);
    expect(after).not.toBe(before); // so the player's effect reloads it
  });

  it("plays manually queued tracks before starting a new pass", () => {
    usePlayerStore.getState().playQueue([track1], "pl_1");
    usePlayerStore.getState().addToQueue(track3);
    usePlayerStore.getState().nextTrack();
    expect(usePlayerStore.getState().currentTrack).toEqual(track3);
  });

  it("stops looping once a single track is picked by hand", () => {
    usePlayerStore.getState().playQueue([track1], "pl_1");
    usePlayerStore.getState().setCurrentTrack(track3);
    usePlayerStore.getState().nextTrack();
    expect(usePlayerStore.getState().currentTrack).toBeNull();
  });
});

describe("shuffle", () => {
  it("keeps every item exactly once and doesn't mutate the input", () => {
    const input = [1, 2, 3, 4, 5, 6];
    const out = shuffle(input);
    expect([...out].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("doesn't always start with the same item", () => {
    const firsts = new Set(Array.from({ length: 100 }, () => shuffle([1, 2, 3, 4])[0]));
    expect(firsts.size).toBeGreaterThan(1);
  });
});

describe("playQueue", () => {
  it("from a start index, plays that track then the rest in order", () => {
    usePlayerStore.getState().addToQueue(track3);
    usePlayerStore.getState().playQueue([track1, track2, track3], "pl_1", 1);
    const { currentTrack, queue, isPlaying, activePlaylistId } = usePlayerStore.getState();
    expect(currentTrack).toEqual(track2);
    expect(queue).toEqual([track3]); // replaces, doesn't append to, the old queue
    expect(isPlaying).toBe(true);
    expect(activePlaylistId).toBe("pl_1");
  });

  it("without a start index, shuffles the whole playlist", () => {
    usePlayerStore.getState().playQueue([track1, track2, track3], "pl_1");
    const { currentTrack, queue } = usePlayerStore.getState();
    expect([currentTrack, ...queue].map((t) => t.id).sort()).toEqual(["1", "2", "3"]);
  });

  it("does nothing for an empty list", () => {
    usePlayerStore.getState().setCurrentTrack(track1);
    usePlayerStore.getState().playQueue([], "pl_1");
    expect(usePlayerStore.getState().currentTrack).toEqual(track1);
    expect(usePlayerStore.getState().activePlaylistId).toBeNull();
  });

  it("a single hand-picked track clears the active playlist", () => {
    usePlayerStore.getState().playQueue([track1], "pl_1");
    usePlayerStore.getState().setCurrentTrack(track2);
    expect(usePlayerStore.getState().activePlaylistId).toBeNull();
  });
});
