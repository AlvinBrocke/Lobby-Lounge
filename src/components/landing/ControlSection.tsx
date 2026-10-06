import React from "react";
import Image from "next/image";
import { CalendarClock, ListMusic, ListPlus, MonitorSmartphone } from "lucide-react";

const rows = [
  {
    title: "Playlists for every daypart",
    desc: "Lounge & Chill, Dinner Jazz, Morning Boost, Late Night Vibes — pick a playlist that fits the hour and press play.",
    icon: ListMusic,
  },
  {
    title: "Weekly scheduling",
    desc: "Assign a playlist to any hour of any day. Breakfast calm, lunch energy, evening wind-down — set once, runs every week.",
    icon: CalendarClock,
  },
  {
    title: "Your own playlists",
    desc: "Build playlists from the licensed catalogue for the moments that matter — a signature brunch mix, a Friday-night set.",
    icon: ListPlus,
  },
  {
    title: "Web app, any device",
    desc: "Nothing to install. Open the dashboard on the laptop behind the bar or the tablet at reception — it just works.",
    icon: MonitorSmartphone,
  },
];

export const ControlSection = () => (
  <section id="how-it-works" className="scroll-mt-20 border-t border-ll-line py-24 md:py-32">
    <div className="ll-container grid items-center gap-12 md:grid-cols-2 md:gap-20">
      <div data-ll-reveal>
        <Image
          src="/images/Playlist On Tablet mockup(3).jpg"
          alt="Choosing a playlist on the Lobby & Lounge dashboard"
          width={1332}
          height={1024}
          sizes="(min-width: 768px) 540px, 100vw"
          className="h-auto w-full rounded-2xl"
        />
      </div>

      <div data-ll-reveal data-ll-delay="1">
        <p className="ll-eyebrow">How it works</p>
        <h2 className="ll-h2 mt-3">One dashboard, your whole space</h2>
        <p className="ll-lead mt-4">
          Pick a curated playlist, build your own, or schedule the whole week — all from one place, on any device with a browser.
        </p>

        <ul className="mt-8 border-b border-ll-line">
          {rows.map(({ title, desc, icon: Icon }) => (
            <li key={title} className="flex gap-4 border-t border-ll-line py-5">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-ll-teal-ink" strokeWidth={1.75} aria-hidden />
              <div>
                <h3 className="text-base font-semibold tracking-tight">{title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-ll-text-2">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);
