import React from "react";

const features = [
  {
    title: "Fully licensed",
    desc: "Every track is cleared for commercial use, so you can play with total peace of mind — no royalty collectors, no copyright strikes, no surprise invoices.",
  },
  {
    title: "Curated weekly",
    desc: "Every curated playlist is refreshed with new tracks each week, so your regulars — and your staff — never hear the same rotation on repeat.",
  },
  {
    title: "Works in the browser",
    desc: "No hardware to buy, nothing to install. Open Lobby & Lounge on any laptop, tablet or phone with a browser and press play.",
  },
];

export const LicensingSection = () => (
  <section id="licensing" className="scroll-mt-20 py-24 md:py-32">
    <div className="ll-container grid gap-12 md:grid-cols-[1fr_1.1fr] md:gap-20">
      <div data-ll-reveal>
        <h2 className="ll-h2">Excellent music for every space</h2>
        <p className="ll-lead mt-5">
          <b className="font-semibold text-ll-text">56% of business owners</b>{" "}don&apos;t know that a personal Spotify or Apple Music subscription isn&apos;t licensed for commercial use. Every track in Lobby &amp; Lounge is — so you can stop worrying about licensing and start building your brand sound.
        </p>
        <p className="mt-4 text-[13px] text-ll-text-2">
          Source: MRC Data × Soundtrack Your Brand, B2B study, 2021
        </p>
      </div>

      <ol className="divide-y divide-ll-line border-y border-ll-line">
        {features.map((f, i) => (
          <li
            key={f.title}
            data-ll-reveal
            data-ll-delay={i === 0 ? undefined : String(i)}
            className="grid grid-cols-[2.5rem_1fr] gap-x-4 py-7"
          >
            <span className="pt-0.5 text-sm font-medium tabular-nums text-ll-teal-ink">0{i + 1}</span>
            <div>
              <h3 className="ll-h3">{f.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ll-text-2">{f.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
