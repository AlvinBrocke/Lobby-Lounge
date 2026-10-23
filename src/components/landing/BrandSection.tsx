import React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { supportHref } from "@/lib/site";

export const BrandSection = () => (
  <section id="personal-vs-business" className="scroll-mt-20 border-t border-ll-line bg-ll-paper-2">
    <div className="grid md:grid-cols-[minmax(0,560px)_1fr]">
      <Image
        src="/images/landing/sound-meets-brand.jpg"
        alt="Sound Meets Brand: licensed music for business"
        width={1080}
        height={1080}
        sizes="(min-width: 768px) 560px, 100vw"
        className="aspect-square h-auto w-full object-cover"
      />

      <div data-ll-reveal className="px-6 py-16 md:px-16 md:py-24">
        <p className="ll-eyebrow text-xs font-semibold uppercase">Personal use vs business use</p>
        <h2 className="ll-h2 mt-5">
          Music from non-commercial streaming services doesn&apos;t only attract fines but also hurts your brand&apos;s image...
        </h2>
        <div className="mt-9 border-t border-ll-line pt-9 text-lg leading-relaxed text-ll-text-2 md:text-xl">
          <p className="flex gap-4">
            <span aria-hidden className="mt-3 h-1 w-1 shrink-0 rounded-sm bg-ll-teal-ink" />
            Employees playing private music might hurt your brand.
          </p>
          <p className="mt-6 border-t border-ll-line pt-6">
            LLCs separate personal affairs from business affairs and so is personal playlists from commercial playlists. Press play on track lists that reflect your business.
          </p>
        </div>
      </div>
    </div>

    <div className="bg-ll-navy py-10 text-white">
      <div className="ll-container flex flex-wrap items-center justify-between gap-6">
        <p className="max-w-[760px] text-xl leading-snug md:text-[22px]">
          Protect your brand. Protect your guests&apos; experience. Play commercially licensed music.
        </p>
        <a href={supportHref("Book a demo")} className="ll-btn ll-btn-light">
          Book Demo <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </div>
  </section>
);
