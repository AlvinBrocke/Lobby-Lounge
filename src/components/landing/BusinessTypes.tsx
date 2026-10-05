import React from "react";
import { BedDouble, Coffee, UtensilsCrossed, Martini, ShoppingBag, Flower2 } from "lucide-react";

const types = [
  {
    title: "Hotels & lobbies",
    desc: "Calm, polished sound that welcomes guests at check-in and carries through to late-night arrivals.",
    icon: BedDouble,
  },
  {
    title: "Cafés & coffee shops",
    desc: "Bright mornings, mellow afternoons — a rotation that matches the pace of the day.",
    icon: Coffee,
  },
  {
    title: "Restaurants",
    desc: "Set the mood for lunch service and dinner rush without touching a dial mid-shift.",
    icon: UtensilsCrossed,
  },
  {
    title: "Bars & lounges",
    desc: "Build energy through happy hour and keep it going into the night.",
    icon: Martini,
  },
  {
    title: "Retail",
    desc: "Music that fits your brand keeps shoppers browsing longer and feeling at home.",
    icon: ShoppingBag,
  },
  {
    title: "Spas & wellness",
    desc: "Low-tempo, unhurried sound that lets guests switch off the moment they walk in.",
    icon: Flower2,
  },
];

export const BusinessTypes = () => (
  <section id="business-types" className="scroll-mt-20 py-24 md:py-32">
    <div className="ll-container grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
      <div data-ll-reveal className="md:sticky md:top-28 md:self-start">
        <p className="ll-eyebrow">Business types</p>
        <h2 className="ll-h2 mt-3">Built for the places people gather</h2>
        <p className="ll-lead mt-4">
          Whatever your space, there&apos;s a soundtrack for it — and a schedule that keeps it right all day.
        </p>
      </div>

      <ul className="grid gap-x-10 sm:grid-cols-2">
        {types.map(({ title, desc, icon: Icon }, i) => (
          <li
            key={title}
            data-ll-reveal
            data-ll-delay={i % 2 === 0 ? undefined : "1"}
            className="border-t border-ll-line py-7"
          >
            <Icon className="h-5 w-5 text-ll-teal-ink" strokeWidth={1.75} aria-hidden />
            <h3 className="ll-h3 mt-4">{title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ll-text-2">{desc}</p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
