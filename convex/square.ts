import { ConvexError, v } from "convex/values";
import {
  action,
  httpAction,
  internalAction,
  internalMutation,
  internalQuery,
  query,
  type ActionCtx,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { logActivity } from "./lib/activity";
import { requireUser, requireVenueAdmin } from "./lib/auth";
import {
  OAUTH_STATE_TTL_MS,
  ORDER_RETENTION_MS,
  REFRESH_WITHIN_MS,
  authorizeUrl,
  decryptToken,
  encryptToken,
  parseSquareEvent,
  randomState,
  squareEnvironment,
  squareRequest,
  verifySquareSignature,
  type SquareEvent,
  type SquareLocation,
  type SquareTokenResponse,
} from "./lib/square";

/*
 * Square POS integration, part 1: a venue connects its Square account
 * (OAuth, read-only), picks the location that drives its one zone, and Square
 * sends order webhooks that are stored as bare timestamps for AutoLobby.
 * Setup lives in CLAUDE.md → "POS integrations (Square)". Everything is keyed
 * by the venue owner's Clerk user id (what `requireUser` returns).
 */

const ADMIN_ONLY = "Only venue admins can manage POS integrations.";
const PURGE_BATCH = 500;

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. Run \`npx convex env set ${name} <value>\`.`);
  return value;
}

function isConfigured(): boolean {
  return Boolean(
    process.env.SQUARE_APPLICATION_ID && process.env.SQUARE_APPLICATION_SECRET && process.env.SQUARE_TOKEN_KEY,
  );
}

function sqEnv() {
  return squareEnvironment(process.env.SQUARE_ENVIRONMENT);
}

/** Convex's own HTTP actions URL, e.g. https://happy-otter-123.convex.site */
function convexSiteUrl(): string {
  return env("CONVEX_SITE_URL").replace(/\/+$/, "");
}

/** Register this exact URL as the app's OAuth redirect URL in the Square Developer Dashboard. */
function redirectUri(): string {
  return `${convexSiteUrl()}/square/oauth/callback`;
}

/** The notification URL registered for the webhook subscription; part of every signature. */
function webhookUrl(): string {
  return process.env.SQUARE_WEBHOOK_URL || `${convexSiteUrl()}/square/webhook`;
}

function integrationsPage(result: "connected" | "denied" | "expired" | "error"): string {
  return `${env("SITE_URL").replace(/\/+$/, "")}/settings?tab=integrations&square=${result}`;
}

/** Activity rows for code paths with no signed-in caller (the OAuth callback, webhooks, crons). */
async function logAs(ctx: MutationCtx, clerkUserId: string, actorId: string, actorName: string, summary: string) {
  await ctx.db.insert("activity", { clerkUserId, actorId, actorName, summary });
}

async function connectionOf(ctx: { db: QueryCtx["db"] }, clerkUserId: string) {
  return await ctx.db
    .query("squareConnections")
    .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
    .unique();
}

/* ── Called from the app ──────────────────────────────────────────────────── */

/**
 * The venue's Square status for Settings → Integrations and the Tasks page.
 * Never includes tokens.
 */
export const status = query({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await requireUser(ctx);
    const conn = await connectionOf(ctx, clerkUserId);
    return {
      configured: isConfigured(),
      sandbox: sqEnv() === "sandbox",
      connection: conn && {
        status: conn.status,
        locationId: conn.locationId ?? null,
        locationName: conn.locationName ?? null,
        connectedAt: conn.connectedAt,
        lastOrderAt: conn.lastOrderAt ?? null,
        needsAttention: conn.status === "revoked" || conn.refreshFailedAt !== undefined,
      },
    };
  },
});

/** Starts "Connect with Square": returns Square's sign-in URL for the browser to open. */
export const startConnect = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    const clerkUserId = await requireVenueAdmin(ctx, ADMIN_ONLY);
    if (!isConfigured()) throw new ConvexError("Square isn't set up for Lobby & Lounge yet. Please try again later.");
    const identity = (await ctx.auth.getUserIdentity())!;
    const state = randomState();
    await ctx.runMutation(internal.square.createState, {
      state,
      clerkUserId,
      actorId: identity.subject,
      actorName: identity.name ?? identity.email ?? "Someone",
    });
    return authorizeUrl(sqEnv(), env("SQUARE_APPLICATION_ID"), state, redirectUri());
  },
});

/** The connected account's active locations, for the location picker. */
export const listLocations = action({
  args: {},
  handler: async (ctx): Promise<{ id: string; name: string; address: string }[]> => {
    const clerkUserId = await requireVenueAdmin(ctx, ADMIN_ONLY);
    return (await fetchLocations(ctx, clerkUserId)).map((l) => ({
      id: l.id,
      name: l.name || "Unnamed location",
      address: [l.address?.address_line_1, l.address?.locality].filter(Boolean).join(", "),
    }));
  },
});

/** Picks the Square location whose orders drive the venue's zone. Checked against Square, not trusted from the browser. */
export const selectLocation = action({
  args: { locationId: v.string() },
  handler: async (ctx, { locationId }) => {
    const clerkUserId = await requireVenueAdmin(ctx, ADMIN_ONLY);
    const location = (await fetchLocations(ctx, clerkUserId)).find((l) => l.id === locationId);
    if (!location) throw new ConvexError("That location isn't in your Square account any more. Refresh and try again.");
    await ctx.runMutation(internal.square.saveLocation, {
      clerkUserId,
      locationId,
      locationName: location.name || "Unnamed location",
    });
  },
});

/** Disconnects Square: revokes our access with Square, then forgets the tokens and the venue's order times. */
export const disconnect = action({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await requireVenueAdmin(ctx, ADMIN_ONLY);
    const conn = await ctx.runQuery(internal.square.connectionFor, { clerkUserId });
    if (!conn) return;
    if (conn.status === "connected" && isConfigured()) {
      try {
        await squareRequest(sqEnv(), "POST", "/oauth2/revoke", {
          auth: `Client ${env("SQUARE_APPLICATION_SECRET")}`,
          body: { client_id: env("SQUARE_APPLICATION_ID"), merchant_id: conn.merchantId },
        });
      } catch (err) {
        // Still forget the tokens locally; the venue can also remove the app in Square.
        console.error(`Square revoke for ${clerkUserId} failed:`, err);
      }
    }
    await ctx.runMutation(internal.square.removeConnection, { clerkUserId });
  },
});

/* ── Tokens ───────────────────────────────────────────────────────────────── */

async function fetchLocations(ctx: ActionCtx, clerkUserId: string): Promise<SquareLocation[]> {
  const conn = await ctx.runQuery(internal.square.connectionFor, { clerkUserId });
  if (!conn || conn.status !== "connected") throw new ConvexError("Connect Square first.");
  const token = await accessTokenFor(ctx, conn);
  const res = await squareRequest<{ locations?: SquareLocation[] }>(sqEnv(), "GET", "/v2/locations", {
    auth: `Bearer ${token}`,
  });
  return (res.locations ?? []).filter((l) => l.status !== "INACTIVE");
}

/** A usable access token for `conn`, renewed first if it's about to expire. */
async function accessTokenFor(ctx: ActionCtx, conn: Doc<"squareConnections">): Promise<string> {
  const key = env("SQUARE_TOKEN_KEY");
  if (conn.accessTokenExpiresAt - Date.now() > 60_000) return decryptToken(conn.accessTokenEnc, key);
  return (await refresh(ctx, conn)) ?? decryptToken(conn.accessTokenEnc, key);
}

/** Renews `conn`'s access token. Returns the new token, or null if Square refused. */
async function refresh(ctx: ActionCtx, conn: Doc<"squareConnections">): Promise<string | null> {
  const key = env("SQUARE_TOKEN_KEY");
  if (!conn.refreshTokenEnc) return null;
  try {
    const res = await squareRequest<SquareTokenResponse>(sqEnv(), "POST", "/oauth2/token", {
      body: {
        client_id: env("SQUARE_APPLICATION_ID"),
        client_secret: env("SQUARE_APPLICATION_SECRET"),
        grant_type: "refresh_token",
        refresh_token: await decryptToken(conn.refreshTokenEnc, key),
      },
    });
    await ctx.runMutation(internal.square.updateTokens, {
      connectionId: conn._id,
      accessTokenEnc: await encryptToken(res.access_token, key),
      refreshTokenEnc: res.refresh_token ? await encryptToken(res.refresh_token, key) : undefined,
      accessTokenExpiresAt: Date.parse(res.expires_at),
    });
    return res.access_token;
  } catch (err) {
    console.error(`Square token refresh for ${conn.clerkUserId} failed:`, err);
    await ctx.runMutation(internal.square.markRefreshFailed, { connectionId: conn._id });
    return null;
  }
}

/** Daily cron: renews every token within REFRESH_WITHIN_MS of expiring (Square's last 30 days). */
export const refreshExpiring = internalAction({
  args: {},
  handler: async (ctx) => {
    const due = await ctx.runQuery(internal.square.expiringConnections, { before: Date.now() + REFRESH_WITHIN_MS });
    for (const conn of due) await refresh(ctx, conn);
  },
});

/* ── Internal reads & writes ──────────────────────────────────────────────── */

export const connectionFor = internalQuery({
  args: { clerkUserId: v.string() },
  handler: (ctx, { clerkUserId }) => connectionOf(ctx, clerkUserId),
});

export const expiringConnections = internalQuery({
  args: { before: v.number() },
  handler: async (ctx, { before }) => {
    const rows = await ctx.db
      .query("squareConnections")
      .withIndex("by_expiry", (q) => q.lt("accessTokenExpiresAt", before))
      .take(200);
    return rows.filter((c) => c.status === "connected");
  },
});

export const createState = internalMutation({
  args: { state: v.string(), clerkUserId: v.string(), actorId: v.string(), actorName: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("squareOAuthStates", { ...args, expiresAt: Date.now() + OAUTH_STATE_TTL_MS });
  },
});

/** Uses up a `state` value. Null when it's unknown, already used, or expired. */
export const consumeState = internalMutation({
  args: { state: v.string() },
  handler: async (ctx, { state }) => {
    const row = await ctx.db
      .query("squareOAuthStates")
      .withIndex("by_state", (q) => q.eq("state", state))
      .unique();
    if (!row) return null;
    await ctx.db.delete(row._id);
    if (row.expiresAt < Date.now()) return null;
    return { clerkUserId: row.clerkUserId, actorId: row.actorId, actorName: row.actorName };
  },
});

export const saveConnection = internalMutation({
  args: {
    clerkUserId: v.string(),
    merchantId: v.string(),
    accessTokenEnc: v.string(),
    refreshTokenEnc: v.optional(v.string()),
    accessTokenExpiresAt: v.number(),
    actorId: v.string(),
    actorName: v.string(),
  },
  handler: async (ctx, { actorId, actorName, ...args }) => {
    const existing = await connectionOf(ctx, args.clerkUserId);
    const fields = { ...args, status: "connected" as const, connectedAt: Date.now(), refreshFailedAt: undefined };
    if (existing) {
      // Reconnecting the same Square account keeps the chosen location.
      const sameMerchant = existing.merchantId === args.merchantId;
      await ctx.db.patch(existing._id, {
        ...fields,
        ...(!sameMerchant && { locationId: undefined, locationName: undefined, lastOrderAt: undefined }),
      });
    } else {
      await ctx.db.insert("squareConnections", fields);
    }
    await logAs(ctx, args.clerkUserId, actorId, actorName, "Connected Square");
  },
});

export const updateTokens = internalMutation({
  args: {
    connectionId: v.id("squareConnections"),
    accessTokenEnc: v.string(),
    refreshTokenEnc: v.optional(v.string()),
    accessTokenExpiresAt: v.number(),
  },
  handler: async (ctx, { connectionId, refreshTokenEnc, ...fields }) => {
    if (!(await ctx.db.get(connectionId))) return;
    await ctx.db.patch(connectionId, {
      ...fields,
      ...(refreshTokenEnc && { refreshTokenEnc }),
      refreshFailedAt: undefined,
    });
  },
});

export const markRefreshFailed = internalMutation({
  args: { connectionId: v.id("squareConnections") },
  handler: async (ctx, { connectionId }) => {
    if (await ctx.db.get(connectionId)) await ctx.db.patch(connectionId, { refreshFailedAt: Date.now() });
  },
});

/** Called from `selectLocation` (an action), so the caller's identity is still there for the activity log. */
export const saveLocation = internalMutation({
  args: { clerkUserId: v.string(), locationId: v.string(), locationName: v.string() },
  handler: async (ctx, { clerkUserId, locationId, locationName }) => {
    const conn = await connectionOf(ctx, clerkUserId);
    if (!conn) throw new ConvexError("Connect Square first.");
    // Orders from another location say nothing about this zone.
    const changed = conn.locationId !== locationId;
    await ctx.db.patch(conn._id, { locationId, locationName, ...(changed && { lastOrderAt: undefined }) });
    await logActivity(ctx, clerkUserId, `Set the Square location to "${locationName}"`);
  },
});

export const removeConnection = internalMutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    const conn = await connectionOf(ctx, clerkUserId);
    if (!conn) return;
    await ctx.db.delete(conn._id);
    await ctx.scheduler.runAfter(0, internal.square.purgeVenueOrders, { clerkUserId });
    await logActivity(ctx, clerkUserId, "Disconnected Square");
  },
});

/**
 * Stores one order time for every venue connected to this merchant and
 * location. Square can deliver an event more than once, and sends
 * `order.updated` many times per order, so each order is stored once.
 */
export const recordOrder = internalMutation({
  args: { merchantId: v.string(), orderId: v.string(), locationId: v.string(), at: v.number() },
  handler: async (ctx, { merchantId, orderId, locationId, at }) => {
    if (at < Date.now() - ORDER_RETENTION_MS) return 0;
    const conns = await ctx.db
      .query("squareConnections")
      .withIndex("by_merchant", (q) => q.eq("merchantId", merchantId))
      .collect();
    let stored = 0;
    for (const conn of conns) {
      if (conn.status !== "connected" || conn.locationId !== locationId) continue;
      const seen = await ctx.db
        .query("posOrders")
        .withIndex("by_order", (q) => q.eq("source", "square").eq("orderId", orderId))
        .filter((q) => q.eq(q.field("clerkUserId"), conn.clerkUserId))
        .first();
      if (seen) continue;
      await ctx.db.insert("posOrders", { clerkUserId: conn.clerkUserId, source: "square", orderId, at });
      if (!conn.lastOrderAt || at > conn.lastOrderAt) await ctx.db.patch(conn._id, { lastOrderAt: at });
      stored++;
    }
    return stored;
  },
});

/** Square says the venue removed our access (Square Dashboard → Apps). Keep the row so Settings can offer Reconnect. */
export const markRevoked = internalMutation({
  args: { merchantId: v.string() },
  handler: async (ctx, { merchantId }) => {
    const conns = await ctx.db
      .query("squareConnections")
      .withIndex("by_merchant", (q) => q.eq("merchantId", merchantId))
      .collect();
    for (const conn of conns) {
      if (conn.status === "revoked") continue;
      await ctx.db.patch(conn._id, { status: "revoked" });
      await logAs(ctx, conn.clerkUserId, "square", "Square", "Square access was removed from the Square Dashboard");
    }
  },
});

/** Deletes a disconnected venue's order times, a batch at a time. */
export const purgeVenueOrders = internalMutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    const rows = await ctx.db
      .query("posOrders")
      .withIndex("by_clerk_user_and_at", (q) => q.eq("clerkUserId", clerkUserId))
      .take(PURGE_BATCH);
    for (const row of rows) await ctx.db.delete(row._id);
    if (rows.length === PURGE_BATCH) await ctx.scheduler.runAfter(0, internal.square.purgeVenueOrders, { clerkUserId });
  },
});

/** Daily cron: drops order times past ORDER_RETENTION_MS and unused OAuth states. */
export const purgeOld = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const orders = await ctx.db
      .query("posOrders")
      .withIndex("by_at", (q) => q.lt("at", now - ORDER_RETENTION_MS))
      .take(PURGE_BATCH);
    for (const row of orders) await ctx.db.delete(row._id);
    const states = await ctx.db
      .query("squareOAuthStates")
      .withIndex("by_expiry", (q) => q.lt("expiresAt", now))
      .take(PURGE_BATCH);
    for (const row of states) await ctx.db.delete(row._id);
    if (orders.length === PURGE_BATCH || states.length === PURGE_BATCH) {
      await ctx.scheduler.runAfter(0, internal.square.purgeOld, {});
    }
  },
});

/* ── HTTP (routed in convex/http.ts) ──────────────────────────────────────── */

/**
 * Where Square sends the venue back after "Allow" (or "Deny"). Swaps the
 * one-time code for tokens, stores them encrypted, picks the location when
 * there's only one, then returns the browser to Settings → Integrations.
 */
export const oauthCallback = httpAction(async (ctx, request) => {
  const params = new URL(request.url).searchParams;
  const state = params.get("state");
  const code = params.get("code");
  const go = (result: Parameters<typeof integrationsPage>[0]) =>
    new Response(null, { status: 302, headers: { Location: integrationsPage(result) } });

  // Always use up the state, even on "Deny", so it can't be replayed.
  const who = state ? await ctx.runMutation(internal.square.consumeState, { state }) : null;
  if (params.get("error") || !code) return go("denied");
  if (!who) return go("expired");

  try {
    const key = env("SQUARE_TOKEN_KEY");
    const token = await squareRequest<SquareTokenResponse>(sqEnv(), "POST", "/oauth2/token", {
      body: {
        client_id: env("SQUARE_APPLICATION_ID"),
        client_secret: env("SQUARE_APPLICATION_SECRET"),
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri(),
      },
    });
    await ctx.runMutation(internal.square.saveConnection, {
      clerkUserId: who.clerkUserId,
      merchantId: token.merchant_id,
      accessTokenEnc: await encryptToken(token.access_token, key),
      refreshTokenEnc: token.refresh_token ? await encryptToken(token.refresh_token, key) : undefined,
      accessTokenExpiresAt: Date.parse(token.expires_at),
      actorId: who.actorId,
      actorName: who.actorName,
    });

    // One location: nothing to choose. Several: the venue picks in Settings.
    try {
      const res = await squareRequest<{ locations?: SquareLocation[] }>(sqEnv(), "GET", "/v2/locations", {
        auth: `Bearer ${token.access_token}`,
      });
      const active = (res.locations ?? []).filter((l) => l.status !== "INACTIVE");
      const conn = await ctx.runQuery(internal.square.connectionFor, { clerkUserId: who.clerkUserId });
      if (active.length === 1 && !conn?.locationId) {
        await ctx.runMutation(internal.square.autoSelectLocation, {
          clerkUserId: who.clerkUserId,
          locationId: active[0].id,
          locationName: active[0].name || "Unnamed location",
        });
      }
    } catch (err) {
      console.warn("Square location lookup after connect failed; the venue can pick one in Settings.", err);
    }
    return go("connected");
  } catch (err) {
    console.error("Square OAuth callback failed:", err);
    return go("error");
  }
});

/** `saveLocation` for the OAuth callback, which has no signed-in caller to log. */
export const autoSelectLocation = internalMutation({
  args: { clerkUserId: v.string(), locationId: v.string(), locationName: v.string() },
  handler: async (ctx, { clerkUserId, locationId, locationName }) => {
    const conn = await connectionOf(ctx, clerkUserId);
    if (conn) await ctx.db.patch(conn._id, { locationId, locationName });
  },
});

/**
 * Square webhooks: `order.created`, `order.updated` and
 * `oauth.authorization.revoked`. The signature is checked against the exact
 * notification URL. Work is a single quick mutation, so Square gets its 200
 * well within its timeout; a 500 makes Square retry.
 */
export const squareWebhook = httpAction(async (ctx, request) => {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!signatureKey) {
    console.error("SQUARE_WEBHOOK_SIGNATURE_KEY is not set; rejecting Square webhook.");
    return new Response("Webhook not configured", { status: 500 });
  }

  const body = await request.text();
  const valid = await verifySquareSignature(
    body,
    request.headers.get("x-square-hmacsha256-signature"),
    signatureKey,
    webhookUrl(),
  );
  if (!valid) return new Response("Invalid signature", { status: 403 });

  let event: SquareEvent;
  try {
    event = JSON.parse(body) as SquareEvent;
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const parsed = parseSquareEvent(event);
  try {
    if (parsed.kind === "order") {
      await ctx.runMutation(internal.square.recordOrder, {
        merchantId: parsed.merchantId,
        orderId: parsed.orderId,
        locationId: parsed.locationId,
        at: parsed.at,
      });
    } else if (parsed.kind === "revoked") {
      await ctx.runMutation(internal.square.markRevoked, { merchantId: parsed.merchantId });
    }
  } catch (err) {
    console.error(`Square webhook ${event.event_id} (${event.type}) failed:`, err);
    return new Response("Failed", { status: 500 });
  }
  return new Response(null, { status: 200 });
});
