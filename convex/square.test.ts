import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, internal } from "./_generated/api";
import { encryptToken } from "./lib/square";
import schema from "./schema";

const OWNER = "user_owner123";
const SIG_KEY = "square_sig_key";
const SITE = "https://test.convex.site";
const WEBHOOK_URL = `${SITE}/square/webhook`;
const TOKEN_KEY = btoa(String.fromCharCode(...new Uint8Array(32).map((_, i) => i * 3)));

function setup() {
  return convexTest(schema, import.meta.glob("./**/*.ts"));
}

beforeEach(() => {
  vi.stubEnv("SQUARE_APPLICATION_ID", "sandbox-sq0idb-app");
  vi.stubEnv("SQUARE_APPLICATION_SECRET", "sandbox-sq0csb-secret");
  vi.stubEnv("SQUARE_TOKEN_KEY", TOKEN_KEY);
  vi.stubEnv("SQUARE_WEBHOOK_SIGNATURE_KEY", SIG_KEY);
  vi.stubEnv("CONVEX_SITE_URL", SITE);
  vi.stubEnv("SITE_URL", "https://www.lobbyloungemusic.com");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

async function sign(body: string, url = WEBHOOK_URL, key = SIG_KEY) {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode(url + body)));
  return btoa(String.fromCharCode(...sig));
}

async function connect(t: ReturnType<typeof setup>, extra: Record<string, unknown> = {}) {
  const accessTokenEnc = await encryptToken("EAAA-access", TOKEN_KEY);
  return await t.run((ctx) =>
    ctx.db.insert("squareConnections", {
      clerkUserId: OWNER,
      merchantId: "M1",
      accessTokenEnc,
      accessTokenExpiresAt: Date.now() + 30 * 86_400_000,
      status: "connected",
      locationId: "L1",
      locationName: "Main Street",
      connectedAt: Date.now(),
      ...extra,
    }),
  );
}

function orderEvent(orderId: string, locationId = "L1", type = "order.created", at = new Date().toISOString()) {
  const key = type === "order.created" ? "order_created" : "order_updated";
  return JSON.stringify({
    merchant_id: "M1",
    type,
    event_id: `evt_${orderId}_${type}`,
    data: { type: key, id: orderId, object: { [key]: { order_id: orderId, location_id: locationId, created_at: at } } },
  });
}

async function post(t: ReturnType<typeof setup>, body: string, signature?: string) {
  return await t.fetch("/square/webhook", {
    method: "POST",
    headers: { "x-square-hmacsha256-signature": signature ?? (await sign(body)) },
    body,
  });
}

const orders = (t: ReturnType<typeof setup>) => t.run((ctx) => ctx.db.query("posOrders").collect());
const connection = (t: ReturnType<typeof setup>) => t.run((ctx) => ctx.db.query("squareConnections").first());

describe("square webhook", () => {
  it("stores the time of an order at the venue's location", async () => {
    const t = setup();
    await connect(t);
    const res = await post(t, orderEvent("O1"));
    expect(res.status).toBe(200);
    const rows = await orders(t);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ clerkUserId: OWNER, source: "square", orderId: "O1" });
    expect((await connection(t))?.lastOrderAt).toBe(rows[0].at);
  });

  it("counts each order once across retries and updates", async () => {
    const t = setup();
    await connect(t);
    await post(t, orderEvent("O1"));
    await post(t, orderEvent("O1"));
    await post(t, orderEvent("O1", "L1", "order.updated"));
    expect(await orders(t)).toHaveLength(1);
  });

  it("ignores orders from other locations", async () => {
    const t = setup();
    await connect(t);
    await post(t, orderEvent("O2", "L_OTHER"));
    expect(await orders(t)).toHaveLength(0);
  });

  it("ignores orders until a location is picked", async () => {
    const t = setup();
    await connect(t, { locationId: undefined, locationName: undefined });
    await post(t, orderEvent("O1"));
    expect(await orders(t)).toHaveLength(0);
  });

  it("rejects a bad signature and stores nothing", async () => {
    const t = setup();
    await connect(t);
    const body = orderEvent("O1");
    expect((await post(t, body, await sign(body, WEBHOOK_URL, "wrong"))).status).toBe(403);
    expect((await post(t, body, "")).status).toBe(403);
    expect(await orders(t)).toHaveLength(0);
  });

  it("refuses webhooks when the signature key isn't set", async () => {
    vi.stubEnv("SQUARE_WEBHOOK_SIGNATURE_KEY", "");
    const t = setup();
    expect((await post(t, orderEvent("O1"))).status).toBe(500);
  });

  it("marks the connection revoked when the venue removes the app in Square", async () => {
    const t = setup();
    await connect(t);
    const body = JSON.stringify({
      merchant_id: "M1",
      type: "oauth.authorization.revoked",
      event_id: "e_rev",
      data: { type: "revocation", object: { revocation: { revoker_type: "MERCHANT" } } },
    });
    expect((await post(t, body)).status).toBe(200);
    expect((await connection(t))?.status).toBe("revoked");
    // A revoked connection stops counting orders.
    await post(t, orderEvent("O9"));
    expect(await orders(t)).toHaveLength(0);
  });

  it("acknowledges events it doesn't use", async () => {
    const t = setup();
    const body = JSON.stringify({ merchant_id: "M1", type: "payment.created", event_id: "e" });
    expect((await post(t, body)).status).toBe(200);
  });
});

describe("square.status", () => {
  it("reports the connection without any tokens", async () => {
    const t = setup();
    await connect(t);
    const s = await t.withIdentity({ subject: OWNER }).query(api.square.status, {});
    expect(s.configured).toBe(true);
    expect(s.connection).toMatchObject({ status: "connected", locationName: "Main Street", needsAttention: false });
    expect(JSON.stringify(s)).not.toMatch(/accessToken|refreshToken|v1\./);
  });

  it("says when Square isn't configured on the deployment", async () => {
    vi.stubEnv("SQUARE_APPLICATION_SECRET", "");
    const t = setup();
    const s = await t.withIdentity({ subject: OWNER }).query(api.square.status, {});
    expect(s).toMatchObject({ configured: false, connection: null });
  });
});

describe("square.startConnect", () => {
  it("returns Square's sign-in URL with a one-time state", async () => {
    const t = setup();
    const url = new URL(await t.withIdentity({ subject: OWNER, name: "Jo" }).action(api.square.startConnect, {}));
    expect(url.origin).toBe("https://connect.squareupsandbox.com");
    expect(url.searchParams.get("redirect_uri")).toBe(`${SITE}/square/oauth/callback`);
    const state = url.searchParams.get("state")!;
    const first = await t.mutation(internal.square.consumeState, { state });
    expect(first).toEqual({ clerkUserId: OWNER, actorId: OWNER, actorName: "Jo" });
    expect(await t.mutation(internal.square.consumeState, { state })).toBeNull();
  });

  it("keeps curators out", async () => {
    const t = setup();
    const curator = t.withIdentity({ subject: "user_curator", venue_owner: OWNER, org_role: "org:member" });
    await expect(curator.action(api.square.startConnect, {})).rejects.toThrow(/Only venue admins/);
  });

  it("lets an org admin connect for the owner", async () => {
    const t = setup();
    const admin = t.withIdentity({ subject: "user_admin", venue_owner: OWNER, org_role: "org:admin" });
    const url = new URL(await admin.action(api.square.startConnect, {}));
    const who = await t.mutation(internal.square.consumeState, { state: url.searchParams.get("state")! });
    expect(who?.clerkUserId).toBe(OWNER);
  });

  it("explains when Square isn't set up", async () => {
    vi.stubEnv("SQUARE_APPLICATION_ID", "");
    const t = setup();
    await expect(t.withIdentity({ subject: OWNER }).action(api.square.startConnect, {})).rejects.toThrow(/isn't set up/);
  });
});

describe("square OAuth callback", () => {
  async function stateFor(t: ReturnType<typeof setup>) {
    const url = new URL(await t.withIdentity({ subject: OWNER, name: "Jo" }).action(api.square.startConnect, {}));
    return url.searchParams.get("state")!;
  }

  it("stores encrypted tokens, picks the only location and returns to Settings", async () => {
    const t = setup();
    const state = await stateFor(t);
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith("/oauth2/token")) {
        return Response.json({
          access_token: "EAAA-new-access",
          refresh_token: "EQAA-refresh",
          expires_at: "2026-12-18T00:00:00Z",
          merchant_id: "M1",
        });
      }
      return Response.json({
        locations: [
          { id: "L1", name: "Main Street", status: "ACTIVE", coordinates: { latitude: 40.712776, longitude: -74.005974 } },
        ],
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await t.fetch(`/square/oauth/callback?code=abc&state=${state}`, { method: "GET" });
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe(
      "https://www.lobbyloungemusic.com/settings?tab=integrations&square=connected",
    );
    const conn = await connection(t);
    expect(conn).toMatchObject({
      merchantId: "M1",
      status: "connected",
      locationId: "L1",
      locationName: "Main Street",
      latitude: 40.71,
      longitude: -74.01,
    });
    expect(conn?.accessTokenEnc).not.toContain("EAAA");
    expect(conn?.refreshTokenEnc).not.toContain("EQAA");
    const [tokenUrl, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(tokenUrl).toBe("https://connect.squareupsandbox.com/oauth2/token");
    expect((init.headers as Record<string, string>)["Square-Version"]).toBe("2026-11-18");
    expect(JSON.parse(init.body as string)).toMatchObject({ grant_type: "authorization_code", code: "abc" });
    const log = await t.run((ctx) => ctx.db.query("activity").collect());
    expect(log.map((r) => r.summary)).toContain("Connected Square");
  });

  it("leaves the location for the venue to pick when there are several", async () => {
    const t = setup();
    const state = await stateFor(t);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        url.endsWith("/oauth2/token")
          ? Response.json({ access_token: "a", refresh_token: "r", expires_at: "2026-12-18T00:00:00Z", merchant_id: "M1" })
          : Response.json({ locations: [{ id: "L1", status: "ACTIVE" }, { id: "L2", status: "ACTIVE" }] }),
      ),
    );
    await t.fetch(`/square/oauth/callback?code=abc&state=${state}`, { method: "GET" });
    expect((await connection(t))?.locationId).toBeUndefined();
  });

  it("rejects an unknown or reused state without calling Square", async () => {
    const t = setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const res = await t.fetch("/square/oauth/callback?code=abc&state=forged", { method: "GET" });
    expect(res.headers.get("Location")).toMatch(/square=expired$/);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(await connection(t)).toBeNull();
  });

  it("handles the venue pressing Deny", async () => {
    const t = setup();
    const state = await stateFor(t);
    const res = await t.fetch(`/square/oauth/callback?error=access_denied&state=${state}`, { method: "GET" });
    expect(res.headers.get("Location")).toMatch(/square=denied$/);
    // The state is used up either way.
    expect(await t.mutation(internal.square.consumeState, { state })).toBeNull();
  });

  it("reports a failed token exchange", async () => {
    const t = setup();
    const state = await stateFor(t);
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ message: "bad code" }, { status: 400 })));
    const res = await t.fetch(`/square/oauth/callback?code=abc&state=${state}`, { method: "GET" });
    expect(res.headers.get("Location")).toMatch(/square=error$/);
    expect(await connection(t)).toBeNull();
  });
});

describe("square.selectLocation", () => {
  it("only accepts a location Square lists for the account", async () => {
    const t = setup();
    await connect(t, { locationId: undefined, locationName: undefined });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ locations: [{ id: "L2", name: "Harbour", status: "ACTIVE" }] })),
    );
    const owner = t.withIdentity({ subject: OWNER, name: "Jo" });
    await expect(owner.action(api.square.selectLocation, { locationId: "L_FAKE" })).rejects.toThrow(/isn't in your Square/);
    await owner.action(api.square.selectLocation, { locationId: "L2" });
    expect(await connection(t)).toMatchObject({ locationId: "L2", locationName: "Harbour" });
    // Harbour has no coordinates in Square, so none are stored.
    expect((await connection(t))?.latitude).toBeUndefined();
    const s = await owner.query(api.square.status, {});
    expect(s.connection?.hasCoordinates).toBe(false);
    expect(JSON.stringify(s)).not.toMatch(/latitude|longitude/);
  });
});

describe("square.disconnect", () => {
  it("revokes with Square, then forgets the tokens and the venue's order times", async () => {
    const t = setup();
    await connect(t);
    await post(t, orderEvent("O1"));
    const fetchMock = vi.fn(async () => Response.json({ success: true }));
    vi.stubGlobal("fetch", fetchMock);
    vi.useFakeTimers();
    await t.withIdentity({ subject: OWNER, name: "Jo" }).action(api.square.disconnect, {});
    await t.finishAllScheduledFunctions(vi.runAllTimers);
    vi.useRealTimers();

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://connect.squareupsandbox.com/oauth2/revoke");
    expect((init.headers as Record<string, string>).Authorization).toBe("Client sandbox-sq0csb-secret");
    expect(await connection(t)).toBeNull();
    expect(await orders(t)).toHaveLength(0);
  });
});

describe("square.refreshExpiring", () => {
  it("renews tokens close to expiry", async () => {
    const t = setup();
    await connect(t, {
      accessTokenExpiresAt: Date.now() + 2 * 86_400_000,
      refreshTokenEnc: await encryptToken("EQAA-refresh", TOKEN_KEY),
    });
    const fetchMock = vi.fn(async () =>
      Response.json({ access_token: "EAAA-renewed", expires_at: "2027-01-01T00:00:00Z", merchant_id: "M1" }),
    );
    vi.stubGlobal("fetch", fetchMock);
    await t.action(internal.square.refreshExpiring, {});
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toMatchObject({ grant_type: "refresh_token", refresh_token: "EQAA-refresh" });
    expect((await connection(t))?.accessTokenExpiresAt).toBe(Date.parse("2027-01-01T00:00:00Z"));
  });

  it("flags the connection when Square refuses", async () => {
    const t = setup();
    await connect(t, {
      accessTokenExpiresAt: Date.now() + 86_400_000,
      refreshTokenEnc: await encryptToken("EQAA-refresh", TOKEN_KEY),
    });
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ message: "revoked" }, { status: 401 })));
    await t.action(internal.square.refreshExpiring, {});
    const s = await t.withIdentity({ subject: OWNER }).query(api.square.status, {});
    expect(s.connection?.needsAttention).toBe(true);
  });

  it("leaves fresh tokens alone", async () => {
    const t = setup();
    await connect(t);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await t.action(internal.square.refreshExpiring, {});
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("square.purgeOld", () => {
  it("drops order times older than 60 days", async () => {
    const t = setup();
    const now = Date.now();
    await t.run(async (ctx) => {
      await ctx.db.insert("posOrders", { clerkUserId: OWNER, source: "square", orderId: "old", at: now - 61 * 86_400_000 });
      await ctx.db.insert("posOrders", { clerkUserId: OWNER, source: "square", orderId: "new", at: now - 86_400_000 });
    });
    await t.mutation(internal.square.purgeOld, {});
    expect((await orders(t)).map((o) => o.orderId)).toEqual(["new"]);
  });
});

describe("userProfiles.setPosOptOut", () => {
  it("lets admins hide the POS task, but not curators", async () => {
    const t = setup();
    await t.run((ctx) =>
      ctx.db.insert("userProfiles", { clerkUserId: OWNER, plan: "trial", genres: [], onboardingCompleted: true }),
    );
    const curator = t.withIdentity({ subject: "user_curator", venue_owner: OWNER, org_role: "org:member" });
    await expect(curator.mutation(api.userProfiles.setPosOptOut, { optOut: true })).rejects.toThrow(/Only venue admins/);
    await t.withIdentity({ subject: OWNER }).mutation(api.userProfiles.setPosOptOut, { optOut: true });
    const p = await t.run((ctx) => ctx.db.query("userProfiles").first());
    expect(p?.posOptOut).toBe(true);
  });
});
