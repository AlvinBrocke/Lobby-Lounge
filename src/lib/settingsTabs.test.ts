import { describe, it, expect } from "vitest";
import { visibleTabs } from "./settingsTabs";

describe("visibleTabs", () => {
  it("hides admin tabs from curators", () => {
    const keys = visibleTabs(true).map((t) => t.key);
    expect(keys).not.toContain("billing");
    expect(keys).not.toContain("staff");
  });

  it("lists each tab once", () => {
    const keys = visibleTabs(false).map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
