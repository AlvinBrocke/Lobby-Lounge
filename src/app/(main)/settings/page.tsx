"use client";

import React, { useEffect, useState } from "react";
import { useClerk, useSession, useUser } from "@clerk/nextjs";

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
import { LogOut, Monitor, Moon, Shield, Smartphone, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { useTheme } from "@/components/theme-provider";
import { useRouter } from "next/navigation";

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
  const { theme, toggleTheme } = useTheme();
  const { user, isLoaded: userLoaded } = useUser();
  const { session: currentSession } = useSession();
  const { signOut } = useClerk();
  const router = useRouter();

  const [venueName, setVenueName] = useState("");
  const [venueNameLoaded, setVenueNameLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const [sessionList, setSessionList] = useState<SessionInfo[]>([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [signingOutAll, setSigningOutAll] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(({ data }) => {
        setVenueName(data?.venue_name ?? "");
        setVenueNameLoaded(true);
      })
      .catch(() => setVenueNameLoaded(true));
  }, []);

  useEffect(() => {
    if (!user) return;
    user
      .getSessions()
      .then((s) => setSessionList(s as unknown as SessionInfo[]))
      .catch(() => {})
      .finally(() => setSessionsLoaded(true));
  }, [user]);

  async function handleSaveVenueName() {
    setIsSaving(true);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venue_name: venueName }),
      });
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
    try {
      const target = sessionList.find((s) => s.id === sessionId);
      await target?.revoke();
      setSessionList((prev) => prev.filter((s) => s.id !== sessionId));
    } finally {
      setRevokingId(null);
    }
  }

  async function handleSignOutAll() {
    setSigningOutAll(true);
    try {
      await signOut();
      router.push("/signin");
    } catch {
      setSigningOutAll(false);
    }
  }

  const userEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const activeSessions = sessionList.filter((s) => s.status === "active");

  return (
    <PageWrapper
      title="Settings"
      description="Manage your venue and account preferences."
    >
      <div className="max-w-4xl space-y-6 pb-12">

        {/* Appearance */}
        <Card className="bg-card border-border text-card-foreground rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "light" ? (
                <Sun className="w-5 h-5 text-primary" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
              Appearance
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Choose between light and dark mode for the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <button
              onClick={() => theme !== "light" && toggleTheme()}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                theme === "light"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              <Sun className="w-8 h-8 mb-2" />
              <span className="text-sm font-semibold">Light</span>
            </button>
            <button
              onClick={() => theme !== "dark" && toggleTheme()}
              className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                theme === "dark"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              <Moon className="w-8 h-8 mb-2" />
              <span className="text-sm font-semibold">Dark</span>
            </button>
          </CardContent>
        </Card>

        {/* Venue Profile */}
        <Card className="bg-card border-border text-card-foreground shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Venue Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border/50 gap-4">
              <span className="text-muted-foreground shrink-0">Business Name</span>
              <div className="flex items-center gap-2 min-w-0">
                {venueNameLoaded ? (
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="font-semibold text-foreground bg-transparent border border-border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-0 w-48"
                  />
                ) : (
                  <div className="h-7 w-48 rounded-lg bg-muted animate-pulse" />
                )}
                <button
                  onClick={handleSaveVenueName}
                  disabled={isSaving || !venueNameLoaded}
                  className="shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-lg bg-primary text-[#04201d] hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSaving ? "Saving…" : "Save"}
                </button>
                {savedFeedback && (
                  <span className="shrink-0 text-[11px] font-semibold text-primary">
                    Saved!
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <span className="text-muted-foreground">Email</span>
              {!userLoaded ? (
                <div className="h-4 w-44 rounded bg-muted animate-pulse" />
              ) : (
                <span className="font-semibold text-foreground">{userEmail}</span>
              )}
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-muted-foreground">Subscription Plan</span>
              <span className="text-primary font-bold">Premium Business</span>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-card border-border text-card-foreground shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Active sessions across your devices. You&apos;ll be signed out after 30 minutes of
              inactivity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!sessionsLoaded ? (
              <div className="space-y-2">
                {[0, 1].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : activeSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active sessions found.</p>
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
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-secondary/30"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                      {activity?.isMobile ? (
                        <Smartphone className="w-4 h-4" />
                      ) : (
                        <Monitor className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-foreground truncate">
                          {deviceLabel}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-bold tracking-[0.1em] text-primary bg-primary/14 px-2 py-0.5 rounded-full shrink-0">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {location ? `${location} · ` : ""}
                        Last active: {relativeTime(s.lastActiveAt)}
                      </div>
                    </div>
                    {!isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(s.id)}
                        disabled={revokingId === s.id}
                        title="Sign out this session"
                        className="shrink-0 w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-border/50 transition-colors disabled:opacity-50"
                      >
                        <LogOut className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })
            )}

            {sessionsLoaded && activeSessions.length > 0 && (
              <Button
                variant="outline"
                onClick={handleSignOutAll}
                disabled={signingOutAll}
                className="w-full mt-2 border-border text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {signingOutAll ? "Signing out…" : "Sign out all devices"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Plan */}
        <Card className="bg-gradient-to-r from-primary to-primary/80 border-none text-primary-foreground shadow-lg">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-bold">Lobby Lounge Premium</h3>
              <p className="opacity-90 max-w-md">
                Full B2B licensing, offline mode, and unlimited zones.
              </p>
            </div>
            <Button
              variant="secondary"
              className="font-bold hover:scale-105 transition-transform rounded-full px-8 shadow-sm"
            >
              Manage Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
