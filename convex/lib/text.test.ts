import { describe, it, expect } from "vitest";
import { decodeEntities } from "./text";

describe("decodeEntities", () => {
  it("decodes named and numeric entities", () => {
    expect(decodeEntities("Dada &amp; the Weathermen")).toBe("Dada & the Weathermen");
    expect(decodeEntities("Rock &#39;n&#x27; Roll &quot;Live&quot;")).toBe(`Rock 'n' Roll "Live"`);
  });

  it("decodes only once and leaves unknown or plain text alone", () => {
    expect(decodeEntities("&amp;amp;")).toBe("&amp;");
    expect(decodeEntities("AT&T &bogus; 5 & 6")).toBe("AT&T &bogus; 5 & 6");
  });
});
