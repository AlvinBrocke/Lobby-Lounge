import { describe, expect, it } from "vitest";
import {
  announcementVolume,
  dueSlot,
  formatTiming,
  isLiveToday,
  nextPlay,
  parseTime,
  playMinutes,
  toTimeValue,
  type AnnouncementTiming,
} from "./announcements";

// 2026-10-07 is a Wednesday.
const wed = (h: number, m = 0) => new Date(2026, 9, 7, h, m);

const happyHour: AnnouncementTiming = {
  status: "scheduled",
  days: ["Mon", "Wed", "Fri"],
  occurrence: "multiple",
  startMinute: parseTime("17:00"),
  endMinute: parseTime("19:00"),
  everyMinutes: 30,
};

describe("time values", () => {
  it("round-trips HH:MM", () => {
    expect(parseTime("17:30")).toBe(1050);
    expect(toTimeValue(1050)).toBe("17:30");
    expect(toTimeValue(5)).toBe("00:05");
  });
});

describe("playMinutes", () => {
  it("repeats inside the window, end inclusive", () => {
    expect(playMinutes(happyHour).map(toTimeValue)).toEqual(["17:00", "17:30", "18:00", "18:30", "19:00"]);
  });

  it("plays once at the start time", () => {
    expect(playMinutes({ ...happyHour, occurrence: "once" })).toEqual([1020]);
  });
});

describe("formatTiming", () => {
  it("describes the schedule", () => {
    expect(formatTiming(happyHour)).toBe("Mon, Wed, Fri 17:00–19:00 · Every 30 minutes");
    expect(formatTiming({ ...happyHour, days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], occurrence: "once" })).toBe(
      "Daily 17:00 · Once per day",
    );
    expect(formatTiming({ ...happyHour, status: "draft" })).toBe("Not scheduled");
  });
});

describe("isLiveToday / nextPlay", () => {
  it("is live on its days only", () => {
    expect(isLiveToday(happyHour, wed(9))).toBe(true);
    expect(isLiveToday({ ...happyHour, days: ["Thu"] }, wed(9))).toBe(false);
    expect(isLiveToday({ ...happyHour, status: "draft" }, wed(9))).toBe(false);
  });

  it("finds the next slot today, then later in the week", () => {
    expect(nextPlay(happyHour, wed(17, 10))).toEqual({ day: "Wed", minute: 1050, today: true });
    expect(nextPlay(happyHour, wed(20))).toEqual({ day: "Fri", minute: 1020, today: false });
  });

  it("wraps round to the same weekday next week", () => {
    expect(nextPlay({ ...happyHour, days: ["Wed"] }, wed(20))).toEqual({ day: "Wed", minute: 1020, today: false });
  });
});

describe("dueSlot", () => {
  it("is due at a play time and for a short grace period", () => {
    expect(dueSlot(happyHour, wed(17, 30))).toBe("2026-10-7@1050");
    expect(dueSlot(happyHour, wed(17, 31))).toBe("2026-10-7@1050");
    expect(dueSlot(happyHour, wed(17, 32))).toBeNull();
  });

  it("is never due on other days", () => {
    expect(dueSlot({ ...happyHour, days: ["Thu"] }, wed(17, 30))).toBeNull();
  });
});

describe("announcementVolume", () => {
  it("boosts relative to the music and caps at full volume", () => {
    expect(announcementVolume(50, 0)).toBe(0.5);
    expect(announcementVolume(50, 6)).toBeCloseTo(0.998, 2);
    expect(announcementVolume(90, 6)).toBe(1);
  });
});
