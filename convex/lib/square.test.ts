import { describe, expect, it } from "vitest";
import {
  SQUARE_SCOPES,
  authorizeUrl,
  decryptToken,
  encryptToken,
  parseSquareEvent,
  randomState,
  roundedCoordinates,
  squareEnvironment,
  verifySquareSignature,
} from "./square";

const KEY = btoa(String.fromCharCode(...new Uint8Array(32).map((_, i) => i)));

async function squareSign(signatureKey: string, url: string, body: string) {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey("raw", enc.encode(signatureKey), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode(url + body)));
  return btoa(String.fromCharCode(...sig));
}

describe("authorizeUrl", () => {
  it("asks only for read access to locations and orders, with a fresh sign-in", () => {
    const url = new URL(authorizeUrl("sandbox", "sandbox-sq0idb-app", "st8", "https://x.convex.site/square/oauth/callback"));
    expect(url.origin).toBe("https://connect.squareupsandbox.com");
    expect(url.pathname).toBe("/oauth2/authorize");
    expect(url.searchParams.get("scope")).toBe("MERCHANT_PROFILE_READ ORDERS_READ");
    expect(url.searchParams.get("session")).toBe("false");
    expect(url.searchParams.get("state")).toBe("st8");
    expect(url.searchParams.get("redirect_uri")).toBe("https://x.convex.site/square/oauth/callback");
  });

  it("uses the production host only in production", () => {
    expect(authorizeUrl("production", "a", "s", "r")).toMatch(/^https:\/\/connect\.squareup\.com\//);
    expect(squareEnvironment(undefined)).toBe("sandbox");
    expect(squareEnvironment("production")).toBe("production");
  });

  it("never asks for payment, customer or staff scopes", () => {
    expect(SQUARE_SCOPES.some((s) => /PAYMENT|CUSTOMER|EMPLOYEE|TIMECARD/.test(s))).toBe(false);
  });
});

describe("verifySquareSignature", () => {
  const url = "https://x.convex.site/square/webhook";
  const body = '{"type":"order.created"}';

  it("accepts Square's signature over URL + body", async () => {
    const sig = await squareSign("sigkey", url, body);
    expect(await verifySquareSignature(body, sig, "sigkey", url)).toBe(true);
  });

  it("rejects a wrong key, a changed body, a different URL or no header", async () => {
    const sig = await squareSign("sigkey", url, body);
    expect(await verifySquareSignature(body, sig, "other", url)).toBe(false);
    expect(await verifySquareSignature(body + " ", sig, "sigkey", url)).toBe(false);
    expect(await verifySquareSignature(body, sig, "sigkey", url + "/")).toBe(false);
    expect(await verifySquareSignature(body, null, "sigkey", url)).toBe(false);
  });
});

describe("token encryption", () => {
  it("round-trips and never stores the plaintext", async () => {
    const sealed = await encryptToken("EAAAl-secret-token", KEY);
    expect(sealed).not.toContain("EAAAl");
    expect(sealed.startsWith("v1.")).toBe(true);
    expect(await decryptToken(sealed, KEY)).toBe("EAAAl-secret-token");
  });

  it("uses a fresh IV each time", async () => {
    expect(await encryptToken("t", KEY)).not.toBe(await encryptToken("t", KEY));
  });

  it("fails with a different key", async () => {
    const other = btoa(String.fromCharCode(...new Uint8Array(32).fill(7)));
    await expect(decryptToken(await encryptToken("t", KEY), other)).rejects.toThrow();
  });

  it("rejects a key that isn't 32 bytes", async () => {
    await expect(encryptToken("t", btoa("short"))).rejects.toThrow(/32 bytes/);
  });
});

describe("randomState", () => {
  it("is URL-safe and unique", () => {
    const a = randomState();
    expect(a).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(randomState()).not.toBe(a);
  });
});

describe("parseSquareEvent", () => {
  it("reads order.created", () => {
    expect(
      parseSquareEvent({
        merchant_id: "M1",
        type: "order.created",
        event_id: "e1",
        data: {
          type: "order_created",
          id: "O1",
          object: { order_created: { order_id: "O1", location_id: "L1", created_at: "2026-11-18T20:00:00Z" } },
        },
      }),
    ).toEqual({ kind: "order", merchantId: "M1", orderId: "O1", locationId: "L1", at: Date.parse("2026-11-18T20:00:00Z") });
  });

  it("dates order.updated by the order's creation, not the update", () => {
    const parsed = parseSquareEvent({
      merchant_id: "M1",
      type: "order.updated",
      event_id: "e2",
      created_at: "2026-11-20T09:00:00Z",
      data: {
        object: {
          order_updated: {
            order_id: "O1",
            location_id: "L1",
            created_at: "2026-11-18T20:00:00Z",
            updated_at: "2026-11-20T09:00:00Z",
          },
        },
      },
    });
    expect(parsed).toMatchObject({ kind: "order", at: Date.parse("2026-11-18T20:00:00Z") });
  });

  it("reads oauth.authorization.revoked", () => {
    expect(
      parseSquareEvent({
        merchant_id: "M1",
        type: "oauth.authorization.revoked",
        event_id: "e3",
        data: { type: "revocation", object: { revocation: { revoker_type: "MERCHANT" } } },
      }),
    ).toEqual({ kind: "revoked", merchantId: "M1" });
  });

  it("ignores other events and incomplete orders", () => {
    expect(parseSquareEvent({ merchant_id: "M1", type: "payment.created", event_id: "e" }).kind).toBe("ignored");
    expect(parseSquareEvent({ merchant_id: "M1", type: "order.created", event_id: "e", data: {} }).kind).toBe("ignored");
    expect(parseSquareEvent({ type: "order.created", event_id: "e" }).kind).toBe("ignored");
  });
});

describe("roundedCoordinates", () => {
  it("rounds to about 1 km", () => {
    expect(roundedCoordinates({ id: "L", coordinates: { latitude: 40.712776, longitude: -74.005974 } })).toEqual({
      latitude: 40.71,
      longitude: -74.01,
    });
  });

  it("is null when Square has none or they're nonsense", () => {
    expect(roundedCoordinates({ id: "L" })).toBeNull();
    expect(roundedCoordinates({ id: "L", coordinates: { latitude: 40.7 } })).toBeNull();
    expect(roundedCoordinates({ id: "L", coordinates: { latitude: 0, longitude: 0 } })).toBeNull();
    expect(roundedCoordinates({ id: "L", coordinates: { latitude: 120, longitude: 10 } })).toBeNull();
  });
});
