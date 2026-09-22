import { describe, it, expect } from "vitest";
import { cn, formatDuration, formatTotalDuration } from "./utils";

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
