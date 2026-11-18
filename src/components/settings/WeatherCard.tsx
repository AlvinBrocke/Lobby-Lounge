"use client";

import { useState } from "react";
import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@convex/_generated/api";
import { CloudSun } from "lucide-react";
import { STALE_AFTER_MS, roundCoord, weatherLabel } from "@convex/lib/weather";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNow } from "@/hooks/useNow";
import { timeAgo } from "@/lib/pos";
import { cn } from "@/lib/utils";

const primaryButton =
  "inline-flex items-center px-3.5 py-2 touch:py-3 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold hover:opacity-90 transition-opacity disabled:opacity-60";
const secondaryButton =
  "inline-flex items-center px-3.5 py-2 touch:py-3 rounded-lg border border-border text-xs font-bold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60";
const fieldBox =
  "w-full rounded-[7px] border border-primary/20 bg-card px-2.5 py-2 text-xs text-foreground outline-none focus:border-primary transition-colors";

const SOURCE_NOTES = {
  address: "From the town or postcode you entered.",
  device: "From a device's location.",
  square: "From your Square location.",
} as const;

function message(e: unknown, fallback: string) {
  return e instanceof ConvexError ? String(e.data) : fallback;
}

/**
 * Settings → Integrations → Weather (admins only): where the venue is, so
 * AutoLobby can follow the local weather. A town, city or postcode, or this
 * device's location; Square venues get their Square location's position
 * without doing anything. Only an approximate position (~1 km) is kept.
 * Server side: convex/weather.ts.
 */
export function WeatherCard() {
  const { isAuthenticated } = useConvexAuth();
  const status = useQuery(api.weather.status, isAuthenticated ? {} : "skip");
  const fromText = useAction(api.weather.setLocationFromText);
  const fromDevice = useAction(api.weather.setLocationFromDevice);
  const clear = useMutation(api.weather.clearLocation);
  const now = useNow(60_000).getTime();
  const [text, setText] = useState("");
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState<"text" | "device" | "clear" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (status === undefined) return null;

  async function run(kind: "text" | "device" | "clear", fn: () => Promise<unknown>, fallback: string) {
    setPending(kind);
    setError(null);
    try {
      await fn();
      setEditing(false);
      setText("");
    } catch (e) {
      setError(message(e, fallback));
    }
    setPending(null);
  }

  function useDevice() {
    if (!("geolocation" in navigator)) {
      setError("This browser can't share its location. Enter your town or postcode instead.");
      return;
    }
    setPending("device");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        run(
          "device",
          // Rounded here, on the device: the exact position never leaves it.
          () => fromDevice({ lat: roundCoord(pos.coords.latitude), lon: roundCoord(pos.coords.longitude) }),
          "Couldn't save that location. Please try again.",
        ),
      () => {
        setPending(null);
        setError("Location access was blocked. Allow it in the browser, or enter your town or postcode instead.");
      },
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 60 * 60 * 1000 },
    );
  }

  const loc = status.location;
  const r = status.reading;
  const showForm = !loc || editing;
  const current =
    r && now - r.fetchedAt < STALE_AFTER_MS ? `${weatherLabel(r)}, ${r.description} · updated ${timeAgo(r.fetchedAt, now)}` : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-primary" />
          Weather
        </CardTitle>
        <CardDescription>
          Add where your venue is so AutoLobby can follow the local weather. Works with or without a POS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!status.configured ? (
          <p className="text-xs text-muted-foreground">Weather isn&apos;t available yet. Check back soon.</p>
        ) : (
          <>
            {loc && (
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>
                  Location: <span className="font-bold text-foreground">{loc.label ?? "Saved"}</span>
                </p>
                <p className="text-faint">{SOURCE_NOTES[loc.source]}</p>
                {current && <p>Now: {current}</p>}
              </div>
            )}

            {showForm ? (
              <form
                className="space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  run("text", () => fromText({ text }), "Couldn't look that up. Please try again.");
                }}
              >
                <label htmlFor="weather-place" className="block text-xs font-bold uppercase tracking-[0.08em] text-faint">
                  Town, city or postcode
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    id="weather-place"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g. Brooklyn or 11211"
                    maxLength={80}
                    autoComplete="postal-code"
                    className={cn(fieldBox, "flex-1 min-w-[12rem]")}
                  />
                  <button type="submit" disabled={pending !== null || text.trim().length < 2} className={primaryButton}>
                    {pending === "text" ? "Looking up…" : "Save"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={useDevice} disabled={pending !== null} className={secondaryButton}>
                    {pending === "device" ? "Locating…" : "Use this device's location"}
                  </button>
                  {editing && (
                    <button type="button" onClick={() => setEditing(false)} className={secondaryButton}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setEditing(true)} className={secondaryButton}>
                  Change location
                </button>
                {loc.source !== "square" && (
                  <button
                    type="button"
                    disabled={pending !== null}
                    onClick={() => run("clear", () => clear({}), "Couldn't remove it. Please try again.")}
                    className={secondaryButton}
                  >
                    {pending === "clear" ? "Removing…" : "Remove"}
                  </button>
                )}
              </div>
            )}

            {error && (
              <p role="alert" className="text-xs text-destructive">
                {error}
              </p>
            )}
            <p className="text-xs text-faint">
              Your privacy: we only keep your venue&apos;s approximate position (to about 1 km) and the place name, never
              a street address or a device&apos;s exact location. Only that approximate position is shared, with our
              weather provider OpenWeather, to look up local weather every 30 minutes while you&apos;re playing. It&apos;s
              never shown to staff, guests or anyone else, and &quot;Remove&quot; deletes it. Weather data © OpenWeather.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
