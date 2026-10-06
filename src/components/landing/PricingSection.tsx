import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";

const plan = {
  name: "L&L Basic",
  price: "$20",
  period: "/ month",
  tag: "Free for 1 month",
  desc: "Everything a single venue needs to sound great.",
  features: [
    "Full licensed catalogue — 1,000+ tracks",
    "Curated playlists & weekly scheduling",
    "Your own playlists",
    "Web app — any device",
    "No credit card to start — cancel anytime",
  ],
  cta: "Start free trial",
  ctaHref: "/signup",
};

export const PricingSection = () => (
  <section id="pricing" className="scroll-mt-20 py-24 md:py-32">
    <div className="ll-container grid gap-12 md:grid-cols-[1fr_440px] md:items-start md:gap-20">
      <div data-ll-reveal className="md:pt-6">
        <p className="ll-eyebrow">Pricing</p>
        <h2 className="ll-h2 mt-3">One simple plan</h2>
        <p className="ll-lead mt-4">
          Free for your first month. No credit card, no commitment — add a payment method only when your trial ends.
        </p>
        <p className="mt-6 text-sm text-ll-text-2">
          Prices in USD. Music pauses at the end of your free month until a payment method is added.
        </p>
      </div>

      <article
        data-ll-reveal
        data-ll-delay="1"
        className="flex flex-col rounded-2xl border border-ll-line bg-white p-7 shadow-[0_24px_48px_-32px_rgba(21,31,108,0.35)] md:p-8"
      >
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-semibold">{plan.name}</h3>
          <span className="rounded-md bg-[#E3F2F1] px-2.5 py-1 text-[13px] font-medium text-ll-teal-ink">
            {plan.tag}
          </span>
        </div>

        <p className="mt-6 flex items-baseline gap-1.5">
          <span className="text-5xl font-semibold tracking-[-0.03em] tabular-nums">{plan.price}</span>
          <span className="text-[15px] text-ll-text-2">{plan.period}</span>
        </p>
        <p className="mt-3 text-[15px] text-ll-text-2">{plan.desc}</p>

        <ul className="mt-7 grid gap-3 border-t border-ll-line pt-7">
          {plan.features.map((f) => (
            <li key={f} className="flex gap-3 text-[15px] leading-snug">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-ll-teal-ink" strokeWidth={2.25} aria-hidden /> {f}
            </li>
          ))}
        </ul>

        <Link href={plan.ctaHref} className="ll-btn ll-btn-primary mt-8 w-full">
          {plan.cta}
        </Link>
      </article>
    </div>
  </section>
);
