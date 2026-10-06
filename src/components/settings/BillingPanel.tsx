"use client";

import { CreditCard } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAccess } from "@/hooks/useAccess";
import { PLAN_NAME, PLAN_PRICE, customerPortalUrl, subscribeUrl } from "@/lib/billing";
import type { AccessStatus } from "@convex/lib/billing";

const BADGES: Record<AccessStatus, { label: string; className: string }> = {
  trial: { label: "Free trial", className: "bg-primary/10 text-primary" },
  active: { label: "Active", className: "bg-primary/10 text-primary" },
  expired: { label: "Trial ended", className: "bg-destructive/15 text-destructive" },
};

function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function Skeleton({ className }: { className: string }) {
  return <div className={`rounded bg-muted animate-pulse ${className}`} />;
}

const primaryButton =
  "inline-flex items-center px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold hover:opacity-90 transition-opacity";

/** Plan status and the Stripe links (subscribe / manage). Formerly the /account page. */
export function BillingPanel() {
  const { user } = useUser();
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
    <div className="max-w-[820px] space-y-3">
      <div className="rounded-xl border border-white/[0.06] p-[22px] shadow-[0_6px_24px_rgba(0,0,0,0.24)] bg-secondary bg-[radial-gradient(circle_at_90%_0%,hsl(var(--primary)/0.13),transparent_35%)]">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            {state ? (
              <span
                className={`inline-block text-[9px] font-extrabold px-2 py-1 rounded-full uppercase tracking-wide mb-2.5 ${BADGES[state.access.status].className}`}
              >
                {BADGES[state.access.status].label}
              </span>
            ) : (
              <Skeleton className="h-5 w-20 rounded-full mb-2.5" />
            )}
            <h2 className="text-[17px] font-extrabold text-foreground">{PLAN_NAME}</h2>
            {state ? (
              <p className="text-xs text-muted-foreground mt-1 mb-5">{statusLine}</p>
            ) : (
              <Skeleton className="h-4 w-72 mt-1 mb-5" />
            )}

            {state && state.access.status !== "active" &&
              (subscribeHref ? (
                <a href={subscribeHref} className={primaryButton}>
                  Subscribe
                </a>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Online checkout isn&apos;t available yet — contact us to subscribe.
                </p>
              ))}
            {state?.access.status === "active" && customerPortalUrl && (
              <a href={customerPortalUrl} className={primaryButton}>
                Manage subscription &amp; invoices
              </a>
            )}
          </div>

          <p className="text-[26px] font-bold text-foreground">
            {PLAN_PRICE}
            <span className="text-sm text-muted-foreground font-normal">/mo</span>
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Payment
          </CardTitle>
          <CardDescription>
            Payments are handled securely by Stripe — your card details never touch Lobby &amp; Lounge.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
