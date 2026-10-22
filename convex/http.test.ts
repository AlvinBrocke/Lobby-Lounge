import { convexTest } from "convex-test";
import Stripe from "stripe";
import { beforeAll, describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const USER = "user_stripe1";
const SECRET = "whsec_test";

beforeAll(() => {
  process.env.STRIPE_WEBHOOK_SECRET = SECRET;
});

async function setup() {
  const t = convexTest(schema, import.meta.glob("./**/*.ts"));
  const asUser = t.withIdentity({ subject: USER });
  await asUser.mutation(api.userProfiles.createOrUpdate, {});
  // Sends `event` the way Stripe does, signed with `secret`.
  const send = async (type: string, object: object, secret = SECRET) => {
    const payload = JSON.stringify({ id: "evt_1", object: "event", type, data: { object } });
    const header = await Stripe.webhooks.generateTestHeaderStringAsync({
      payload,
      secret,
      cryptoProvider: Stripe.createSubtleCryptoProvider(),
    });
    return t.fetch("/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": header },
      body: payload,
    });
  };
  const profile = () => asUser.query(api.userProfiles.get, {});
  return { send, profile };
}

describe("Stripe webhook", () => {
  it("rejects a bad signature without changing the plan", async () => {
    const { send, profile } = await setup();
    const res = await send(
      "checkout.session.completed",
      { id: "cs_1", client_reference_id: USER, customer: "cus_1" },
      "whsec_wrong",
    );
    expect(res.status).toBe(400);
    expect((await profile())?.plan).toBe("trial");
  });

  it("activates Basic on checkout, then ends access when the subscription is deleted", async () => {
    const { send, profile } = await setup();
    let res = await send("checkout.session.completed", {
      id: "cs_1",
      client_reference_id: USER,
      customer: "cus_1",
    });
    expect(res.status).toBe(200);
    expect((await profile())?.plan).toBe("basic");
    expect((await profile())?.stripeCustomerId).toBe("cus_1");

    const before = Date.now();
    res = await send("customer.subscription.deleted", { id: "sub_1", customer: "cus_1" });
    expect(res.status).toBe(200);
    const after = await profile();
    expect(after?.plan).toBe("trial");
    expect(after?.trialEndsAt).toBeGreaterThanOrEqual(before);
  });

  it("acknowledges checkouts without a user id and unknown customers", async () => {
    const { send, profile } = await setup();
    expect((await send("checkout.session.completed", { id: "cs_2", customer: "cus_2" })).status).toBe(200);
    expect((await send("customer.subscription.deleted", { id: "sub_2", customer: "cus_x" })).status).toBe(200);
    expect((await profile())?.plan).toBe("trial");
  });

  it("returns an error for a checkout naming an unknown user, so Stripe retries", async () => {
    const { send } = await setup();
    // convex-test rethrows; a real deployment answers 500 instead.
    await expect(
      send("checkout.session.completed", {
        id: "cs_3",
        client_reference_id: "user_nobody",
        customer: "cus_3",
      }),
    ).rejects.toThrow("No profile");
  });
});
