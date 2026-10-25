"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@convex/_generated/api";

type Pending = "checkout" | "portal" | null;

/**
 * Sends the browser to Stripe: Checkout to subscribe, or the customer portal
 * to manage an existing subscription. The URLs are created server-side
 * (`convex/billing.ts`) because they need the Stripe secret key.
 */
export function useBillingRedirect() {
  const startCheckout = useAction(api.billing.startCheckout);
  const openPortal = useAction(api.billing.openPortal);
  const [pending, setPending] = useState<Pending>(null);
  const [error, setError] = useState<string | null>(null);

  async function go(kind: Exclude<Pending, null>) {
    setPending(kind);
    setError(null);
    try {
      const url = kind === "checkout" ? await startCheckout({}) : await openPortal({});
      // Leave `pending` set: the page is navigating away.
      window.location.assign(url);
    } catch (e) {
      setError(e instanceof ConvexError ? String(e.data) : "Couldn't reach our payment provider. Please try again.");
      setPending(null);
    }
  }

  return {
    pending,
    error,
    subscribe: () => go("checkout"),
    manage: () => go("portal"),
  };
}
