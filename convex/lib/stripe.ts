/**
 * A minimal Stripe client for the Convex runtime: REST calls with `fetch` and
 * webhook signature checks with Web Crypto, so no SDK or Node runtime is
 * needed. Pure helpers only — no Convex imports — so they are easy to test.
 */

const STRIPE_API = "https://api.stripe.com/v1";

/** How old a webhook signature may be before it's rejected (Stripe's default). */
const SIGNATURE_TOLERANCE_SECONDS = 300;

type Param = string | number | boolean | null | undefined | Param[] | { [key: string]: Param };

/**
 * Encodes params the way Stripe expects form bodies:
 * `{ line_items: [{ price: "p" }] }` → `line_items[0][price]=p`.
 * `null` / `undefined` values are skipped.
 */
export function formEncode(params: Record<string, Param>): string {
  const pairs: string[] = [];
  const walk = (key: string, value: Param) => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((item, i) => walk(`${key}[${i}]`, item));
    } else if (typeof value === "object") {
      for (const [k, v] of Object.entries(value)) walk(`${key}[${k}]`, v);
    } else {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  };
  for (const [k, v] of Object.entries(params)) walk(k, v);
  return pairs.join("&");
}

/**
 * Refuses a live Stripe key on a local site, so a dev deployment can never
 * create real customers or charges. Dev uses the "LL Basic Plan Sandbox"
 * account (test mode); see CLAUDE.md → "Billing (Stripe)".
 */
export function assertKeyMatchesSite(key: string, siteUrl: string | undefined) {
  const live = /^(sk|rk)_live_/.test(key);
  const local = !!siteUrl && /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/.test(siteUrl);
  if (live && local) {
    throw new Error("A live Stripe key is set on a local deployment. Use the sandbox's sk_test_ key for dev.");
  }
}

/** Calls the Stripe API with the secret key from the Convex env. Throws on errors. */
export async function stripeRequest<T>(
  method: "GET" | "POST",
  path: string,
  params: Record<string, Param> = {},
): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set. Run `npx convex env set STRIPE_SECRET_KEY sk_...`.");
  assertKeyMatchesSite(key, process.env.SITE_URL);

  const body = formEncode(params);
  const url = method === "GET" && body ? `${STRIPE_API}${path}?${body}` : `${STRIPE_API}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(method === "POST" && { "Content-Type": "application/x-www-form-urlencoded" }),
    },
    ...(method === "POST" && { body }),
  });
  const json = await res.json();
  if (!res.ok) {
    const message = json?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`Stripe ${method} ${path} failed: ${message}`);
  }
  return json as T;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time string comparison, so timing doesn't leak the signature. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Checks a `Stripe-Signature` header against the raw request body, as in
 * https://docs.stripe.com/webhooks#verify-manually. `nowSeconds` is injectable
 * for tests.
 */
export async function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<boolean> {
  if (!header) return false;
  let timestamp: number | null = null;
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const [k, v] = part.split("=", 2);
    if (k === "t") timestamp = Number(v);
    else if (k === "v1" && v) signatures.push(v);
  }
  if (!timestamp || !Number.isFinite(timestamp) || signatures.length === 0) return false;
  if (Math.abs(nowSeconds - timestamp) > SIGNATURE_TOLERANCE_SECONDS) return false;

  const expected = await hmacSha256Hex(secret, `${timestamp}.${payload}`);
  return signatures.some((s) => safeEqual(s, expected));
}

/** The Stripe objects this app reads. Only the fields used are typed. */
export interface StripeSubscription {
  id: string;
  status: string;
  customer: string;
  metadata: Record<string, string>;
}

export interface StripeEvent {
  id: string;
  type: string;
  data: { object: { id: string; object: string; subscription?: string | null; mode?: string } };
}

/**
 * Subscription statuses that keep the music playing. `past_due` stays live
 * while Stripe retries the card; when retries run out Stripe moves the
 * subscription to `canceled` or `unpaid` (per your Dashboard settings).
 */
const LIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

export function isLiveSubscription(status: string): boolean {
  return LIVE_STATUSES.has(status);
}

const SUBSCRIPTION_EVENTS = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
]);

/** Which subscription a webhook event is about, or null if it's not one the app acts on. */
export function subscriptionIdFor(event: StripeEvent): string | null {
  const obj = event.data.object;
  if (SUBSCRIPTION_EVENTS.has(event.type)) return obj.id;
  if (event.type === "checkout.session.completed" && obj.mode === "subscription") return obj.subscription ?? null;
  return null;
}
