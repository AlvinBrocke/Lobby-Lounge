import { describe, it, expect } from "vitest";
import { setupTasks, type SetupInput } from "./tasks";

const base: SetupInput = { scheduleBlockCount: 0, isCurator: false };
const find = (input: SetupInput, key: string) => setupTasks(input).find((t) => t.key === key)!;

describe("setupTasks", () => {
  it("returns five tasks, none done, for a fresh account", () => {
    const t = setupTasks(base);
    expect(t.map((x) => x.key)).toEqual(["subscribe", "venue", "music", "team", "schedule"]);
    expect(t.every((x) => !x.done)).toBe(true);
  });

  it("hides subscribe and team from curators", () => {
    expect(setupTasks({ ...base, isCurator: true }).map((x) => x.key)).toEqual(["venue", "music", "schedule"]);
  });

  it("needs both name and logo for venue", () => {
    expect(find({ ...base, venueName: "Grand" }, "venue").done).toBe(false);
    expect(find({ ...base, venueName: "Grand", logoStorageId: "s1" }, "venue").done).toBe(true);
  });

  it("needs genres and a tempo for music", () => {
    expect(find({ ...base, genres: ["jazz"] }, "music").done).toBe(false);
    expect(find({ ...base, genres: ["jazz"], tempo: "mid" }, "music").done).toBe(true);
  });

  it("counts the owner alone as no team", () => {
    expect(find({ ...base, membersCount: 1 }, "team").done).toBe(false);
    expect(find({ ...base, membersCount: 2 }, "team").done).toBe(true);
  });

  it("marks subscribe done only on basic", () => {
    expect(find({ ...base, plan: "trial" }, "subscribe").done).toBe(false);
    expect(find({ ...base, plan: "basic" }, "subscribe").done).toBe(true);
  });

  it("marks schedule done once a block exists", () => {
    expect(find({ ...base, scheduleBlockCount: 1 }, "schedule").done).toBe(true);
  });
});
