#!/usr/bin/env bash
# Vercel's build command (set in vercel.json).
#
# Production builds have CONVEX_DEPLOY_KEY (scoped to Production in Vercel), so
# they push convex/ to the production deployment and then build Next.js against
# it. Preview builds have no key, so they skip the Convex push and just build
# Next.js against whatever NEXT_PUBLIC_CONVEX_URL the Preview environment sets —
# a PR branch can never change the functions the live site runs.
set -euo pipefail

if [ -n "${CONVEX_DEPLOY_KEY:-}" ]; then
  echo "CONVEX_DEPLOY_KEY set: deploying Convex functions, then building Next.js"
  exec pnpm exec convex deploy --cmd 'pnpm build'
else
  echo "No CONVEX_DEPLOY_KEY: skipping Convex deploy, building Next.js only"
  exec pnpm build
fi
