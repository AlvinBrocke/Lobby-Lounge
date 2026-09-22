import { describe, expect, it } from "vitest";
import { activeBlock, blockStatus, formatHour, formatRange, overlaps, todayKey } from "./schedule";

// 2026-09-21 is a Monday; 2026-09-27 is a Sunday.
const mondayAt = (h: number) => new Date(2026, 8, 21, h, 15);
const sundayAt = (h: number) => new Date(2026, 8, 27, h, 15);

describe("todayKey", () => {
  it("maps JS Sunday-first days onto a Monday-first week", () => {
    expect(todayKey(mondayAt(9))).toBe("Mon");
    expect(todayKey(sundayAt(9))).toBe("Sun");
  });
});

describe("formatHour / formatRange", () => {
  it("formats midnight, noon and end of day", () => {
    expect(formatHour(0)).toBe("12 am");
    expect(formatHour(8)).toBe("8 am");
    expect(formatHour(12)).toBe("12 pm");
    expect(formatHour(17)).toBe("5 pm");
    expect(formatHour(24)).toBe("12 am");
    expect(formatRange(22, 2)).toBe("10 pm – 12 am");
  });
});

describe("overlaps", () => {
  it("treats touching blocks as not overlapping", () => {
    const a = { day: "Mon", startHour: 12, duration: 2 };
    expect(overlaps(a, { day: "Mon", startHour: 14, duration: 1 })).toBe(false);
    expect(overlaps(a, { day: "Mon", startHour: 13, duration: 1 })).toBe(true);
    expect(overlaps(a, { day: "Mon", startHour: 10, duration: 5 })).toBe(true);
    expect(overlaps(a, { day: "Tue", startHour: 12, duration: 2 })).toBe(false);
  });
});

describe("activeBlock", () => {
  const blocks = [
    { day: "Mon", startHour: 8, duration: 4 },
    { day: "Mon", startHour: 12, duration: 2 },
    { day: "Sun", startHour: 8, duration: 4 },
  ];

  it("finds the block covering the current hour", () => {
    expect(activeBlock(blocks, mondayAt(11))).toBe(blocks[0]);
    expect(activeBlock(blocks, mondayAt(12))).toBe(blocks[1]);
    expect(activeBlock(blocks, sundayAt(9))).toBe(blocks[2]);
  });

  it("returns null in a gap", () => {
    expect(activeBlock(blocks, mondayAt(14))).toBeNull();
  });
});

describe("blockStatus", () => {
  it("orders days Monday-first so Sunday is the end of the week", () => {
    const sunday = { day: "Sun", startHour: 10, duration: 2 };
    expect(blockStatus(sunday, mondayAt(9))).toBe("upcoming");
    const monday = { day: "Mon", startHour: 10, duration: 2 };
    expect(blockStatus(monday, sundayAt(9))).toBe("done");
  });

  it("classifies blocks on the same day", () => {
    const block = { day: "Mon", startHour: 10, duration: 2 };
    expect(blockStatus(block, mondayAt(9))).toBe("upcoming");
    expect(blockStatus(block, mondayAt(10))).toBe("now");
    expect(blockStatus(block, mondayAt(11))).toBe("now");
    expect(blockStatus(block, mondayAt(12))).toBe("done");
  });
});
