import { describe, expect, it } from "vitest";
import { squareHealthLine, timeAgo } from "./pos";

const NOW = Date.parse("2026-11-18T21:00:00Z");
const base = { status: "connected" as const, locationName: "Main Street", lastOrderAt: null, needsAttention: false };

describe("timeAgo", () => {
  it("rounds to the largest sensible unit", () => {
    expect(timeAgo(NOW - 20_000, NOW)).toBe("just now");
    expect(timeAgo(NOW - 60_000, NOW)).toBe("1 minute ago");
    expect(timeAgo(NOW - 4 * 60_000, NOW)).toBe("4 minutes ago");
    expect(timeAgo(NOW - 3 * 3_600_000, NOW)).toBe("3 hours ago");
    expect(timeAgo(NOW - 2 * 86_400_000, NOW)).toBe("2 days ago");
  });
});

describe("squareHealthLine", () => {
  it("names the location and the last order", () => {
    expect(squareHealthLine({ ...base, lastOrderAt: NOW - 4 * 60_000 }, NOW)).toBe(
      "Connected to Square · Main Street. Last order received 4 minutes ago.",
    );
  });

  it("says when no orders have arrived yet", () => {
    expect(squareHealthLine(base, NOW)).toMatch(/No orders received yet\.$/);
  });

  it("asks for a location when none is picked", () => {
    expect(squareHealthLine({ ...base, locationName: null }, NOW)).toMatch(/Choose the location/);
  });

  it("asks to reconnect when access was removed or renewal failed", () => {
    expect(squareHealthLine({ ...base, status: "revoked" }, NOW)).toMatch(/Reconnect/);
    expect(squareHealthLine({ ...base, needsAttention: true }, NOW)).toMatch(/Reconnect/);
  });
});
