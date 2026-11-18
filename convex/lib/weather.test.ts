import { describe, expect, it } from "vitest";
import {
  MIN_CALL_SPACING_MS,
  REUSE_WITHIN_MS,
  callDelay,
  combine,
  locationKey,
  looksLikePostcode,
  monthKey,
  moodFor,
  parseCurrent,
  parseTargetKey,
  roundCoord,
  targetKey,
  validCoords,
  weatherLabel,
} from "./weather";

describe("location", () => {
  it("rounds to about 1 km and shares a key within that square", () => {
    expect(roundCoord(51.50735)).toBe(51.51);
    expect(locationKey(51.50735, -0.12776)).toBe("51.51,-0.13");
    expect(locationKey(51.5112, -0.1301)).toBe("51.51,-0.13");
    expect(locationKey(40.7, -74)).toBe("40.70,-74.00");
  });

  it("rejects missing, out-of-range and 0,0 coordinates", () => {
    expect(validCoords(51.5, -0.1)).toBe(true);
    expect(validCoords(undefined, -0.1)).toBe(false);
    expect(validCoords(91, 0)).toBe(false);
    expect(validCoords(0, 181)).toBe(false);
    expect(validCoords(0, 0)).toBe(false);
    expect(validCoords(NaN, 1)).toBe(false);
  });

  it("tells a postcode from a town name", () => {
    expect(looksLikePostcode("11211")).toBe(true);
    expect(looksLikePostcode("SW1A 1AA")).toBe(true);
    expect(looksLikePostcode("Brooklyn")).toBe(false);
  });
});

describe("moodFor", () => {
  it("is cosy in rain, drizzle, storms, snow or cold", () => {
    expect(moodFor("Rain", 20)).toBe("cosy");
    expect(moodFor("Snow", -2)).toBe("cosy");
    expect(moodFor("Thunderstorm", 25)).toBe("cosy");
    expect(moodFor("Clouds", 5)).toBe("cosy");
  });

  it("is bright when clear and warm, mild otherwise", () => {
    expect(moodFor("Clear", 22)).toBe("bright");
    expect(moodFor("Clear", 12)).toBe("mild");
    expect(moodFor("Clouds", 22)).toBe("mild");
    expect(moodFor("Mist", 10)).toBe("mild");
  });
});

describe("combine", () => {
  it("lets a busy room override the weather", () => {
    expect(combine("peak", "cosy")).toEqual({ lean: "peak", special: "peak" });
    expect(combine("busy", "cosy")).toEqual({ lean: "busy", special: null });
    expect(combine("busy", "bright")).toEqual({ lean: "busy", special: null });
  });

  it("keeps a quiet room calm, but not sleepy on a bright day", () => {
    expect(combine("quiet", "bright")).toEqual({ lean: "steady", special: null });
    expect(combine("quiet", "mild")).toEqual({ lean: "quiet", special: null });
    expect(combine("quiet", "cosy")).toEqual({ lean: "quiet", special: "rainy" });
  });

  it("lets the weather lead in a steady room, or with no POS", () => {
    for (const room of ["steady", null] as const) {
      expect(combine(room, "bright")).toEqual({ lean: "busy", special: null });
      expect(combine(room, "mild")).toEqual({ lean: "steady", special: null });
      expect(combine(room, "cosy")).toEqual({ lean: "quiet", special: "rainy" });
    }
  });

  it("follows the room alone when there's no weather, and does nothing with neither", () => {
    expect(combine("quiet", null)).toEqual({ lean: "quiet", special: null });
    expect(combine("steady", null)).toEqual({ lean: "steady", special: null });
    expect(combine(null, null)).toBeNull();
  });

  it("round-trips through its key", () => {
    for (const t of [combine("quiet", "cosy")!, combine("peak", null)!, combine(null, "bright")!]) {
      expect(parseTargetKey(targetKey(t))).toEqual(t);
    }
  });
});

describe("parseCurrent", () => {
  it("reads OpenWeather's current weather", () => {
    expect(
      parseCurrent({
        weather: [{ main: "Rain", description: "light rain" }],
        main: { temp: 8.26 },
        sys: { sunrise: 1_763_450_000, sunset: 1_763_484_000 },
      }),
    ).toEqual({ condition: "Rain", description: "light rain", tempC: 8.3, sunrise: 1_763_450_000_000, sunset: 1_763_484_000_000 });
  });

  it("is null without a condition or a temperature", () => {
    expect(parseCurrent({ main: { temp: 10 } })).toBeNull();
    expect(parseCurrent({ weather: [{ main: "Clear" }] })).toBeNull();
    expect(parseCurrent({ weather: [{ main: "Clear" }], main: { temp: 10 } })).toMatchObject({ description: "clear" });
  });

  it("labels a reading for the player bar", () => {
    expect(weatherLabel({ condition: "Rain", tempC: 7.6 })).toBe("Rain, 8°C");
  });
});

describe("callDelay", () => {
  it("spreads a round's calls over the reuse window", () => {
    expect(callDelay(0, 10)).toBe(0);
    expect(callDelay(1, 10)).toBe(Math.floor(REUSE_WITHIN_MS / 10));
  });

  it("never goes faster than the rate limit", () => {
    expect(callDelay(1, 100_000)).toBe(MIN_CALL_SPACING_MS);
    expect(callDelay(1000, 100_000) - callDelay(999, 100_000)).toBe(MIN_CALL_SPACING_MS);
  });
});

describe("monthKey", () => {
  it("buckets by UTC month", () => {
    expect(monthKey(Date.parse("2026-11-30T23:59:59Z"))).toBe("2026-11");
    expect(monthKey(Date.parse("2026-12-01T00:00:00Z"))).toBe("2026-12");
  });
});
