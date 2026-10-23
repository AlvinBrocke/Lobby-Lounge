import React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { supportHref } from "@/lib/site";

export const ArtistsSection = () => (
  <section id="artists" className="scroll-mt-20 bg-white py-24 md:py-32">
    <div className="ll-container grid items-center gap-12 md:grid-cols-2 md:gap-20">
      <div data-ll-reveal>
        <h2 className="ll-h1">Reward musicians for their contributions to your space.</h2>
        <p className="ll-lead mt-6 md:text-xl">
          We work with independent artists &amp; labels with a sizable catalog that reflects your local culture while keeping staff &amp; guests engaged…
        </p>
        <a href={supportHref("Book a demo")} className="ll-btn ll-btn-primary mt-7">
          Book Demo <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
      </div>

      <figure data-ll-reveal data-ll-delay="1">
        <Image
          src="/images/landing/artist-playlists.png"
          alt="Playlist covers: Lounge vibes, Workout Beats, Morning Energy, Cafe Ambience"
          width={1080}
          height={819}
          sizes="(min-width: 768px) 540px, 100vw"
          className="h-auto w-full"
        />
        <figcaption className="mt-6 text-lg leading-relaxed text-ll-text-2 md:text-xl">
          Streaming indie artists in your venue is a vote for your support for local music &amp; culture (CSR)
        </figcaption>
      </figure>
    </div>
  </section>
);
