/**
 * Accent colours a venue can brand the app with. Stored as the key, never a
 * free-form colour, so every option is one we've checked against the dark
 * `--primary-foreground` text (buttons, badges) for contrast. Values are the
 * HSL triplets `--primary` uses in globals.css.
 */
export const BRAND_COLORS = {
  teal: "171 75% 52%", // the house teal (the app runs in `.dark`, see globals.css)
  purple: "258 90% 72%",
  blue: "213 94% 62%",
  orange: "32 95% 55%",
  pink: "330 81% 65%",
  green: "142 69% 48%",
} as const;

export type BrandColor = keyof typeof BRAND_COLORS;

export const MAX_LOGO_BYTES = 2 * 1024 * 1024;
