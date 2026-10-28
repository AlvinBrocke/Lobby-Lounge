"use client";

import { CreditCard } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAccess } from "@/hooks/useAccess";
import { useBillingRedirect } from "@/hooks/useBillingRedirect";
import { PLAN_NAME, PLAN_PRICE } from "@/lib/billing";
import { checkoutTrialEnd, trialEndFor, type AccessStatus } from "@convex/lib/billing";

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
  "inline-flex items-center px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-extrabold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-wait";

/** Plan status, plus buttons to Stripe Checkout (subscribe) or the customer portal (manage). */
export function BillingPanel() {
  const state = useAccess();
  const billing = useBillingRedirect();
  // Set by Stripe's redirect back from Checkout (convex/billing.ts → startCheckout).
  const checkout = useSearchParams().get("checkout");

  let statusLine = "";
  if (state) {
    const { access, daysLeft, profile } = state;
    const subStatus = profile?.subscriptionStatus;
    if (access.status === "active") {
      if (subStatus === "trialing") {
        statusLine = `Payment method added. Your first ${PLAN_PRICE} charge is on ${formatDate(trialEndFor(profile))}.`;
      } else if (subStatus === "past_due") {
        statusLine = "Your last payment didn't go through. Update your card to keep the music playing.";
      } else {
        statusLine = "Your subscription is active.";
      }
    } else if (access.status === "trial") {
      const days = `${daysLeft} ${daysLeft === 1 ? "day" : "days"}`;
      statusLine = checkoutTrialEnd(profile, Date.now())
        ? `${days} left — your free trial ends ${formatDate(access.trialEndsAt!)}. Add a payment method now and you won't be charged until then.`
        : `${days} left — your free trial ends ${formatDate(access.trialEndsAt!)}. Subscribe now to keep the music playing without a gap.`;
    } else {
      statusLine = `Your free trial ended ${formatDate(access.trialEndsAt ?? Date.now())}. Subscribe to keep playing music.`;
    }
  }

  const isActive = state?.access.status === "active";
  // Venues switched to "basic" by hand (no Stripe customer) have nothing to manage.
  const canManage = isActive && !!state?.profile?.stripeCustomerId;
  const subscribeLabel =
    state?.access.status === "trial" && state.profile && checkoutTrialEnd(state.profile, Date.now())
      ? "Add payment method"
      : "Subscribe";

  return (
    <div className="max-w-[820px] space-y-3">
      {checkout === "success" && !isActive && (
        <p role="status" className="rounded-lg bg-primary/10 text-primary text-xs font-semibold px-3.5 py-2.5">
          Thanks! We&apos;re confirming your subscription with Stripe — this page updates on its own in a few seconds.
        </p>
      )}
      {checkout === "cancelled" && !isActive && (
        <p role="status" className="rounded-lg bg-muted text-muted-foreground text-xs px-3.5 py-2.5">
          Checkout was cancelled. Nothing was charged.
        </p>
      )}

      <div className="rounded-xl border border-foreground/[0.06] p-[22px] shadow-[0_6px_24px_rgba(0,0,0,0.24)] bg-secondary bg-[radial-gradient(circle_at_90%_0%,hsl(var(--primary)/0.13),transparent_35%)]">
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

            {state && !isActive && checkout !== "success" && (
              <button type="button" onClick={billing.subscribe} disabled={billing.pending !== null} className={primaryButton}>
                {billing.pending === "checkout" ? "Opening checkout…" : subscribeLabel}
              </button>
            )}
            {canManage && (
              <button type="button" onClick={billing.manage} disabled={billing.pending !== null} className={primaryButton}>
                {billing.pending === "portal" ? "Opening…" : "Manage subscription & invoices"}
              </button>
            )}
            {billing.error && (
              <p role="alert" className="text-xs text-destructive mt-2.5">
                {billing.error}
              </p>
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
