import { Metadata } from "next";
import { helpCategories, helpTitle } from "@/content/help";
import { PageHeader } from "@/components/resources/PageHeader";
import { FaqAccordion, answerText } from "@/components/resources/FaqAccordion";
import { SupportCard } from "@/components/resources/SupportCard";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Answers about getting started, speakers, licensing, billing and troubleshooting Lobby & Lounge Music.",
};

export default function HelpCenterPage() {
  // Lets search engines show questions/answers directly in results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: helpCategories.flatMap((c) =>
      c.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: answerText(f.a) } })),
    ),
  };

  return (
    <div style={{ width: "100%", maxWidth: 1240, margin: "0 auto", padding: "72px 32px 96px" }}>
      <PageHeader eyebrow="Lobby & Lounge Music · Help" title={helpTitle} />

      <nav aria-label="Help topics" className="ll-help-topics">
        {helpCategories.map(({ id, title, icon: Icon, faqs }) => (
          <a key={id} href={`#${id}`} className="ll-help-topic">
            <span className="ll-help-topic-icon"><Icon size={18} /></span>
            <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <span style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>{title}</span>
              <span style={{ fontSize: 13, color: "var(--ll-on-ink-3)" }}>{faqs.length} {faqs.length === 1 ? "article" : "articles"}</span>
            </span>
          </a>
        ))}
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {helpCategories.map(({ id, title, icon: Icon, faqs, footer }) => (
          <section key={id} id={id} aria-labelledby={`${id}-title`} style={{ scrollMarginTop: 96, marginTop: 64 }}>
            <h2 id={`${id}-title`} style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "var(--ll-font-display)", fontSize: 24, fontWeight: 700, letterSpacing: "-.02em", color: "#fff", margin: "0 0 18px" }}>
              <Icon size={22} color="var(--ll-accent)" aria-hidden />
              {title}
            </h2>
            <FaqAccordion idPrefix={id} faqs={faqs} />
            {footer && <SupportCard lines={footer} subject={`Help Center: ${title}`} />}
          </section>
        ))}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <style>{`
        .ll-help-topics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
        .ll-help-topic { display: flex; align-items: center; gap: 14px; padding: 16px 18px; border: 1px solid var(--ll-ink-line); border-radius: 14px; background: var(--ll-ink-2); font-family: var(--ll-font-body); transition: border-color .25s, transform .25s var(--ll-ease); }
        .ll-help-topic:hover { border-color: rgba(78,205,196,.45); transform: translateY(-2px); }
        .ll-help-topic-icon { flex-shrink: 0; width: 38px; height: 38px; display: grid; place-items: center; border-radius: 10px; background: rgba(78,205,196,.12); color: var(--ll-accent); }
        @media (max-width: 1023px) { .ll-help-topics { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 560px) { .ll-help-topics { grid-template-columns: minmax(0, 1fr); } }
      `}</style>
    </div>
  );
}
