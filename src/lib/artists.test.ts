import { describe, it, expect } from "vitest";
import { artistFromParam, artistHref } from "./artists";

describe("artistHref", () => {
  it.each(["AC/DC", "Simon & Garfunkel", "Sigur Rós", "Two Words", "100%"])("round-trips %s", (name) => {
    const href = artistHref(name);
    expect(href.startsWith("/artists/")).toBe(true);
    expect(artistFromParam(href.slice("/artists/".length))).toBe(name);
  });
});
