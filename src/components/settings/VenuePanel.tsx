"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import posthog from "posthog-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccess } from "@/hooks/useAccess";
import { PLAN_NAME } from "@/lib/billing";
import { cn } from "@/lib/utils";

const posthogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

const fieldLabel = "block text-[9px] font-bold uppercase tracking-[0.08em] text-faint mb-1.5";
const fieldBox =
  "w-full rounded-[7px] border border-primary/20 bg-card px-2.5 py-2 text-xs text-foreground outline-none focus:border-primary transition-colors";

/** Venue hero + editable business name. The "Venue details" settings tab. */
export function VenuePanel() {
  const { user, isLoaded: userLoaded } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.userProfiles.get, isAuthenticated ? {} : "skip");
  const access = useAccess();
  const saveProfile = useMutation(api.userProfiles.createOrUpdate);

  const [venueName, setVenueName] = useState("");
  const [venueNameInitialised, setVenueNameInitialised] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Sync venue name from Convex once loaded
  useEffect(() => {
    if (profile !== undefined && !venueNameInitialised) {
      setVenueName(profile?.venueName ?? "");
      setVenueNameInitialised(true);
    }
  }, [profile, venueNameInitialised]);

  async function handleSaveVenueName() {
    if (!isAuthenticated) return;
    setIsSaving(true);
    try {
      await saveProfile({ venueName: venueName || undefined });
      if (posthogConfigured) {
        posthog.capture("venue_name_updated", { has_venue_name: Boolean(venueName) });
      }
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
    } catch {
      // silently fail for now; a toast system can be wired up later
    } finally {
      setIsSaving(false);
    }
  }

  const userEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const displayName = profile?.venueName || user?.fullName || "Your venue";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const planLabel = !access
    ? "—"
    : access.access.status === "active"
      ? PLAN_NAME
      : access.access.status === "trial"
        ? `Free trial · ${access.daysLeft} ${access.daysLeft === 1 ? "day" : "days"} left`
        : "Trial ended";

  return (
    <div className="max-w-[820px] space-y-3">
      {/* Venue hero */}
      <div className="rounded-xl border border-white/[0.06] p-[22px] shadow-[0_6px_24px_rgba(0,0,0,0.24)] bg-secondary bg-[radial-gradient(circle_at_90%_0%,hsl(var(--primary)/0.13),transparent_35%)]">
        <div className="flex items-center gap-3.5">
          <div className="w-[54px] h-[54px] rounded-xl bg-primary/10 border border-primary/20 text-primary text-base font-black flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[17px] font-extrabold text-foreground truncate">{displayName}</div>
            <div className="text-[11px] text-muted-foreground mt-1 truncate">{userEmail}</div>
          </div>
          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-extrabold shrink-0">
            {planLabel}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Venue details</CardTitle>
          <CardDescription>Business identity and primary contact information.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="venue-name" className={fieldLabel}>
              Business name
            </label>
            {venueNameInitialised ? (
              <div className="flex items-center gap-2">
                <input
                  id="venue-name"
                  type="text"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className={fieldBox}
                />
                <button
                  onClick={handleSaveVenueName}
                  disabled={isSaving}
                  className="shrink-0 px-3 py-2 rounded-[7px] bg-primary text-primary-foreground text-[11px] font-extrabold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSaving ? "Saving…" : savedFeedback ? "Saved" : "Save"}
                </button>
              </div>
            ) : (
              <div className="h-[34px] rounded-[7px] bg-muted animate-pulse" />
            )}
          </div>
          <div>
            <span className={fieldLabel}>Email</span>
            {!userLoaded ? (
              <div className="h-[34px] rounded-[7px] bg-muted animate-pulse" />
            ) : (
              <div className={cn(fieldBox, "text-muted-foreground truncate")}>{userEmail}</div>
            )}
          </div>
          <div>
            <span className={fieldLabel}>Subscription</span>
            <div className={cn(fieldBox, "text-primary font-bold")}>{planLabel}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
