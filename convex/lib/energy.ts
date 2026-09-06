/**
 * Jamendo exposes no track-level energy field, so we approximate it from the
 * channel's category. Shared by the sync action (`jamendo.syncChannel`) and the
 * backfill (`tracks.backfillEnergy`) so the two can never disagree about what a
 * given category means.
 */
export const CATEGORY_ENERGY: Record<string, Energy> = {
  Relaxing: "low",
  Wellness: "low",
  Elegant: "low",
  Productivity: "mid",
  Upbeat: "high",
  Energetic: "high",
};

export type Energy = "low" | "mid" | "high";

/** Energy for a channel/track category, defaulting to "mid" for unknown ones. */
export function energyForCategory(category: string | undefined | null): Energy {
  return CATEGORY_ENERGY[category ?? ""] ?? "mid";
}
