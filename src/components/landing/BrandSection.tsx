import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const BrandSection = () => (
  <section id="personal-vs-business" className="scroll-mt-20 bg-ll-paper-2 py-24 md:py-32">
    <div className="ll-container grid items-center gap-12 md:grid-cols-2 md:gap-20">
      <div data-ll-reveal>
        <Image
          src="/images/landing/sound-meets-brand.jpg"
          alt="Sound Meets Brand: licensed music for business"
          width={1080}
          height={1080}
          sizes="(min-width: 768px) 540px, 100vw"
          className="aspect-square h-auto w-full rounded-2xl object-cover"
        />
      </div>

      <div data-ll-reveal data-ll-delay="1">
        <p className="ll-eyebrow">Personal use vs business use</p>
        <h2 className="ll-h2 mt-3">
          Music from non-commercial streaming services doesn&apos;t only attract fines but also hurts your brand&apos;s image...
        </h2>
        <ul className="mt-8 border-b border-ll-line text-[17px] leading-relaxed text-ll-text-2">
          <li className="border-t border-ll-line py-5">Employees playing private music might hurt your brand.</li>
          <li className="border-t border-ll-line py-5">
            LLCs separate personal affairs from business affairs, and the same goes for personal and commercial playlists. Press play on track lists that reflect your business.
          </li>
        </ul>
      </div>
    </div>

    <div data-ll-reveal className="ll-container mt-16 md:mt-20">
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-ll-navy px-6 py-8 text-white md:px-10">
        <p className="max-w-[640px] text-lg font-medium leading-snug md:text-xl">
          Protect your brand. Protect your guests&apos; experience. Play commercially licensed music.
        </p>
        <Link href="/signup" className="ll-btn ll-btn-light">
          Start free trial <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  </section>
);
