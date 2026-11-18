import { httpRouter } from "convex/server";
import { stripeWebhook } from "./billing";
import { oauthCallback, squareWebhook } from "./square";

const http = httpRouter();

// Stripe → Dashboard → Developers → Webhooks: point the endpoint at
// `<NEXT_PUBLIC_CONVEX_SITE_URL>/stripe/webhook`. See CLAUDE.md → "Billing (Stripe)".
http.route({ path: "/stripe/webhook", method: "POST", handler: stripeWebhook });

// Square Developer Dashboard → OAuth: redirect URL `<NEXT_PUBLIC_CONVEX_SITE_URL>/square/oauth/callback`.
// Webhooks → subscription URL `<NEXT_PUBLIC_CONVEX_SITE_URL>/square/webhook`.
// See CLAUDE.md → "POS integrations (Square)".
http.route({ path: "/square/oauth/callback", method: "GET", handler: oauthCallback });
http.route({ path: "/square/webhook", method: "POST", handler: squareWebhook });

export default http;
