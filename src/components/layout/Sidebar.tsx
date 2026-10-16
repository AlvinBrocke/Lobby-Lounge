"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { Book, Calendar, List, Send, Settings } from "lucide-react";
import { api } from "@convex/_generated/api";
import { UpNext, panel } from "@/components/player/UpNext";
import { useNow } from "@/hooks/useNow";
import { isLiveToday } from "@/lib/announcements";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Library", short: "Library", href: "/library", icon: Book },
  { name: "Schedule", short: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Playlists", short: "Playlists", href: "/playlists", icon: List },
  // The icon rail is too narrow for the full word.
  { name: "Announcements", short: "Announce", href: "/announcements", icon: Send },
  { name: "Settings", short: "Settings", href: "/settings", icon: Settings },
];

function useLiveAnnouncementCount() {
  const { isAuthenticated } = useConvexAuth();
  // Same query as the announcement scheduler, so Convex serves both from one subscription.
  const announcements = useQuery(api.announcements.listByUser, isAuthenticated ? {} : "skip");
  const now = useNow(60_000);
  return (announcements ?? []).filter((a) => !a.paused && isLiveToday(a, now)).length;
}

function useIsActive() {
  const pathname = usePathname();
  // Prefix match so /playlists/[id] keeps "Playlists" highlighted.
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

function LiveBadge({ count, className }: { count: number; className?: string }) {
  if (count === 0) return null;
  return (
    <span
      title={`${count} playing today`}
      className={cn(
        "text-[9px] font-bold bg-primary text-primary-foreground rounded-full px-[5px] py-px",
        className,
      )}
    >
      {count}
    </span>
  );
}

/**
 * Two layouts from one tree, switched by breakpoint:
 * - `lg`+ (desktop, iPad landscape): full 228px sidebar with labels and Up Next.
 * - `md`–`lg` (iPad portrait): an 88px icon rail, so content keeps its width.
 *   Up Next moves to the player bar's queue button.
 * Below `md`, it's hidden and `MobileNav` takes over.
 */
export function Sidebar() {
  const isActive = useIsActive();
  const liveCount = useLiveAnnouncementCount();

  return (
    <aside className="app-chrome hidden md:flex w-[88px] lg:w-[228px] shrink-0 z-[2] flex-col gap-2.5 px-2 lg:px-2.5 py-3 bg-shell shadow-[4px_0_24px_rgba(0,0,0,0.45)] overflow-y-auto">
      <Link
        href="/playlists"
        aria-label="Lobby & Lounge home"
        className="h-[42px] shrink-0 flex items-center justify-center lg:justify-start px-1"
      >
        <Image
          src="/images/ll-icon-white.png"
          alt=""
          width={24}
          height={31}
          priority
          className="object-contain lg:hidden"
        />
        <Image
          src="/images/ll-logo-white.png"
          alt="Lobby & Lounge"
          width={81}
          height={34}
          priority
          className="object-contain hidden lg:block"
        />
      </Link>

      <nav className={cn(panel, "shrink-0 flex flex-col gap-1 lg:gap-0.5 px-1 lg:px-1.5 py-1.5 lg:py-2")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.name}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center rounded-md transition-colors",
                // Rail: icon over a small label, a 56px-tall tap target.
                "flex-col justify-center gap-1 h-14 text-[10px] font-medium",
                // Full sidebar: icon beside the label, accent bar on the left.
                "lg:flex-row lg:justify-start lg:gap-2.5 lg:h-auto lg:px-2.5 lg:py-[9px] touch:lg:py-3 lg:text-[13px] lg:font-normal lg:border-l-2",
                active
                  ? "bg-primary/10 lg:border-primary text-primary lg:font-semibold"
                  : "lg:border-transparent text-muted-foreground can-hover:hover:bg-primary/5 active:bg-primary/5",
              )}
            >
              <Icon
                className={cn("w-5 h-5 lg:w-[18px] lg:h-[18px] shrink-0", active ? "text-primary" : "text-faint")}
                strokeWidth={1.6}
              />
              <span className="lg:hidden leading-none">{item.short}</span>
              <span className="hidden lg:block flex-1">{item.name}</span>
              {item.href === "/announcements" && (
                <LiveBadge count={liveCount} className="absolute top-1.5 right-2 lg:static" />
              )}
            </Link>
          );
        })}
      </nav>

      <UpNext className="hidden lg:flex" />
    </aside>
  );
}

/** Bottom tab bar for narrow screens, where there's no room for the rail. */
export function MobileNav() {
  const isActive = useIsActive();
  const liveCount = useLiveAnnouncementCount();

  return (
    <nav className="app-chrome md:hidden flex border-t border-white/5 bg-shell">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex-1 h-14 flex flex-col items-center justify-center gap-1 text-[10px] font-medium",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="w-5 h-5" strokeWidth={1.6} />
            {item.short}
            {item.href === "/announcements" && (
              <LiveBadge count={liveCount} className="absolute top-1.5 left-1/2 ml-2" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
