"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useAccess } from "@/hooks/useAccess";
import { subscribeUrl } from "@/lib/billing";

/** Start nudging this many days before the trial ends. */
const WARN_DAYS = 7;

/** App-wide notice when the free trial is about to end or has ended. */
export function TrialBanner() {
  const state = useAccess();
  const { user } = useUser();

  if (!state || !user) return null;
  const { access, daysLeft } = state;
  if (access.status === "active") return null;
  if (access.status === "trial" && daysLeft > WARN_DAYS) return null;

  const href = subscribeUrl(user.id, user.primaryEmailAddress?.emailAddress) ?? "/settings?tab=billing";

  if (access.status === "expired") {
    return (
      <div
        role="alert"
        className="shrink-0 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium"
      >
        <span>Your free month has ended — subscribe to keep the music playing.</span>
        <a
          href={href}
          className="rounded-full bg-primary-foreground text-primary px-4 py-1 font-semibold hover:opacity-90 transition-opacity"
        >
          Subscribe
        </a>
      </div>
    );
  }

  return (
    <div className="shrink-0 flex items-center justify-center gap-3 px-6 py-2 bg-primary/10 text-sm text-foreground">
      <span>
        {daysLeft} {daysLeft === 1 ? "day" : "days"} left in your free trial.
      </span>
      <Link href="/settings?tab=billing" className="font-semibold text-primary hover:underline">
        See plan
      </Link>
    </div>
  );
}
