"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useClerk, useSession, useUser } from "@clerk/nextjs";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { LogOut, Monitor, Shield, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BillingPanel } from "@/components/settings/BillingPanel";
import { PasswordCard } from "@/components/settings/PasswordCard";
import { cn } from "@/lib/utils";
import { useAccess } from "@/hooks/useAccess";
import { PLAN_NAME } from "@/lib/billing";

interface SessionInfo {
  id: string;
  status: string;
  lastActiveAt: Date;
  latestActivity?: {
    browserName?: string;
    deviceType?: string;
    city?: string;
    country?: string;
    isMobile?: boolean;
  };
  revoke(): Promise<unknown>;
}

const TABS = [
  { key: "venue", label: "Venue details" },
  { key: "security", label: "Security" },
  { key: "billing", label: "Plan & billing" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

function relativeTime(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function SettingsPage() {
  const router = useRouter();
  // The tab is in the URL (`?tab=billing`) so the account menu and the old
  // /account route can link straight to it.
  const tabParam = useSearchParams().get("tab");
  const tab: TabKey = TABS.some((t) => t.key === tabParam) ? (tabParam as TabKey) : "venue";
  const { user, isLoaded: userLoaded } = useUser();
  const { session: currentSession } = useSession();
  const { signOut } = useClerk();

  const { isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.userProfiles.get, isAuthenticated ? {} : "skip");
  const access = useAccess();
  const saveProfile = useMutation(api.userProfiles.createOrUpdate);

  const [venueName, setVenueName] = useState("");
  const [venueNameInitialised, setVenueNameInitialised] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const [sessionList, setSessionList] = useState<SessionInfo[]>([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [signingOutAll, setSigningOutAll] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Sync venue name from Convex once loaded
  useEffect(() => {
    if (profile !== undefined && !venueNameInitialised) {
      setVenueName(profile?.venueName ?? "");
      setVenueNameInitialised(true);
    }
  }, [profile, venueNameInitialised]);

  // `getSessions()` is a one-off fetch, not a live subscription, so re-run it
  // whenever the list could have changed: after a revoke, or when the user comes
  // back to this tab (they may have signed in or out on another device meanwhile).
  const loadSessions = useCallback(async () => {
    if (!user) return;
    try {
      setSessionList((await user.getSessions()) as unknown as SessionInfo[]);
    } catch {
      // keep showing the last list we had
    } finally {
      setSessionsLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    void loadSessions();
    const onVisible = () => {
      if (document.visibilityState === "visible") void loadSessions();
    };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loadSessions]);

  async function handleSaveVenueName() {
    if (!isAuthenticated) return;
    setIsSaving(true);
    try {
      await saveProfile({ venueName: venueName || undefined });
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
    } catch {
      // silently fail for now; a toast system can be wired up later
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRevokeSession(sessionId: string) {
    setRevokingId(sessionId);
    setSessionError(null);
    try {
      // Revoking our own session server-side would leave the client believing
      // it's still signed in; signOut() revokes it *and* clears local state.
      if (sessionId === currentSession?.id) {
        await signOut({ sessionId, redirectUrl: "/signin" });
        return;
      }
      const target = sessionList.find((s) => s.id === sessionId);
      await target?.revoke();
      setSessionList((prev) => prev.filter((s) => s.id !== sessionId));
    } catch {
      setSessionError("Couldn't sign out that device. Please try again.");
    } finally {
      void loadSessions();
      setRevokingId(null);
    }
  }

  async function handleSignOutAll() {
    setSigningOutAll(true);
    try {
      // signOut() only ends the session in *this* browser. Every other device
      // has to be revoked explicitly, one session at a time.
      await Promise.allSettled(
        sessionList
          .filter((s) => s.id !== currentSession?.id)
          .map((s) => s.revoke()),
      );
      await signOut({ redirectUrl: "/signin" });
    } catch {
      setSigningOutAll(false);
      setSessionError("Couldn't sign out of every device. Please try again.");
      void loadSessions();
    }
  }

  const userEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const activeSessions = sessionList.filter((s) => s.status === "active");
  const venueNameLoaded = venueNameInitialised;
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

  const fieldLabel = "block text-[9px] font-bold uppercase tracking-[0.08em] text-faint mb-1.5";
  const fieldBox =
    "w-full rounded-[7px] border border-primary/20 bg-card px-2.5 py-2 text-xs text-foreground outline-none focus:border-primary transition-colors";

  return (
    // Negative margins pull the header band edge-to-edge inside the page padding.
    <div className="-mx-5 -mt-[18px] md:-mx-7 md:-mt-6">
      <div className="px-5 md:px-7 pt-5 bg-shell border-b border-primary/[0.08]">
        <h1 className="text-[22px] font-extrabold tracking-tight text-foreground mb-[18px]">Settings</h1>
        <div role="tablist" className="flex gap-0.5 overflow-x-auto scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => router.replace(t.key === "venue" ? "/settings" : `/settings?tab=${t.key}`, { scroll: false })}
              className={cn(
                "relative px-[13px] pt-[9px] pb-[11px] whitespace-nowrap text-[11px] transition-colors",
                tab === t.key ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {tab === t.key && (
                <span className="absolute left-2.5 right-2.5 bottom-0 h-0.5 rounded-sm bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 md:px-7 pt-[22px] pb-8">
        {tab === "venue" && (
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
                  {venueNameLoaded ? (
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
        )}

        {tab === "security" && (
          <div className="max-w-[820px] space-y-3">
            <PasswordCard />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Active sessions
                </CardTitle>
                <CardDescription>
                  Devices signed in to this account. You&apos;ll be signed out after 30 minutes of
                  inactivity while no music is playing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {!sessionsLoaded ? (
                  <div className="space-y-2">
                    {[0, 1].map((i) => (
                      <div key={i} className="h-14 rounded-[10px] bg-muted animate-pulse" />
                    ))}
                  </div>
                ) : activeSessions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No active sessions found.</p>
                ) : (
                  activeSessions.map((s) => {
                    const isCurrent = s.id === currentSession?.id;
                    const activity = s.latestActivity;
                    const deviceLabel = activity?.browserName
                      ? `${activity.browserName}${activity.deviceType ? ` on ${activity.deviceType}` : ""}`
                      : "Unknown device";
                    const location = [activity?.city, activity?.country]
                      .filter(Boolean)
                      .join(", ");

                    return (
                      <div
                        key={s.id}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] border border-white/5 bg-card"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                          {activity?.isMobile ? (
                            <Smartphone className="w-4 h-4" />
                          ) : (
                            <Monitor className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground truncate">
                              {deviceLabel}
                            </span>
                            {isCurrent && (
                              <span className="text-[8px] font-extrabold tracking-[0.1em] text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                                CURRENT
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {location ? `${location} · ` : ""}
                            Last active: {relativeTime(s.lastActiveAt)}
                          </div>
                        </div>
                        {!isCurrent && (
                          <button
                            onClick={() => handleRevokeSession(s.id)}
                            disabled={revokingId === s.id}
                            title="Sign out this session"
                            aria-label={`Sign out ${deviceLabel}`}
                            className="shrink-0 w-7 h-7 rounded-md border border-primary/20 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                          >
                            <LogOut className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}

                {sessionError && (
                  <p role="alert" className="text-xs text-destructive">
                    {sessionError}
                  </p>
                )}

                {sessionsLoaded && activeSessions.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleSignOutAll}
                    disabled={signingOutAll}
                    className="w-full mt-2 border-primary/20 bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {signingOutAll ? "Signing out…" : "Sign out all devices"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {tab === "billing" && <BillingPanel />}
      </div>
    </div>
  );
}
