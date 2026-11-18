/**
 * A minimal Square client for the Convex runtime, in the same style as
 * `lib/stripe.ts`: REST calls with `fetch`, webhook signatures and token
 * encryption with Web Crypto, no SDK. Pure helpers only — no Convex imports —
 * so they are easy to test. Setup lives in CLAUDE.md → "POS integrations (Square)".
 */

/** The Square API version this code was written against (Developer Dashboard → App details). */
export const SQUARE_VERSION = "2026-11-18";

/**
 * Read-only access to locations and orders. Nothing about payments, tips,
 * customers or staff. Adding a scope later means every venue reconnects.
 */
export const SQUARE_SCOPES = ["MERCHANT_PROFILE_READ", "ORDERS_READ"] as const;

/** How long a "Connect with Square" click stays valid. */
export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

/** Renew a venue's access token once it is this close to expiring (Square's last 30 days). */
export const REFRESH_WITHIN_MS = 7 * 24 * 60 * 60 * 1000;

/** How long order times are kept. Enough for a venue's weekly pattern; nothing older is needed. */
export const ORDER_RETENTION_MS = 60 * 24 * 60 * 60 * 1000;

export type SquareEnvironment = "sandbox" | "production";

export function squareEnvironment(value: string | undefined): SquareEnvironment {
  return value === "production" ? "production" : "sandbox";
}

/** OAuth lives on `connect.*`; the same host also serves `/v2`. */
export function squareBaseUrl(env: SquareEnvironment): string {
  return env === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com";
}

/** The page Square shows the venue owner to sign in and allow access. */
export function authorizeUrl(env: SquareEnvironment, applicationId: string, state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: applicationId,
    scope: SQUARE_SCOPES.join(" "),
    // Always ask for a fresh Square sign-in rather than reusing whatever
    // Square session the browser has, so staff don't link the wrong account.
    session: "false",
    state,
    redirect_uri: redirectUri,
  });
  return `${squareBaseUrl(env)}/oauth2/authorize?${params.toString()}`;
}

/* ── Webhook signatures ───────────────────────────────────────────────────── */

async function hmacSha256Base64(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(message));
  return bytesToBase64(new Uint8Array(sig));
}

/** Constant-time string comparison, so timing doesn't leak the signature. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Checks Square's `x-square-hmacsha256-signature` header: base64
 * HMAC-SHA256 of the notification URL followed by the raw body, keyed with
 * the subscription's signature key. `notificationUrl` must be exactly the URL
 * registered in the Developer Dashboard.
 */
export async function verifySquareSignature(
  body: string,
  header: string | null,
  signatureKey: string,
  notificationUrl: string,
): Promise<boolean> {
  if (!header) return false;
  const expected = await hmacSha256Base64(signatureKey, notificationUrl + body);
  return safeEqual(header.trim(), expected);
}

/* ── Token encryption at rest ─────────────────────────────────────────────── */

function bytesToBase64(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const s = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(s.length));
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

async function importTokenKey(keyBase64: string): Promise<CryptoKey> {
  let raw: Uint8Array<ArrayBuffer>;
  try {
    raw = base64ToBytes(keyBase64.trim());
  } catch {
    throw new Error("SQUARE_TOKEN_KEY must be base64. Generate one with `openssl rand -base64 32`.");
  }
  if (raw.length !== 32) {
    throw new Error("SQUARE_TOKEN_KEY must be 32 bytes. Generate one with `openssl rand -base64 32`.");
  }
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

/** AES-256-GCM. Output: `v1.<iv>.<ciphertext>`, both base64. */
export async function encryptToken(plaintext: string, keyBase64: string): Promise<string> {
  const key = await importTokenKey(keyBase64);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plaintext));
  return `v1.${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(ct))}`;
}

export async function decryptToken(sealed: string, keyBase64: string): Promise<string> {
  const [version, iv, ct] = sealed.split(".");
  if (version !== "v1" || !iv || !ct) throw new Error("Unrecognised encrypted token format");
  const key = await importTokenKey(keyBase64);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToBytes(iv) }, key, base64ToBytes(ct));
  return new TextDecoder().decode(pt);
}

/** A random, URL-safe value for the OAuth `state` parameter. */
export function randomState(): string {
  return bytesToBase64(crypto.getRandomValues(new Uint8Array(24)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/* ── REST ─────────────────────────────────────────────────────────────────── */

export class SquareApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** Calls Square with JSON in and out. `auth` is a Bearer token or `Client <secret>` for OAuth revoke. */
export async function squareRequest<T>(
  env: SquareEnvironment,
  method: "GET" | "POST",
  path: string,
  { auth, body }: { auth?: string; body?: unknown } = {},
): Promise<T> {
  const res = await fetch(`${squareBaseUrl(env)}${path}`, {
    method,
    headers: {
      "Square-Version": SQUARE_VERSION,
      Accept: "application/json",
      ...(auth && { Authorization: auth }),
      ...(body !== undefined && { "Content-Type": "application/json" }),
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const detail =
      json?.errors?.[0]?.detail ?? json?.message ?? json?.error_description ?? json?.error ?? `HTTP ${res.status}`;
    throw new SquareApiError(`Square ${method} ${path} failed: ${detail}`, res.status);
  }
  return json as T;
}

/** `ObtainToken` response, for both the authorization-code and refresh grants. Only the fields used are typed. */
export interface SquareTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_at: string; // RFC 3339
  merchant_id: string;
}

export interface SquareLocation {
  id: string;
  name?: string;
  status?: string; // 'ACTIVE' | 'INACTIVE'
  timezone?: string;
  address?: { address_line_1?: string; locality?: string };
  /** Not every location has these filled in. */
  coordinates?: { latitude?: number; longitude?: number };
}

/**
 * A location's coordinates rounded to 2 decimal places (about 1 km), which is
 * plenty for local weather and doesn't pinpoint the building. Null when
 * Square has none, or they're out of range.
 */
export function roundedCoordinates(location: SquareLocation): { latitude: number; longitude: number } | null {
  const lat = location.coordinates?.latitude;
  const lon = location.coordinates?.longitude;
  if (typeof lat !== "number" || typeof lon !== "number" || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180 || (lat === 0 && lon === 0)) return null;
  const round = (x: number) => Math.round(x * 100) / 100;
  return { latitude: round(lat), longitude: round(lon) };
}

/* ── Webhook events ───────────────────────────────────────────────────────── */

/** The envelope every Square webhook shares. Only the fields used are typed. */
export interface SquareEvent {
  merchant_id?: string;
  type: string;
  event_id: string;
  created_at?: string;
  data?: { type?: string; id?: string; object?: Record<string, unknown> };
}

export type ParsedSquareEvent =
  | { kind: "order"; merchantId: string; orderId: string; locationId: string; at: number }
  | { kind: "revoked"; merchantId: string }
  | { kind: "ignored" };

interface OrderInfo {
  order_id?: string;
  location_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * What the app does with an event. `order.created` and `order.updated` carry
 * only ids and timestamps (`data.object.order_created` / `order_updated`),
 * which is all AutoLobby needs: when an order happened, and where.
 */
export function parseSquareEvent(event: SquareEvent): ParsedSquareEvent {
  const merchantId = event.merchant_id;
  if (!merchantId) return { kind: "ignored" };

  if (event.type === "oauth.authorization.revoked") return { kind: "revoked", merchantId };

  if (event.type === "order.created" || event.type === "order.updated") {
    const obj = event.data?.object ?? {};
    const info = (obj.order_created ?? obj.order_updated) as OrderInfo | undefined;
    const orderId = info?.order_id ?? event.data?.id;
    const locationId = info?.location_id;
    if (!orderId || !locationId) return { kind: "ignored" };
    // The order's own creation time; an update re-sent days later must not
    // count as a new order now.
    const at = Date.parse(info?.created_at ?? event.created_at ?? "");
    if (!Number.isFinite(at)) return { kind: "ignored" };
    return { kind: "order", merchantId, orderId, locationId, at };
  }

  return { kind: "ignored" };
}
