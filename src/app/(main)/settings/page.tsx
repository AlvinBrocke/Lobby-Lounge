"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { BillingPanel } from "@/components/settings/BillingPanel";
import { StaffPanel } from "@/components/settings/StaffPanel";
import { PreferencesPanel } from "@/components/settings/PreferencesPanel";
import { VenuePanel } from "@/components/settings/VenuePanel";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "venue", label: "Venue details" },
  { key: "staff", label: "Zone & staff", adminOnly: true },
  { key: "billing", label: "Plan & billing", adminOnly: true },
  { key: "preferences", label: "Preferences" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export default function SettingsPage() {
  const router = useRouter();
  // The tab is in the URL (`?tab=billing`) so the account menu and the old
  // /account route can link straight to it.
  const tabParam = useSearchParams().get("tab");
  // Curators (Clerk's org:member) run the music but not the team or the money.
  // Solo accounts have no org role and see everything.
  const isCurator = useAuth().orgRole === "org:member";
  const tabs = TABS.filter((t) => !(isCurator && "adminOnly" in t));
  const tab: TabKey = tabs.some((t) => t.key === tabParam) ? (tabParam as TabKey) : "venue";

  return (
    // Negative margins pull the header band edge-to-edge inside the page padding.
    <div className="-mx-5 -mt-[18px] md:-mx-7 md:-mt-6">
      <div className="px-5 md:px-7 pt-5 bg-shell border-b border-primary/[0.08]">
        <h1 className="text-[22px] font-extrabold tracking-tight text-foreground mb-[18px]">Settings</h1>
        <div role="tablist" className="flex gap-0.5 overflow-x-auto scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => router.replace(t.key === "venue" ? "/settings" : `/settings?tab=${t.key}`, { scroll: false })}
              className={cn(
                "relative px-[13px] pt-[9px] pb-[11px] whitespace-nowrap text-[11px] transition-colors",
                tab === t.key ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {tab === t.key && (
                <span className="absolute left-2.5 right-2.5 bottom-0 h-0.5 rounded-sm bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 md:px-7 pt-[22px] pb-8">
        {tab === "venue" && <VenuePanel />}
        {tab === "staff" && <StaffPanel />}
        {tab === "preferences" && <PreferencesPanel />}
        {tab === "billing" && <BillingPanel />}
      </div>
    </div>
  );
}
