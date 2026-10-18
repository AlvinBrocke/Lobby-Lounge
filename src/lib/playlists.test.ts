import { describe, it, expect } from "vitest";
import { CATEGORY_TAGS } from "@convex/lib/energy";
import { suggestedPlaylists } from "./playlists";

const tagsFor = (c: string | undefined) => CATEGORY_TAGS[c ?? ""] ?? [];
const catalogue = ["Energetic", "Productivity", "Upbeat", "Relaxing", "Relaxing", "Elegant", "Upbeat", "Wellness"].map(
  (category, i) => ({ name: `p${i}`, category }),
);
const names = (ps: { name: string }[]) => ps.map((p) => p.name);

describe("suggestedPlaylists", () => {
  it("keeps the catalogue order when the venue skipped onboarding", () => {
    expect(names(suggestedPlaylists(catalogue, { genres: [] }, tagsFor))).toEqual(["p0", "p1", "p2", "p3"]);
  });

  it("puts the chosen mood's categories first", () => {
    const top = suggestedPlaylists(catalogue, { genres: [], mood: "relaxed" }, tagsFor, 3);
    expect(top.map((p) => p.category)).toEqual(["Relaxing", "Relaxing", "Wellness"]);
  });

  it("matches genres to tag prefixes (electronic → electronica)", () => {
    const [first] = suggestedPlaylists(catalogue, { genres: ["electronic"] }, tagsFor, 1);
    expect(first.category).toBe("Energetic");
  });

  it("ranks a mood match above a single genre match", () => {
    const [first] = suggestedPlaylists(catalogue, { genres: ["jazz"], mood: "focused" }, tagsFor, 1);
    expect(first.category).toBe("Productivity");
  });
});
