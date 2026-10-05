/**
 * Client-side billing helpers. Billing is a Stripe Payment Link (a plain URL)
 * rather than an SDK integration — see "Environment variables" in CLAUDE.md.
 */

export const PLAN_NAME = "L&L Basic";
export const PLAN_PRICE = "$20";

// `NEXT_PUBLIC_*` values are inlined at build time, so they must be read with
// a literal `process.env.NAME` — a dynamic `process.env[key]` would be undefined.
const PAYMENT_LINK = process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PAYMENT_LINK;
const CUSTOMER_PORTAL = process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL;

/**
 * The Payment Link, tagged with who is paying. Stripe stores
 * `client_reference_id` on the payment, which tells you which Clerk user to
 * pass to `userProfiles:setPlan`. Null when no link is configured.
 */
export function subscribeUrl(clerkUserId: string, email?: string): string | null {
  if (!PAYMENT_LINK) return null;
  const url = new URL(PAYMENT_LINK);
  url.searchParams.set("client_reference_id", clerkUserId);
  if (email) url.searchParams.set("prefilled_email", email);
  return url.toString();
}

/** Stripe's no-code customer portal (cancel, card, invoices), if configured. */
export const customerPortalUrl: string | null = CUSTOMER_PORTAL || null;
