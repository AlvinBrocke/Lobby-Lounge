import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const ArtistsSection = () => (
  <section id="artists" className="scroll-mt-20 bg-ll-paper-2 py-24 md:py-32">
    <div className="ll-container grid items-center gap-12 md:grid-cols-2 md:gap-20">
      <div data-ll-reveal>
        <h2 className="ll-h2">Reward musicians for their contributions to your space.</h2>
        <p className="ll-lead mt-5">
          We work with independent artists &amp; labels with a sizable catalog that reflects your local culture while keeping staff &amp; guests engaged…
        </p>
        <Link href="/signup" className="ll-btn ll-btn-primary mt-8">
          Start free trial <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <figure data-ll-reveal data-ll-delay="1">
        <Image
          src="/images/landing/artist-playlists.png"
          alt="Playlist covers: Lounge vibes, Workout Beats, Morning Energy, Cafe Ambience"
          width={1080}
          height={819}
          sizes="(min-width: 768px) 540px, 100vw"
          className="h-auto w-full rounded-2xl"
        />
        <figcaption className="mt-4 text-sm leading-relaxed text-ll-text-2">
          Streaming indie artists in your venue is a vote for your support for local music &amp; culture (CSR)
        </figcaption>
      </figure>
    </div>
  </section>
);
