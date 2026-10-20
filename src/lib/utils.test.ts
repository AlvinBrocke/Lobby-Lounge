import { describe, it, expect } from "vitest";
import { cn, fadeGain, formatDuration, formatTotalDuration, timeAgo } from "./utils";

describe("cn", () => {
  it("returns a single class unchanged", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("joins multiple classes", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("ignores falsy values", () => {
    expect(cn("foo", false, null, undefined, "bar")).toBe("foo bar");
  });

  it("merges conflicting Tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles conditional classes via object syntax", () => {
    expect(cn({ "font-bold": true, italic: false })).toBe("font-bold");
  });

  it("returns empty string when no classes given", () => {
    expect(cn()).toBe("");
  });
});

describe("formatDuration", () => {
  it("formats seconds as m:ss", () => {
    expect(formatDuration(262)).toBe("4:22");
    expect(formatDuration(65)).toBe("1:05");
  });

  it("shows a placeholder for missing durations", () => {
    expect(formatDuration(undefined)).toBe("—:——");
    expect(formatDuration(0)).toBe("—:——");
  });
});

describe("formatTotalDuration", () => {
  it("uses minutes under an hour and h/m above", () => {
    expect(formatTotalDuration(0)).toBe("0m");
    expect(formatTotalDuration(58 * 60)).toBe("58m");
    expect(formatTotalDuration(72 * 60)).toBe("1h 12m");
  });
});

describe("fadeGain", () => {
  it("is 1 when fading is off or the duration is unknown", () => {
    expect(fadeGain(0, 200, 0)).toBe(1);
    expect(fadeGain(0, NaN, 6)).toBe(1);
  });
  it("ramps up over the first seconds and down over the last", () => {
    expect(fadeGain(0, 200, 6)).toBe(0);
    expect(fadeGain(3, 200, 6)).toBe(0.5);
    expect(fadeGain(100, 200, 6)).toBe(1);
    expect(fadeGain(197, 200, 6)).toBe(0.5);
    expect(fadeGain(200, 200, 6)).toBe(0);
  });
});

describe("timeAgo", () => {
  const now = new Date(2026, 9, 19, 12, 0).getTime();
  it("says 'just now' under a minute", () => expect(timeAgo(now - 30_000, now)).toBe("just now"));
  it("counts minutes", () => expect(timeAgo(now - 5 * 60_000, now)).toBe("5 min ago"));
  it("counts hours", () => expect(timeAgo(now - 3 * 3_600_000, now)).toBe("3 h ago"));
  it("counts days", () => expect(timeAgo(now - 2 * 86_400_000, now)).toBe("2 d ago"));
});
