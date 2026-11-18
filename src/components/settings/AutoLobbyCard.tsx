"use client";

import { useEffect, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Gauge } from "lucide-react";
import {
  LEVEL_LABELS,
  MAX_BUSY_ORDERS,
  MIN_BASELINE_WEEKS,
  STRENGTHS,
  STRENGTH_LABELS,
  levelFor,
  type Strength,
} from "@convex/lib/autolobby";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNow } from "@/hooks/useNow";
import { cn } from "@/lib/utils";

const fieldLabel = "block text-xs font-bold uppercase tracking-[0.08em] text-faint mb-1.5";
const fieldBox =
  "w-full rounded-[7px] border border-primary/20 bg-card px-2.5 py-2 text-xs text-foreground outline-none focus:border-primary transition-colors disabled:opacity-50";
const primaryButton =
  "inline-flex items-center px-3.5 py-2 touch:py-3 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold hover:opacity-90 transition-opacity disabled:opacity-60";

const STRENGTH_HINTS: Record<Strength, string> = {
  gentle: "Only big rushes and lulls change the music.",
  balanced: "Follows the room without overreacting.",
  strong: "Reacts to smaller changes in the room.",
};

/**
 * Settings → Integrations → AutoLobby: on/off, how strongly to react, an
 * optional peak playlist, and the "busy" order count used until the venue
 * has two weeks of its own history. Shows the live level too.
 */
export function AutoLobbyCard({ posReady }: { posReady: boolean }) {
  const { isAuthenticated } = useConvexAuth();
  const saved = useQuery(api.autolobby.settings, isAuthenticated ? {} : "skip");
  const own = useQuery(api.playlists.listByUser, isAuthenticated ? {} : "skip");
  const curated = useQuery(api.playlists.listCurated, isAuthenticated ? {} : "skip");
  const save = useMutation(api.autolobby.saveSettings);
  const minute = Math.floor(useNow(60_000).getTime() / 60_000) * 60_000;
  const reading = useQuery(api.autolobby.meter, isAuthenticated && posReady ? { now: minute } : "skip");

  const [enabled, setEnabled] = useState(false);
  const [strength, setStrength] = useState<Strength>("balanced");
  const [peak, setPeak] = useState("");
  const [busyOrders, setBusyOrders] = useState("10");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  // Load the saved settings into the form once they arrive.
  useEffect(() => {
    if (!saved) return;
    setEnabled(saved.enabled);
    setStrength(saved.strength);
    setPeak(saved.peakPlaylistId ?? "");
    setBusyOrders(String(saved.busyOrders));
  }, [saved]);

  async function onSave() {
    setSaving(true);
    setNote(null);
    try {
      await save({
        enabled: enabled && posReady,
        strength,
        peakPlaylistId: peak ? (peak as Id<"playlists">) : undefined,
        busyOrders: Number(busyOrders),
      });
      setNote({ ok: true, text: "Saved." });
    } catch (e) {
      setNote({ ok: false, text: e instanceof ConvexError ? String(e.data) : "Couldn't save. Please try again." });
    }
    setSaving(false);
  }

  const learning = reading && (reading.baseline === null || reading.weeks < MIN_BASELINE_WEEKS);
  const live =
    reading && saved
      ? `${LEVEL_LABELS[levelFor(reading, { ...saved, strength, busyOrders: Number(busyOrders) || saved.busyOrders })]} · ${reading.recent} ${reading.recent === 1 ? "order" : "orders"} in the last 15 minutes`
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-primary" />
          AutoLobby
        </CardTitle>
        <CardDescription>
          Lifts the energy when you&apos;re busy and calms it when you&apos;re quiet, based on your POS orders. Changes
          happen between songs, and pause for 30 minutes when staff pick music by hand.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!posReady && (
          <p className="text-xs text-muted-foreground">Connect your POS and choose its location above to use AutoLobby.</p>
        )}

        <label className={cn("flex items-center gap-2.5 text-sm font-bold text-foreground", !posReady && "opacity-50")}>
          <input
            type="checkbox"
            checked={enabled && posReady}
            disabled={!posReady}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-4 h-4 accent-[hsl(var(--primary))]"
          />
          Turn on AutoLobby
        </label>

        {live && (
          <p className="text-xs text-muted-foreground">
            Right now: <span className="font-bold text-foreground">{live}</span>
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="al-strength" className={fieldLabel}>
              How strongly to react
            </label>
            <select
              id="al-strength"
              value={strength}
              onChange={(e) => setStrength(e.target.value as Strength)}
              className={fieldBox}
            >
              {STRENGTHS.map((s) => (
                <option key={s} value={s}>
                  {STRENGTH_LABELS[s]}
                </option>
              ))}
            </select>
            <p className="text-xs text-faint mt-1">{STRENGTH_HINTS[strength]}</p>
          </div>

          <div>
            <label htmlFor="al-peak" className={fieldLabel}>
              Peak playlist (optional)
            </label>
            <select id="al-peak" value={peak} onChange={(e) => setPeak(e.target.value)} className={fieldBox}>
              <option value="">None: keep the scheduled playlist</option>
              {own && own.length > 0 && (
                <optgroup label="Your playlists">
                  {own.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {curated && curated.length > 0 && (
                <optgroup label="Lobby & Lounge playlists">
                  {curated.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <p className="text-xs text-faint mt-1">Takes over during Peak. Your schedule resumes afterwards.</p>
          </div>

          <div>
            <label htmlFor="al-busy" className={fieldLabel}>
              Orders in 15 minutes that mean &quot;busy&quot;
            </label>
            <input
              id="al-busy"
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_BUSY_ORDERS}
              value={busyOrders}
              onChange={(e) => setBusyOrders(e.target.value)}
              className={fieldBox}
            />
            <p className="text-xs text-faint mt-1">
              {learning === false
                ? "AutoLobby now compares with your own usual pattern, so this is only a fallback."
                : "Used for your first two weeks, while AutoLobby learns your usual pattern."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={onSave} disabled={saving || saved === undefined} className={primaryButton}>
            {saving ? "Saving…" : "Save"}
          </button>
          {note && (
            <p role={note.ok ? "status" : "alert"} className={cn("text-xs", note.ok ? "text-primary" : "text-destructive")}>
              {note.text}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
