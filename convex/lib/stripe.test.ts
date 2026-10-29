import { describe, expect, it } from "vitest";
import { assertKeyMatchesSite, formEncode, isLiveSubscription, subscriptionIdFor, verifyStripeSignature, type StripeEvent } from "./stripe";

const SECRET = "whsec_test";

async function sign(payload: string, timestamp: number, secret = SECRET) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${timestamp}.${payload}`));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

describe("formEncode", () => {
  it("encodes nested objects and arrays the way Stripe expects", () => {
    expect(
      formEncode({
        mode: "subscription",
        line_items: [{ price: "price_1", quantity: 1 }],
        subscription_data: { metadata: { clerkUserId: "user_1" }, trial_end: null },
        success_url: "https://x.test/settings?tab=billing&checkout=success",
      }),
    ).toBe(
      "mode=subscription" +
        "&line_items%5B0%5D%5Bprice%5D=price_1" +
        "&line_items%5B0%5D%5Bquantity%5D=1" +
        "&subscription_data%5Bmetadata%5D%5BclerkUserId%5D=user_1" +
        "&success_url=https%3A%2F%2Fx.test%2Fsettings%3Ftab%3Dbilling%26checkout%3Dsuccess",
    );
  });
});

describe("verifyStripeSignature", () => {
  const payload = '{"id":"evt_1"}';
  const now = 1_800_000_000;

  it("accepts a valid signature", async () => {
    const header = `t=${now},v1=${await sign(payload, now)}`;
    expect(await verifyStripeSignature(payload, header, SECRET, now)).toBe(true);
  });

  it("accepts when any of several v1 signatures matches (secret rotation)", async () => {
    const header = `t=${now},v1=${"0".repeat(64)},v1=${await sign(payload, now)}`;
    expect(await verifyStripeSignature(payload, header, SECRET, now)).toBe(true);
  });

  it("rejects a tampered body", async () => {
    const header = `t=${now},v1=${await sign(payload, now)}`;
    expect(await verifyStripeSignature('{"id":"evt_2"}', header, SECRET, now)).toBe(false);
  });

  it("rejects the wrong secret", async () => {
    const header = `t=${now},v1=${await sign(payload, now, "whsec_other")}`;
    expect(await verifyStripeSignature(payload, header, SECRET, now)).toBe(false);
  });

  it("rejects a signature older than five minutes", async () => {
    const then = now - 301;
    const header = `t=${then},v1=${await sign(payload, then)}`;
    expect(await verifyStripeSignature(payload, header, SECRET, now)).toBe(false);
  });

  it("rejects a missing or malformed header", async () => {
    expect(await verifyStripeSignature(payload, null, SECRET, now)).toBe(false);
    expect(await verifyStripeSignature(payload, "garbage", SECRET, now)).toBe(false);
  });
});

describe("subscriptionIdFor", () => {
  const event = (type: string, object: Record<string, unknown>) => ({ id: "evt", type, data: { object } }) as StripeEvent;

  it("reads subscription events and subscription checkouts", () => {
    expect(subscriptionIdFor(event("customer.subscription.updated", { id: "sub_1" }))).toBe("sub_1");
    expect(
      subscriptionIdFor(event("checkout.session.completed", { id: "cs_1", mode: "subscription", subscription: "sub_2" })),
    ).toBe("sub_2");
  });

  it("ignores everything else", () => {
    expect(subscriptionIdFor(event("checkout.session.completed", { id: "cs_1", mode: "payment" }))).toBeNull();
    expect(subscriptionIdFor(event("invoice.paid", { id: "in_1" }))).toBeNull();
  });
});

describe("isLiveSubscription", () => {
  it("keeps access for trialing, active and past_due only", () => {
    for (const s of ["trialing", "active", "past_due"]) expect(isLiveSubscription(s)).toBe(true);
    for (const s of ["canceled", "unpaid", "incomplete", "incomplete_expired", "paused"]) {
      expect(isLiveSubscription(s)).toBe(false);
    }
  });
});

describe("assertKeyMatchesSite", () => {
  it("refuses a live key on a local site", () => {
    expect(() => assertKeyMatchesSite("sk_live_abc", "http://localhost:3000")).toThrow();
    expect(() => assertKeyMatchesSite("rk_live_abc", "http://127.0.0.1:3000/")).toThrow();
  });

  it("allows test keys anywhere and live keys on the real site", () => {
    assertKeyMatchesSite("sk_test_abc", "http://localhost:3000");
    assertKeyMatchesSite("sk_live_abc", "https://www.lobbyloungemusic.com");
    assertKeyMatchesSite("sk_live_abc", "https://localhost.example.com");
  });
});
