import { httpRouter } from "convex/server";
import Stripe from "stripe";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

/**
 * Stripe webhook. Register `<CONVEX_SITE_URL>/stripe/webhook` in the Stripe
 * Dashboard for `checkout.session.completed` and
 * `customer.subscription.deleted`, and set its signing secret with
 * `npx convex env set STRIPE_WEBHOOK_SECRET whsec_...` (add `--prod` for live).
 */
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = request.headers.get("stripe-signature");
    if (!secret || !signature) return new Response("Not configured", { status: 400 });

    // Anyone can POST here; only a valid signature proves Stripe sent it. The
    // raw body must be verified before parsing, and Convex's default runtime
    // has Web Crypto, not Node's crypto, hence the async SubtleCrypto check.
    let event: Stripe.Event;
    try {
      event = await Stripe.webhooks.constructEventAsync(
        await request.text(),
        signature,
        secret,
        undefined,
        Stripe.createSubtleCryptoProvider(),
      );
    } catch {
      return new Response("Bad signature", { status: 400 });
    }

    // Stripe can deliver an event more than once; both mutations set fixed
    // values, so a repeat is harmless.
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customer = typeof session.customer === "string" ? session.customer : session.customer?.id;
        if (!session.client_reference_id || !customer) {
          // Paid through a link without our user id: match it up by hand with setPlan.
          console.error("Stripe checkout without client_reference_id/customer", session.id);
          break;
        }
        await ctx.runMutation(internal.userProfiles.activateSubscription, {
          clerkUserId: session.client_reference_id,
          stripeCustomerId: customer,
        });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await ctx.runMutation(internal.userProfiles.endSubscription, { stripeCustomerId: customer });
        break;
      }
    }
    // A thrown mutation (e.g. unknown Clerk id) returns 500, so Stripe retries
    // and flags the failure in its Dashboard instead of the payment going unnoticed.
    return new Response(null, { status: 200 });
  }),
});

export default http;
