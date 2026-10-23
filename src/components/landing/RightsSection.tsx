import React from "react";
import { ArrowUpRight, Check } from "lucide-react";

const rights = [
  { name: "Sound recording", note: "Pre-cleared with independent artists and labels · L&L Basic Music", covered: true },
  { name: "Publishing", note: "Pre-cleared with independent artists and labels · L&L Basic Music", covered: true },
  { name: "Public performance", note: "Handled separately with U.S. PROs · ASCAP, BMI, SESAC & GMR", covered: false },
];

export const RightsSection = () => (
  <section id="rights" className="scroll-mt-20 bg-ll-paper-2 py-24 md:py-32">
    <div className="ll-container">
      <div className="grid gap-8 md:grid-cols-2 md:gap-20">
        <div data-ll-reveal>
          <p className="ll-eyebrow uppercase">L&amp;L Basic Plan</p>
          <h2 className="ll-h1 mt-4">Two Rights on us. Handle the one left.</h2>
        </div>
        <p data-ll-reveal data-ll-delay="1" className="ll-lead md:pt-10 md:text-xl">
          L&amp;L Basic Plan covers pre-cleared sound recording and publishing licenses with independent artists and labels so you can focus on your business operations.
        </p>
      </div>

      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {rights.map(({ name, note, covered }, i) => (
          <li
            key={name}
            data-ll-reveal
            data-ll-delay={i === 0 ? undefined : String(i)}
            className={covered ? "bg-[#e5ece6] p-7" : "bg-ll-navy p-7 text-white"}
          >
            {covered ? (
              <Check className="h-6 w-6 text-ll-teal-ink" aria-label="Covered" />
            ) : (
              <ArrowUpRight className="h-6 w-6 text-ll-teal" aria-label="Handled separately" />
            )}
            <h3 className="mt-5 text-2xl font-medium tracking-tight md:text-[28px]">{name}</h3>
            <p className={`mt-5 text-sm leading-relaxed ${covered ? "text-ll-text-2" : "text-white/70"}`}>{note}</p>
          </li>
        ))}
      </ul>

      <p data-ll-reveal className="mt-12 border-t border-ll-line pt-12 text-lg leading-relaxed text-ll-text-2 md:text-xl">
        We encourage clients to settle any public performance related rights with U.S. PROs such as ASCAP, BMI, SESAC &amp; GMR. Recording &amp; Publishing Rights on us. Handle the Performing Rights. (Not-two much to ask for).
      </p>
    </div>
  </section>
);
