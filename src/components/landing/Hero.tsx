import React from "react";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";

export const Hero = () => (
  <section className="pt-[132px] pb-20 md:pt-[156px] md:pb-28">
    <div className="ll-container grid items-center gap-14 md:grid-cols-[1fr_1.05fr] md:gap-16">
      <div>
        <p data-ll-reveal className="ll-eyebrow">
          Background music for hospitality
        </p>

        <h1 data-ll-reveal data-ll-delay="1" className="ll-h1 mt-4">
          Music for your business
        </h1>

        <p data-ll-reveal data-ll-delay="2" className="ll-lead mt-5">
          The complete music solution for hotels, cafés, restaurants and retail. Legal, expertly curated, and designed to set the perfect atmosphere.
        </p>

        <div data-ll-reveal data-ll-delay="2" className="mt-8 flex flex-wrap items-center gap-3">
          <a href="#pricing" className="ll-btn ll-btn-primary">
            Try it free <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
          <a href="#how-it-works" className="ll-btn ll-btn-secondary">
            See it in action
          </a>
        </div>

        <p data-ll-reveal data-ll-delay="3" className="mt-5 flex items-center gap-2 text-sm text-ll-text-2">
          <Check className="h-4 w-4 text-ll-teal-ink" aria-hidden />
          Free for your first month · No credit card required
        </p>
      </div>

      <div data-ll-reveal data-ll-delay="1" className="relative">
        <Image
          src="/images/Playlist On Tablet mockup(1).jpg"
          alt="The Lobby & Lounge playlist library open on a tablet"
          width={1350}
          height={1080}
          sizes="(min-width: 768px) 560px, 100vw"
          className="h-auto w-full rounded-2xl"
          priority
        />
      </div>
    </div>
  </section>
);
