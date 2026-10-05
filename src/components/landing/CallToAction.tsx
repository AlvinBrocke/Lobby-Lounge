import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// The page's one dark block: brand navy with the soundwave asset, kept static.
export const CallToAction = () => (
  <section className="ll-container pb-24 md:pb-32">
    <div className="relative overflow-hidden rounded-3xl bg-ll-navy px-6 py-16 text-white md:px-16 md:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20 mix-blend-screen"
        style={{ backgroundImage: "url('/images/LL soundwave3.png')" }}
      />

      <div className="relative max-w-xl">
        <h2 data-ll-reveal className="ll-h2">Start playing today</h2>
        <p data-ll-reveal data-ll-delay="1" className="mt-4 text-lg leading-relaxed text-white/75">
          Set the perfect atmosphere in minutes — just open the app. Free for your first month, no credit card required.
        </p>
        <div data-ll-reveal data-ll-delay="1" className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/signup" className="ll-btn ll-btn-light">
            Sign up now <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <a href="#pricing" className="ll-link rounded-sm text-[15px] font-medium text-white/80 underline-offset-4 hover:text-white hover:underline">
            View pricing
          </a>
        </div>
      </div>
    </div>
  </section>
);
