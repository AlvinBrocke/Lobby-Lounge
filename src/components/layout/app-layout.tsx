"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { AnnouncementPlayer } from "@/components/announcements/AnnouncementPlayer";
import { useAnnouncementSchedule } from "@/hooks/useAnnouncementSchedule";
import { useScheduleAutoplay } from "@/hooks/useScheduleAutoplay";
import { GuidedTour } from "@/components/tour/GuidedTour";
import { PlayerBar } from "./player-bar";
import { MobileNav, Sidebar } from "./Sidebar";
import { Topbar } from "./topbar";
import { TourMap } from "./TourMap";
import { TrialBanner } from "./TrialBanner";

export function AppLayout({ children }: { children: React.ReactNode }) {
  // Lives here, not on /schedule, so the schedule runs on every app page.
  const schedule = useScheduleAutoplay();
  useAnnouncementSchedule();

  return (
    // `h-dvh`, not `h-screen`: on iPad Safari 100vh includes the area behind the
    // browser toolbar, which would push the player bar off the bottom.
    // The safe-area insets keep clear of the status bar and home indicator
    // when the app is launched from the home screen (see viewport in app/layout).
    <div className="app-shell h-dvh flex flex-col bg-background text-foreground overflow-hidden pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="relative flex-1 flex flex-col overflow-hidden min-w-0">
          <AnnouncementPlayer />
          <TrialBanner />
          <Topbar />
          <ScrollArea className="flex-1 h-full w-full">
            <div className="px-5 py-[18px] md:px-7 md:py-6 max-w-[1600px] mx-auto w-full pb-20">
              {children}
            </div>
          </ScrollArea>
          {/* Pinned to <main>, not the viewport, so it sits above the player bar on every breakpoint.
              The extra bottom padding above lets the last row scroll clear of it. */}
          <TourMap />
        </main>
      </div>

      <div className="app-chrome shrink-0 z-50 bg-shell pb-[env(safe-area-inset-bottom)]">
        <div data-tour="player-bar">
          <PlayerBar schedule={schedule} />
        </div>
        <MobileNav />
      </div>

      <GuidedTour />
    </div>
  );
}
