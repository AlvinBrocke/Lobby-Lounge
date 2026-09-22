import { describe, it, expect } from "vitest";
import { parseLastActivity, shouldSignOut } from "./idle";

const MIN = 60 * 1000;

describe("shouldSignOut", () => {
  it("keeps the session before the timeout", () => {
    expect(shouldSignOut(29 * MIN, 0, 30 * MIN, false)).toBe(false);
  });

  it("signs out once the timeout is reached", () => {
    expect(shouldSignOut(30 * MIN, 0, 30 * MIN, false)).toBe(true);
  });

  it("never signs out while music is playing", () => {
    expect(shouldSignOut(10 * 60 * MIN, 0, 30 * MIN, true)).toBe(false);
  });
});

describe("parseLastActivity", () => {
  it("parses a stored timestamp", () => {
    expect(parseLastActivity("1700000000000")).toBe(1700000000000);
  });

  it("treats missing or garbage values as no record", () => {
    expect(parseLastActivity(null)).toBeNull();
    expect(parseLastActivity("")).toBeNull();
    expect(parseLastActivity("abc")).toBeNull();
    expect(parseLastActivity("-5")).toBeNull();
  });
});
