import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, internal } from "./_generated/api";
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

describe("billing actions", () => {
  beforeEach(() => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
    vi.stubEnv("SITE_URL", "http://localhost:3000");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("rejects curators, who share the venue but aren't admins", async () => {
    const t = setup();
    await addProfile(t, { stripeCustomerId: "cus_1" });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const curator = t.withIdentity({ subject: "user_curator", venue_owner: OWNER, org_role: "org:member" });
    await expect(curator.action(api.billing.openPortal, {})).rejects.toThrow("Only venue admins");
    await expect(curator.action(api.billing.startCheckout, {})).rejects.toThrow("Only venue admins");
    // Fails closed if the JWT template has no org_role claim yet.
    const noRole = t.withIdentity({ subject: "user_staff", venue_owner: OWNER });
    await expect(noRole.action(api.billing.openPortal, {})).rejects.toThrow("Only venue admins");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("lets an admin open the owner's portal", async () => {
    const t = setup();
    await addProfile(t, { stripeCustomerId: "cus_1" });
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ url: "https://portal" }), { status: 200 })));
    const admin = t.withIdentity({ subject: "user_admin", venue_owner: OWNER, org_role: "org:admin" });
    expect(await admin.action(api.billing.openPortal, {})).toBe("https://portal");
  });

  it("bills the owner's email when an admin subscribes", async () => {
    const t = setup();
    vi.stubEnv("STRIPE_PRICE_ID", "price_1");
    await addProfile(t, { email: "owner@venue.test" });
    const fetchMock = vi.fn(async (url: string, _init: RequestInit) =>
      new Response(JSON.stringify(url.endsWith("/customers") ? { id: "cus_new" } : { url: "https://checkout" }), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const admin = t.withIdentity({
      subject: "user_admin",
      venue_owner: OWNER,
      org_role: "org:admin",
      email: "admin@venue.test",
    });
    expect(await admin.action(api.billing.startCheckout, {})).toBe("https://checkout");
    const customerBody = new URLSearchParams(fetchMock.mock.calls[0]![1].body as string);
    expect(customerBody.get("email")).toBe("owner@venue.test");
  });

  it("won't open a second checkout while Stripe already has a live subscription", async () => {
    const t = setup();
    // The webhook hasn't landed yet, so the profile still says "trial".
    await addProfile(t, { stripeCustomerId: "cus_1" });
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({ data: [{ id: "sub_1", status: "trialing", customer: "cus_1", metadata: {} }] }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    await expect(t.withIdentity({ subject: OWNER }).action(api.billing.startCheckout, {})).rejects.toThrow(
      "already active",
    );
    expect(fetchMock).toHaveBeenCalledTimes(1); // the subscription lookup, no checkout session
    expect((await profile(t))?.plan).toBe("basic"); // and it caught the profile up
  });
});
