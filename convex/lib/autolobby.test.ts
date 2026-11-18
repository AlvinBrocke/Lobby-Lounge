import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  HOLD_MS,
  WEEK_MS,
  baselineRate,
  baselineWindows,
  changeSummary,
  levelFor,
  pickNextIndex,
  referenceRate,
  stepHold,
  type AutoLobbySettings,
} from "./autolobby";

const balanced: AutoLobbySettings = { ...DEFAULT_SETTINGS, enabled: true, busyOrders: 13 };

describe("levelFor", () => {
  it("compares with the venue's own normal once it has two weeks of history", () => {
    const r = (recent: number) => levelFor({ recent, baseline: 10, weeks: 2 }, balanced);
    expect(r(2)).toBe("quiet");
    expect(r(10)).toBe("steady");
    expect(r(13)).toBe("busy");
    expect(r(20)).toBe("peak");
  });

  it("uses the owner's busy count while it is still learning", () => {
    // 13 busy orders / 1.3 → a normal of 10 per 15 minutes.
    expect(referenceRate({ recent: 0, baseline: 50, weeks: 1 }, balanced)).toBe(10);
    expect(levelFor({ recent: 13, baseline: null, weeks: 0 }, balanced)).toBe("busy");
    expect(levelFor({ recent: 12, baseline: null, weeks: 0 }, balanced)).toBe("steady");
  });

  it("doesn't call two orders a peak at a venue that is normally empty", () => {
    expect(levelFor({ recent: 2, baseline: 0.25, weeks: 4 }, balanced)).toBe("steady");
    expect(levelFor({ recent: 0, baseline: 0.25, weeks: 4 }, balanced)).toBe("quiet");
  });

  it("reacts sooner when strong and later when gentle", () => {
    const reading = { recent: 12, baseline: 10, weeks: 4 };
    expect(levelFor(reading, { ...balanced, strength: "strong" })).toBe("busy");
    expect(levelFor(reading, { ...balanced, strength: "balanced" })).toBe("steady");
    expect(levelFor({ ...reading, recent: 14 }, { ...balanced, strength: "gentle" })).toBe("steady");
  });
});

describe("baseline", () => {
  const now = Date.parse("2026-12-18T20:00:00Z");

  it("uses the same hour in each past week since connecting, up to four", () => {
    expect(baselineWindows(now, now - 10 * WEEK_MS)).toHaveLength(4);
    expect(baselineWindows(now, now - 2.5 * WEEK_MS)).toHaveLength(2);
    expect(baselineWindows(now, now - 3 * 86_400_000)).toHaveLength(0);
    const [w] = baselineWindows(now, 0);
    expect(w).toEqual({ from: now - WEEK_MS - 30 * 60_000, to: now - WEEK_MS + 30 * 60_000 });
  });

  it("turns hour-long counts into a rate per 15 minutes", () => {
    expect(baselineRate([40, 40])).toBe(10);
    expect(baselineRate([])).toBeNull();
  });
});

describe("stepHold", () => {
  const t0 = 1_000_000;

  it("starts at the first reading", () => {
    expect(stepHold(null, "busy", t0).effective).toBe("busy");
  });

  it("changes only after a new level holds for ten minutes", () => {
    let s = stepHold(null, "steady", t0);
    s = stepHold(s, "busy", t0 + 60_000);
    expect(s.effective).toBe("steady");
    s = stepHold(s, "busy", t0 + 60_000 + HOLD_MS - 1);
    expect(s.effective).toBe("steady");
    s = stepHold(s, "busy", t0 + 60_000 + HOLD_MS);
    expect(s.effective).toBe("busy");
  });

  it("restarts the clock when the reading wobbles", () => {
    let s = stepHold(null, "steady", t0);
    s = stepHold(s, "busy", t0 + 60_000);
    s = stepHold(s, "peak", t0 + 5 * 60_000);
    s = stepHold(s, "peak", t0 + 60_000 + HOLD_MS);
    expect(s.effective).toBe("steady");
    s = stepHold(s, "peak", t0 + 5 * 60_000 + HOLD_MS);
    expect(s.effective).toBe("peak");
  });

  it("holds any key, such as the room and weather together", () => {
    let s = stepHold<string>(null, "steady|mild", t0);
    s = stepHold(s, "steady|cosy", t0 + 60_000);
    expect(s.effective).toBe("steady|mild");
    s = stepHold(s, "steady|cosy", t0 + 60_000 + HOLD_MS);
    expect(s.effective).toBe("steady|cosy");
  });

  it("forgets a blip that returns to the current level", () => {
    let s = stepHold(null, "steady", t0);
    s = stepHold(s, "busy", t0 + 60_000);
    s = stepHold(s, "steady", t0 + 2 * 60_000);
    s = stepHold(s, "busy", t0 + 3 * 60_000);
    s = stepHold(s, "busy", t0 + 60_000 + HOLD_MS);
    expect(s.effective).toBe("steady");
  });
});

describe("pickNextIndex", () => {
  const q = [{ energy: "low" }, { energy: "mid" }, { energy: "high" }];

  it("leaves the order alone when steady", () => {
    expect(pickNextIndex(q, "steady", 8)).toBe(0);
  });

  it("prefers high, then mid, when busy", () => {
    expect(pickNextIndex(q, "busy", 8)).toBe(2);
    expect(pickNextIndex(q, "busy", 2)).toBe(1);
  });

  it("prefers low when quiet, and falls back to the head of the queue", () => {
    expect(pickNextIndex(q, "quiet", 8)).toBe(0);
    expect(pickNextIndex([{ energy: "high" }], "quiet", 8)).toBe(0);
    expect(pickNextIndex([{}, {}], "peak", 8)).toBe(0);
  });
});

describe("changeSummary", () => {
  it("reads naturally in the activity log", () => {
    expect(changeSummary("busy")).toBe("AutoLobby: Busy");
    expect(changeSummary("peak", "Friday Peak")).toBe('AutoLobby: Peak, switched to "Friday Peak"');
  });

  it("includes the weather, with or without a POS level", () => {
    expect(changeSummary("quiet", "Rainy Day", "Rain, 8°C")).toBe('AutoLobby: Quiet · Rain, 8°C, switched to "Rainy Day"');
    expect(changeSummary(null, undefined, "Clear, 22°C")).toBe("AutoLobby: Clear, 22°C");
  });
});
