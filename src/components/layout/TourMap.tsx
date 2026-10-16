"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Book,
  BookOpen,
  Calendar,
  HelpCircle,
  LifeBuoy,
  List,
  Mail,
  PlayCircle,
  Send,
  Settings,
  Speaker,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Modal } from "@/components/playlists/Modal";
import { supportHref } from "@/lib/site";
import { cn } from "@/lib/utils";

type Stop = { name: string; href: string; icon: LucideIcon; blurb: string };

/** One stop per dashboard page, in the order a new venue would use them. */
const stops: Stop[] = [
  {
    name: "Playlists",
    href: "/playlists",
    icon: List,
    blurb: "Curated daytime and evening playlists. Search from the bar at the top, or build your own mix.",
  },
  {
    name: "Library",
    href: "/library",
    icon: Book,
    blurb: "Everything in one place: your playlists, daytime sets, evening & night, and genres.",
  },
  {
    name: "Schedule",
    href: "/schedule",
    icon: Calendar,
    blurb: "Set a playlist for every hour of the week — it repeats automatically.",
  },
  {
    name: "Announcements",
    href: "/announcements",
    icon: Send,
    blurb: "Create short voice messages and choose when they play.",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    blurb: "Venue details and your plan & billing. Forgot your password? Use “Forgot password” on the sign-in page.",
  },
];

/** Help Center sections (src/content/help.ts ids) worth a shortcut from inside the app. */
const guides: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Getting started", href: "/help#getting-started", icon: PlayCircle },
  { label: "Connecting your speakers", href: "/help#technical-guidelines", icon: Speaker },
  { label: "Troubleshooting", href: "/help#troubleshooting", icon: Wrench },
  { label: "All FAQs", href: "/help", icon: LifeBuoy },
  { label: "Blog & guides", href: "/blog", icon: BookOpen },
];

/**
 * The "?" button in the corner of every dashboard page. It opens the same map
 * every time (no "seen it" flag), so help is always one tap away.
 */
export function TourMap() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHere = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open the tour map: what each page does, guides and FAQs"
        title="Help & tour map"
        className="app-chrome absolute bottom-4 right-4 md:bottom-5 md:right-6 z-[3] w-10 h-10 touch:w-12 touch:h-12 rounded-full bg-primary text-primary-foreground shadow-[0_6px_20px_rgba(0,0,0,0.5)] flex items-center justify-center hover:ring-4 hover:ring-primary/20 transition-shadow"
      >
        <HelpCircle className="w-5 h-5 touch:w-6 touch:h-6" strokeWidth={2.2} />
      </button>

      {/* Portalled to <body> so it paints above the player bar, which is a later
          sibling of <main> with the same z-index. */}
      {open &&
        createPortal(
          <Modal
            title="Tour map"
            onClose={() => setOpen(false)}
            className="max-w-2xl max-h-[85dvh] overflow-y-auto"
          >
            <p className="text-xs text-muted-foreground -mt-3 mb-4">
              Where everything lives. Tap a stop to go there.
            </p>

            <nav aria-label="App pages" className="grid sm:grid-cols-2 gap-2">
              {stops.map(({ name, href, icon: Icon, blurb }) => {
                const here = isHere(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={here ? "page" : undefined}
                    className={cn(
                      "flex gap-3 p-3 rounded-xl border transition-colors",
                      here
                        ? "border-primary/40 bg-primary/10"
                        : "border-white/5 bg-secondary hover:border-primary/30",
                    )}
                  >
                    <span className="w-9 h-9 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                        {name}
                        {here && (
                          <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-primary">
                            You are here
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-muted-foreground mt-0.5 leading-relaxed">{blurb}</span>
                    </span>
                  </Link>
                );
              })}
              <div className="flex gap-3 p-3 rounded-xl border border-dashed border-white/10">
                <span className="w-9 h-9 shrink-0 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <PlayCircle className="w-[18px] h-[18px]" strokeWidth={1.8} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-foreground">Player bar</span>
                  <span className="block text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Along the bottom: play, pause, skip and see what&apos;s up next. Keep this tab open so the
                    music keeps playing.
                  </span>
                </span>
              </div>
            </nav>

            <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-faint mt-6 mb-2">
              Guides &amp; FAQs
            </h3>
            {/* New tab on purpose: /help and /blog sit outside the (main) layout, so
                navigating there in this tab would unmount the player and stop the music. */}
            <ul className="flex flex-wrap gap-2">
              {guides.map(({ label, href, icon: Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1.5 px-3 py-2 touch:py-2.5 rounded-full border border-primary/20 bg-secondary text-xs font-semibold text-foreground hover:border-primary transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    {label}
                    <ArrowUpRight className="w-3 h-3 text-faint" aria-hidden />
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={supportHref("Help from the app")}
                  className="inline-flex items-center gap-1.5 px-3 py-2 touch:py-2.5 rounded-full border border-primary/20 bg-secondary text-xs font-semibold text-foreground hover:border-primary transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  Contact support
                </a>
              </li>
            </ul>
          </Modal>,
          document.body,
        )}
    </>
  );
}
