import React from "react";
import { ArrowUpRight, Check } from "lucide-react";

const rights = [
  { name: "Sound recording", note: "The recorded track itself · L&L Basic Music", covered: true },
  { name: "Publishing", note: "The song's composition & lyrics · L&L Basic Music", covered: true },
  { name: "Public performance", note: "Handled separately with U.S. PROs · ASCAP, BMI, SESAC & GMR", covered: false },
];

export const RightsSection = () => (
  <section id="rights" className="scroll-mt-20 py-24 md:py-32">
    <div className="ll-container">
      <div className="grid gap-8 md:grid-cols-2 md:gap-20">
        <div data-ll-reveal>
          <p className="ll-eyebrow">L&amp;L Basic Plan</p>
          <h2 className="ll-h2 mt-3">Two Rights on us. Handle the one left.</h2>
        </div>
        <p data-ll-reveal data-ll-delay="1" className="ll-lead md:pt-9">
          L&amp;L Basic Plan covers pre-cleared sound recording and publishing licenses with independent artists and labels so you can focus on your business operations.
        </p>
      </div>

      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {rights.map(({ name, note, covered }, i) => (
          <li
            key={name}
            data-ll-reveal
            data-ll-delay={i === 0 ? undefined : String(i)}
            className={covered ? "rounded-2xl bg-ll-paper-2 p-7" : "rounded-2xl bg-ll-navy p-7 text-white"}
          >
            {covered ? (
              <Check className="h-6 w-6 text-ll-teal-ink" aria-label="Covered" />
            ) : (
              <ArrowUpRight className="h-6 w-6 text-ll-teal" aria-label="Handled separately" />
            )}
            <h3 className="mt-5 text-2xl font-semibold tracking-tight">{name}</h3>
            <p className={`mt-5 text-sm leading-relaxed ${covered ? "text-ll-text-2" : "text-white/70"}`}>{note}</p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
