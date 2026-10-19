/** Settings page tabs. Curators (Clerk's org:member) don't get the `adminOnly` ones. */
export const SETTINGS_TABS = [
  { key: "venue", label: "Venue details" },
  { key: "staff", label: "Zone & staff", adminOnly: true },
  { key: "billing", label: "Plan & billing", adminOnly: true },
  { key: "preferences", label: "Preferences" },
  { key: "activity", label: "Activity log" },
] as const;

export type SettingsTabKey = (typeof SETTINGS_TABS)[number]["key"];

export function visibleTabs(isCurator: boolean) {
  return SETTINGS_TABS.filter((t) => !(isCurator && "adminOnly" in t));
}
