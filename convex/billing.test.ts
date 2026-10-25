import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { internal } from "./_generated/api";
import schema from "./schema";

const OWNER = "user_owner123";
const WEBHOOK_SECRET = "whsec_test_secret";

function setup() {
  return convexTest(schema, import.meta.glob("./**/*.ts"));
}

async function addProfile(t: ReturnType<typeof setup>, extra: Record<string, unknown> = {}) {
  await t.run((ctx) =>
    ctx.db.insert("userProfiles", {
      clerkUserId: OWNER,
      plan: "trial",
      genres: [],
      onboardingCompleted: true,
      ...extra,
    }),
  );
}

async function profile(t: ReturnType<typeof setup>) {
  return await t.run((ctx) =>
    ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", OWNER))
      .unique(),
  );
}

async function sign(payload: string, timestamp = Math.floor(Date.now() / 1000)) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(WEBHOOK_SECRET), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${timestamp}.${payload}`));
  const hex = Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
  return `t=${timestamp},v1=${hex}`;
}

describe("billing.syncSubscription", () => {
  it("puts a venue on the basic plan while its subscription is trialing", async () => {
    const t = setup();
    await addProfile(t);
    await t.mutation(internal.billing.syncSubscription, {
      clerkUserId: OWNER,
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_1",
      status: "trialing",
    });
    const p = await profile(t);
    expect(p?.plan).toBe("basic");
    expect(p?.stripeCustomerId).toBe("cus_1");
    expect(p?.stripeSubscriptionId).toBe("sub_1");
    expect(p?.subscriptionStatus).toBe("trialing");
  });

  it("keeps access while a payment is being retried", async () => {
    const t = setup();
    await addProfile(t);
    const result = await t.mutation(internal.billing.syncSubscription, {
      clerkUserId: OWNER,
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_1",
      status: "past_due",
    });
    expect(result).toBe("basic");
  });

  it("drops back to the trial rules when the subscription is cancelled", async () => {
    const t = setup();
    await addProfile(t, { plan: "basic", stripeCustomerId: "cus_1", stripeSubscriptionId: "sub_1" });
    await t.mutation(internal.billing.syncSubscription, {
      clerkUserId: OWNER,
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_1",
      status: "canceled",
    });
    const p = await profile(t);
    expect(p?.plan).toBe("trial");
    expect(p?.subscriptionStatus).toBe("canceled");
  });

  it("ignores an old subscription ending after a newer one started", async () => {
    const t = setup();
    await addProfile(t, { plan: "basic", stripeCustomerId: "cus_1", stripeSubscriptionId: "sub_new" });
    const result = await t.mutation(internal.billing.syncSubscription, {
      clerkUserId: OWNER,
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_old",
      status: "canceled",
    });
    expect(result).toBe("stale");
    expect((await profile(t))?.plan).toBe("basic");
  });

  it("finds the venue by Stripe customer when the metadata is missing", async () => {
    const t = setup();
    await addProfile(t, { stripeCustomerId: "cus_1" });
    await t.mutation(internal.billing.syncSubscription, {
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: "sub_1",
      status: "active",
    });
    expect((await profile(t))?.plan).toBe("basic");
  });

  it("does nothing for a subscription that matches no venue", async () => {
    const t = setup();
    const result = await t.mutation(internal.billing.syncSubscription, {
      stripeCustomerId: "cus_unknown",
      stripeSubscriptionId: "sub_1",
      status: "active",
    });
    expect(result).toBe("no_profile");
  });
});

describe("billing.saveCustomer", () => {
  it("keeps the first customer id if two checkouts race", async () => {
    const t = setup();
    await addProfile(t);
    const first = await t.mutation(internal.billing.saveCustomer, { clerkUserId: OWNER, stripeCustomerId: "cus_a" });
    const second = await t.mutation(internal.billing.saveCustomer, { clerkUserId: OWNER, stripeCustomerId: "cus_b" });
    expect(first).toBe("cus_a");
    expect(second).toBe("cus_a");
  });
});

describe("POST /stripe/webhook", () => {
  beforeEach(() => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", WEBHOOK_SECRET);
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("rejects a request with a bad signature", async () => {
    const t = setup();
    const body = JSON.stringify({ id: "evt_1", type: "customer.subscription.updated", data: { object: { id: "sub_1" } } });
    const res = await t.fetch("/stripe/webhook", {
      method: "POST",
      body,
      headers: { "stripe-signature": "t=1,v1=deadbeef" },
    });
    expect(res.status).toBe(400);
  });

  it("re-reads the subscription from Stripe and activates the venue", async () => {
    const t = setup();
    await addProfile(t);
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({ id: "sub_1", status: "trialing", customer: "cus_1", metadata: { clerkUserId: OWNER } }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const body = JSON.stringify({
      id: "evt_1",
      type: "checkout.session.completed",
      data: { object: { id: "cs_1", object: "checkout.session", mode: "subscription", subscription: "sub_1" } },
    });
    const res = await t.fetch("/stripe/webhook", {
      method: "POST",
      body,
      headers: { "stripe-signature": await sign(body) },
    });

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith("https://api.stripe.com/v1/subscriptions/sub_1", expect.anything());
    expect((await profile(t))?.plan).toBe("basic");
  });

  it("acknowledges events it doesn't act on without calling Stripe", async () => {
    const t = setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const body = JSON.stringify({ id: "evt_2", type: "invoice.paid", data: { object: { id: "in_1" } } });
    const res = await t.fetch("/stripe/webhook", {
      method: "POST",
      body,
      headers: { "stripe-signature": await sign(body) },
    });
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("asks Stripe to retry when the subscription can't be read", async () => {
    const t = setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: { message: "boom" } }), { status: 500 })),
    );
    const body = JSON.stringify({ id: "evt_3", type: "customer.subscription.deleted", data: { object: { id: "sub_1" } } });
    const res = await t.fetch("/stripe/webhook", {
      method: "POST",
      body,
      headers: { "stripe-signature": await sign(body) },
    });
    expect(res.status).toBe(500);
  });
});
