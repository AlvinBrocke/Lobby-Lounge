import React from "react";
import Image from "next/image";

// Header colours are each service's brand colour, as in the Figma frame.
const services = [
  { name: "Spotify", bar: "#1db954", logo: "/images/landing/logo-spotify.svg", shot: "/images/landing/tos-spotify.png", w: 1828, h: 593 },
  { name: "YouTube", bar: "#ff0000", logo: "/images/landing/logo-youtube.svg", shot: "/images/landing/tos-youtube.png", w: 815, h: 902 },
  { name: "Amazon Music", bar: "#ff9900", logo: "/images/landing/logo-amazon-music.svg", shot: "/images/landing/tos-amazon-music.png", w: 743, h: 888 },
  { name: "Apple Music", bar: "#fa233b", logo: "/images/landing/logo-apple-music.svg", shot: "/images/landing/tos-apple-music.png", w: 1143, h: 916 },
  { name: "Deezer", bar: "#a238ff", logo: null, shot: "/images/landing/tos-deezer.png", w: 1748, h: 908 },
  { name: "Tidal", bar: "#00ffff", logo: "/images/landing/logo-tidal.svg", shot: "/images/landing/tos-tidal.png", w: 1290, h: 715, dark: true },
];

export const StreamingWarning = () => (
  <section id="streaming-warning" className="scroll-mt-20 border-t border-ll-line py-24 md:py-32">
    <div className="ll-container">
      <div data-ll-reveal>
        <h2 className="ll-h1 max-w-4xl">Avoid hefty fines from streaming personal playlists in your establishment</h2>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ll-text-2 md:text-xl">
          Streaming from non-commercial streaming services is an infringement on the intellectual property rights of right holders (musicians) under U.S copyright law.
        </p>
      </div>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <li
            key={s.name}
            data-ll-reveal
            data-ll-delay={i % 3 ? String(i % 3) : undefined}
            className="overflow-hidden rounded-md border border-ll-line bg-white"
          >
            <div
              className={`flex items-center gap-2 px-4 py-2.5 text-[11px] ${s.dark ? "text-ll-text" : "text-white"}`}
              style={{ background: s.bar }}
            >
              {s.logo ? (
                <img src={s.logo} alt="" width={24} height={24} />
              ) : (
                // The Deezer mark only exists inside its screenshot; crop it out as Figma does.
                <span className="relative block h-6 w-6 overflow-hidden rounded">
                  <img src={s.shot} alt="" className="absolute max-w-none" style={{ width: "3361.54%", height: "1746.15%", left: "-207.69%", top: "-5.77%" }} />
                </span>
              )}
              <span className="font-bold uppercase">{s.name}</span>
              <span className="opacity-80">Terms of Service</span>
            </div>
            <Image
              src={s.shot}
              alt={`Excerpt from the ${s.name} terms of service`}
              width={s.w}
              height={s.h}
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
              className="h-[140px] w-full object-contain"
            />
          </li>
        ))}
      </ul>

      <p data-ll-reveal className="mt-12 max-w-4xl text-2xl leading-snug text-ll-teal-ink md:text-[32px]">
        You infringe on (I) sound recording, (II) publishing &amp; (III) performing rights of musicians when you stream from YouTube, Spotify or Apple Music.
      </p>
    </div>
  </section>
);
