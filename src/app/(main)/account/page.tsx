"use client";

import React from "react";
import { CreditCard, Shield } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccess } from "@/hooks/useAccess";
import { PLAN_NAME, PLAN_PRICE, customerPortalUrl, subscribeUrl } from "@/lib/billing";
import type { AccessStatus } from "@convex/lib/billing";

const BADGES: Record<AccessStatus, { label: string; className: string }> = {
  trial: { label: "Free trial", className: "bg-primary/20 text-primary" },
  active: { label: "Active", className: "bg-primary/20 text-primary" },
  expired: { label: "Trial ended", className: "bg-destructive/15 text-destructive" },
};

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function Skeleton({ className }: { className: string }) {
  return <div className={`rounded bg-muted animate-pulse ${className}`} />;
}

export default function AccountPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const state = useAccess();

  const email = user?.primaryEmailAddress?.emailAddress;
  const subscribeHref = user ? subscribeUrl(user.id, email) : null;

  let statusLine = "";
  if (state) {
    const { access, daysLeft } = state;
    if (access.status === "active") statusLine = "Your subscription is active.";
    else if (access.status === "trial")
      statusLine = `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left — your free trial ends ${formatDate(access.trialEndsAt!)}.`;
    else statusLine = `Your free trial ended ${formatDate(access.trialEndsAt ?? Date.now())}. Subscribe to keep playing music.`;
  }

  return (
    <PageWrapper
      title="Account"
      description="Manage your business profile and subscription."
    >
      <div className="max-w-4xl space-y-8">
        {/* Subscription Card */}
        <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-8 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                {state ? (
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${BADGES[state.access.status].className}`}
                  >
                    {BADGES[state.access.status].label}
                  </span>
                ) : (
                  <Skeleton className="h-6 w-24 rounded-full" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{PLAN_NAME}</h2>
              {state ? (
                <p className="text-muted-foreground mb-6">{statusLine}</p>
              ) : (
                <Skeleton className="h-4 w-72 mb-6" />
              )}

              <div className="flex space-x-4">
                {state && state.access.status !== "active" && (
                  subscribeHref ? (
                    <a href={subscribeHref} className={buttonVariants({ className: "font-medium" })}>
                      Subscribe
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Online checkout isn&apos;t available yet — contact us to subscribe.
                    </p>
                  )
                )}
                {state?.access.status === "active" && customerPortalUrl && (
                  <a href={customerPortalUrl} className={buttonVariants({ className: "font-medium" })}>
                    Manage subscription &amp; invoices
                  </a>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-3xl font-bold text-foreground">
                {PLAN_PRICE}
                <span className="text-lg text-muted-foreground font-normal">/mo</span>
              </p>
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-card border-border shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Business Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  Business Name
                </label>
                <div className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2 mt-1 text-muted-foreground cursor-not-allowed">
                  {state ? state.profile?.venueName || "—" : <Skeleton className="h-5 w-40" />}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  Email Address
                </label>
                <div className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2 mt-1 text-muted-foreground cursor-not-allowed">
                  {userLoaded ? email ?? "—" : <Skeleton className="h-5 w-48" />}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="w-5 h-5 mr-2 text-primary" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Payments are handled securely by Stripe — your card details never touch Lobby &amp; Lounge.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
