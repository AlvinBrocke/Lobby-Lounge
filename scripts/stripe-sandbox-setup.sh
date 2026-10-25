#!/usr/bin/env bash
# Points the Convex DEV deployment at the Stripe sandbox "LL Basic Plan Sandbox"
# (test mode). Never touches production: no --prod anywhere.
#
#   pnpm stripe:sandbox
#
# Then, in another terminal, forward webhooks to the local backend:
#   stripe listen --forward-to 127.0.0.1:3213/stripe/webhook
# and store the whsec_... it prints:
#   npx convex env set STRIPE_WEBHOOK_SECRET whsec_...
set -euo pipefail

# The sandbox's "L&L Basic Plan" — $20/month (prod_VVYQ846N0MITXu).
SANDBOX_PRICE_ID="price_1UUXJOBd9dxtZlQtO55WZMH7"
SITE_URL="${SITE_URL:-http://localhost:3000}"

echo "Sandbox secret key: Stripe Dashboard → switch to 'LL Basic Plan Sandbox' → Developers → API keys."
read -rsp "Paste the sk_test_... (or rk_test_...) key: " KEY
echo
if [[ "$KEY" != sk_test_* && "$KEY" != rk_test_* ]]; then
  echo "That isn't a test-mode key. Dev must use the sandbox, never live keys." >&2
  exit 1
fi

npx convex env set STRIPE_SECRET_KEY "$KEY"
npx convex env set STRIPE_PRICE_ID "$SANDBOX_PRICE_ID"
npx convex env set SITE_URL "$SITE_URL"

cat <<EOF

Done. Dev now uses the Stripe sandbox (price $SANDBOX_PRICE_ID, returns to $SITE_URL).
Next:
  1. stripe listen --forward-to 127.0.0.1:3213/stripe/webhook
  2. npx convex env set STRIPE_WEBHOOK_SECRET whsec_...   (the secret 'stripe listen' prints)
  3. Settings → Plan & billing → Add payment method, pay with 4242 4242 4242 4242.
EOF
