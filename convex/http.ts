import { httpRouter } from "convex/server";
import { stripeWebhook } from "./billing";

const http = httpRouter();

// Stripe → Dashboard → Developers → Webhooks: point the endpoint at
// `<NEXT_PUBLIC_CONVEX_SITE_URL>/stripe/webhook`. See CLAUDE.md → "Billing (Stripe)".
http.route({ path: "/stripe/webhook", method: "POST", handler: stripeWebhook });

export default http;
