"use client";

import { useEffect, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@convex/_generated/api";
import type { Energy } from "@convex/lib/energy";
import { DEFAULT_SOUND, FADE_OPTIONS } from "@convex/lib/sound";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BUSINESS_TYPES, GENRES, GUEST_DEMOGRAPHICS, MOODS } from "@/lib/preferences";
import { ENERGY_LABELS } from "@/lib/playlists";
import usePlayerStore from "@/store/usePlayerStore";
import { cn } from "@/lib/utils";

const fieldLabel = "block text-[9px] font-bold uppercase tracking-[0.08em] text-faint mb-2";

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "px-3 py-1.5 touch:py-2.5 rounded-full border text-[11px] touch:text-sm font-semibold transition-colors",
        selected
          ? "bg-primary text-primary-foreground border-primary"
          : "border-primary/20 text-muted-foreground hover:text-foreground hover:border-primary/50",
      )}
    >
      {children}
    </button>
  );
}

const toggle = (list: string[], item: string) =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

/**
 * Settings → Preferences: the venue's music profile (from onboarding, now
 * editable) and how the player behaves. One Save for both cards.
 */
export function PreferencesPanel() {
  const { isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.userProfiles.get, isAuthenticated ? {} : "skip");
  const save = useMutation(api.userProfiles.createOrUpdate);
  const setVolume = usePlayerStore((s) => s.setVolume);

  const [genres, setGenres] = useState<string[]>([]);
  const [mood, setMood] = useState<string | undefined>();
  const [tempo, setTempo] = useState<Energy | undefined>();
  const [businessType, setBusinessType] = useState<string | undefined>();
  const [audience, setAudience] = useState<string[]>([]);
  const [sound, setSound] = useState(DEFAULT_SOUND);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  // Copy the saved profile into the form once it arrives.
  useEffect(() => {
    if (profile === undefined || loaded) return;
    setGenres(profile?.genres ?? []);
    setMood(profile?.mood);
    setTempo(profile?.tempo);
    setBusinessType(profile?.businessType);
    setAudience(profile?.guestDemographics ?? []);
    setSound(profile?.sound ?? DEFAULT_SOUND);
    setLoaded(true);
  }, [profile, loaded]);

  async function handleSave() {
    setStatus("saving");
    setError(null);
    try {
      await save({ genres, mood, tempo, businessType, guestDemographics: audience, sound });
      setVolume(sound.defaultVolume); // apply now, not just next session
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (e) {
      setError(e instanceof ConvexError ? String(e.data) : "Couldn't save your preferences. Please try again.");
      setStatus("idle");
    }
  }

  if (!loaded) {
    return (
      <div className="max-w-[820px] grid gap-3 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="h-80 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-[820px] space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Music profile</CardTitle>
            <CardDescription>Your brand&apos;s sound. Shapes suggestions in search.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className={fieldLabel}>Genres</span>
              <div className="flex flex-wrap gap-1.5">
                {GENRES.map((g) => (
                  <Chip key={g.id} selected={genres.includes(g.id)} onClick={() => setGenres(toggle(genres, g.id))}>
                    {g.name}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <span className={fieldLabel}>Mood</span>
              <div className="flex flex-wrap gap-1.5">
                {MOODS.map((m) => (
                  <Chip key={m.id} selected={mood === m.id} onClick={() => setMood(m.id)}>
                    {m.emoji} {m.name}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <span className={fieldLabel}>Tempo</span>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(ENERGY_LABELS) as Energy[]).map((e) => (
                  <Chip key={e} selected={tempo === e} onClick={() => setTempo(e)}>
                    {ENERGY_LABELS[e]}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <span className={fieldLabel}>Business type</span>
              <div className="flex flex-wrap gap-1.5">
                {BUSINESS_TYPES.map((b) => (
                  <Chip key={b} selected={businessType === b} onClick={() => setBusinessType(b)}>
                    {b}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <span className={fieldLabel}>Target audience</span>
              <div className="flex flex-wrap gap-1.5">
                {GUEST_DEMOGRAPHICS.map((d) => (
                  <Chip key={d} selected={audience.includes(d)} onClick={() => setAudience(toggle(audience, d))}>
                    {d}
                  </Chip>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sound settings</CardTitle>
            <CardDescription>How the player behaves in your venue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label htmlFor="default-volume" className={cn(fieldLabel, "flex justify-between")}>
                Default volume <span className="text-primary font-mono">{sound.defaultVolume}</span>
              </label>
              <input
                id="default-volume"
                type="range"
                min={0}
                max={100}
                value={sound.defaultVolume}
                onChange={(e) => setSound({ ...sound, defaultVolume: Number(e.target.value) })}
                className="w-full accent-primary cursor-pointer"
              />
              <p className="text-[10px] text-faint mt-1">Where the volume starts each time the app opens.</p>
            </div>
            <div>
              <span className={fieldLabel}>Fade between songs</span>
              <div className="flex flex-wrap gap-1.5">
                {FADE_OPTIONS.map((s) => (
                  <Chip key={s} selected={sound.fadeSeconds === s} onClick={() => setSound({ ...sound, fadeSeconds: s })}>
                    {s === 0 ? "Off" : `${s}s`}
                  </Chip>
                ))}
              </div>
              <p className="text-[10px] text-faint mt-1">Eases each song out and the next one in, so changes aren&apos;t abrupt.</p>
            </div>
            <label className="flex items-start justify-between gap-3 cursor-pointer">
              <span>
                <span className="block text-xs font-bold text-foreground">Follow the schedule automatically</span>
                <span className="block text-[10px] text-faint mt-0.5">
                  Switch playlists when a schedule block starts. Off: you change them by hand.
                </span>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={sound.followSchedule}
                onChange={(e) => setSound({ ...sound, followSchedule: e.target.checked })}
                className="mt-0.5 w-9 h-5 accent-primary cursor-pointer shrink-0"
              />
            </label>
          </CardContent>
        </Card>
      </div>

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      <button
        onClick={handleSave}
        disabled={status === "saving"}
        className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Save preferences"}
      </button>
    </div>
  );
}
