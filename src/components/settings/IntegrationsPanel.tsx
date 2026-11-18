"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAction, useConvexAuth, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@convex/_generated/api";
import { Plug } from "lucide-react";
import { AutoLobbyCard } from "@/components/settings/AutoLobbyCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNow } from "@/hooks/useNow";
import { SQUARE_RETURN_MESSAGES, squareHealthLine } from "@/lib/pos";
import { cn } from "@/lib/utils";

const primaryButton =
  "inline-flex items-center px-3.5 py-2 touch:py-3 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-wait";
const secondaryButton =
  "inline-flex items-center px-3.5 py-2 touch:py-3 rounded-lg border border-border text-xs font-bold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60";
const fieldBox =
  "w-full rounded-[7px] border border-primary/20 bg-card px-2.5 py-2 text-xs text-foreground outline-none focus:border-primary transition-colors";

function message(e: unknown, fallback: string) {
  return e instanceof ConvexError ? String(e.data) : fallback;
}

/**
 * Settings → Integrations (admins only): connect the venue's Square account,
 * pick the location that drives its one zone, and see whether orders are
 * arriving. Server side: convex/square.ts.
 */
export function IntegrationsPanel() {
  const { isAuthenticated } = useConvexAuth();
  const status = useQuery(api.square.status, isAuthenticated ? {} : "skip");
  const returned = SQUARE_RETURN_MESSAGES[useSearchParams().get("square") ?? ""];
  const startConnect = useAction(api.square.startConnect);
  const disconnect = useAction(api.square.disconnect);
  const now = useNow(60_000).getTime();
  const [pending, setPending] = useState<"connect" | "disconnect" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [changingLocation, setChangingLocation] = useState(false);

  async function connect() {
    setPending("connect");
    setError(null);
    try {
      // Leave `pending` set: the page is navigating to Square.
      window.location.assign(await startConnect({}));
    } catch (e) {
      setError(message(e, "Couldn't reach Square. Please try again."));
      setPending(null);
    }
  }

  async function onDisconnect() {
    if (!window.confirm("Disconnect Square? AutoLobby will stop following your orders until you connect again.")) return;
    setPending("disconnect");
    setError(null);
    try {
      await disconnect({});
    } catch (e) {
      setError(message(e, "Couldn't disconnect. Please try again."));
    }
    setPending(null);
  }

  const conn = status?.connection;
  const healthy = conn?.status === "connected" && !conn.needsAttention;
  const pickLocation = healthy && (!conn.locationId || changingLocation);

  return (
    <div className="max-w-[820px] space-y-3">
      {returned && (
        <p
          role="status"
          className={cn(
            "rounded-lg text-xs font-semibold px-3.5 py-2.5",
            returned.tone === "ok" && "bg-primary/10 text-primary",
            returned.tone === "info" && "bg-muted text-muted-foreground",
            returned.tone === "error" && "bg-destructive/15 text-destructive",
          )}
        >
          {returned.text}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="w-4 h-4 text-primary" />
            Custom POS integrations
          </CardTitle>
          <CardDescription>Connect your POS so AutoLobby follows your peak/slow hours.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl border border-foreground/5 bg-card p-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-bold text-foreground flex items-center gap-2">
                  Square
                  {status?.sandbox && (
                    <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">
                      Sandbox
                    </span>
                  )}
                </div>
                {status === undefined ? (
                  <div className="h-4 w-64 mt-1.5 rounded bg-muted animate-pulse" />
                ) : !status.configured ? (
                  <p className="text-xs text-muted-foreground mt-1">Square isn&apos;t available yet. Check back soon.</p>
                ) : conn ? (
                  <p className={cn("text-xs mt-1", healthy ? "text-muted-foreground" : "text-destructive")}>
                    {squareHealthLine(conn, now)}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    Sign in with Square and allow access. It takes about a minute.
                  </p>
                )}
              </div>

              {status?.configured && (
                <div className="flex gap-2 shrink-0">
                  {(!conn || !healthy) && (
                    <button type="button" onClick={connect} disabled={pending !== null} className={primaryButton}>
                      {pending === "connect" ? "Opening Square…" : conn ? "Reconnect" : "Connect with Square"}
                    </button>
                  )}
                  {healthy && conn.locationId && !changingLocation && (
                    <button type="button" onClick={() => setChangingLocation(true)} className={secondaryButton}>
                      Change location
                    </button>
                  )}
                  {conn && (
                    <button type="button" onClick={onDisconnect} disabled={pending !== null} className={secondaryButton}>
                      {pending === "disconnect" ? "Disconnecting…" : "Disconnect"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {pickLocation && (
              <LocationPicker current={conn.locationId} onDone={() => setChangingLocation(false)} />
            )}
          </div>

          {error && (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}

          <p className="text-xs text-faint leading-relaxed">
            Lobby &amp; Lounge can see your Square locations and when orders are placed. It never sees payments,
            tips, items, customers or staff, and it can&apos;t change anything in Square. Order times are kept for 60
            days. Your plan includes one zone, which follows one Square location.
          </p>
        </CardContent>
      </Card>

      {status?.configured && <AutoLobbyCard posReady={!!healthy && !!conn?.locationId} />}
    </div>
  );
}

function LocationPicker({ current, onDone }: { current: string | null; onDone: () => void }) {
  const listLocations = useAction(api.square.listLocations);
  const selectLocation = useAction(api.square.selectLocation);
  const [locations, setLocations] = useState<{ id: string; name: string; address: string }[] | null>(null);
  const [choice, setChoice] = useState(current ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listLocations({})
      .then((list) => {
        if (cancelled) return;
        setLocations(list);
        if (!current && list.length > 0) setChoice(list[0].id);
      })
      .catch((e) => !cancelled && setError(message(e, "Couldn't load your Square locations. Please try again.")));
    return () => {
      cancelled = true;
    };
  }, [listLocations, current]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await selectLocation({ locationId: choice });
      onDone();
    } catch (e) {
      setError(message(e, "Couldn't save the location. Please try again."));
    }
    setSaving(false);
  }

  return (
    <div className="mt-4 pt-4 border-t border-foreground/5">
      <label htmlFor="square-location" className="block text-xs font-bold uppercase tracking-[0.08em] text-faint mb-1.5">
        Square location for your zone
      </label>
      {locations === null && !error ? (
        <div className="h-8 rounded bg-muted animate-pulse" />
      ) : locations && locations.length === 0 ? (
        <p className="text-xs text-muted-foreground">Your Square account has no active locations.</p>
      ) : locations ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <select id="square-location" value={choice} onChange={(e) => setChoice(e.target.value)} className={fieldBox}>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.address ? `${l.name} (${l.address})` : l.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={save} disabled={saving || !choice} className={primaryButton}>
              {saving ? "Saving…" : "Save"}
            </button>
            {current && (
              <button type="button" onClick={onDone} className={secondaryButton}>
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : null}
      {error && (
        <p role="alert" className="text-xs text-destructive mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
