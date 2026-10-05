// Inbox behind every "Submit a request" link on /blog and /help.
export const SUPPORT_EMAIL = "hello@lobbylounge.com";

export const supportHref = (subject = "Support request") =>
  `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;

// Absolute origin for the sitemap. Set NEXT_PUBLIC_SITE_URL once a custom
// domain is live; until then the Vercel URL quoted in the Help Center is used.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://lobby-lounge.vercel.app").replace(/\/$/, "");
