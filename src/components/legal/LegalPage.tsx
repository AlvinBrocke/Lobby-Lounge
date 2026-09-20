import React from "react";
import Link from "next/link";

/*
 * Shared building blocks for the public legal pages (/privacy, /terms, /cookies).
 * Server components — no hooks, inline styles on the landing-page token set so
 * they match the Navigation/Footer they sit between.
 *
 * Section titles live once, in each page's `sections` array; <Section title> is
 * read via sectionTitle() so the table of contents always matches the headings.
 */

export type LegalSectionLink = { id: string; title: string };

/** Title for a TOC entry by id — keeps <Section> headings and the TOC in sync. */
export const sectionTitle = (sections: LegalSectionLink[], id: string) =>
  sections.find((s) => s.id === id)?.title ?? id;

const body: React.CSSProperties = {
  fontFamily: "var(--ll-font-body)",
  fontSize: 15.5,
  lineHeight: 1.7,
  color: "var(--ll-on-ink-2)",
};

export function LegalPage({
  title,
  lastUpdated,
  sections,
  children,
}: {
  title: string;
  lastUpdated: string;
  sections: LegalSectionLink[];
  children: React.ReactNode;
}) {
  return (
    <div style={{ width: "100%", maxWidth: 1240, margin: "0 auto", padding: "72px 32px 96px" }}>
      <header style={{ marginBottom: 48, paddingBottom: 32, borderBottom: "1px solid var(--ll-ink-line)" }}>
        <p style={{ ...body, fontSize: 12, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ll-accent)", margin: "0 0 14px" }}>
          Lobby &amp; Lounge Music Inc. · Legal
        </p>
        <h1 style={{ fontFamily: "var(--ll-font-display)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-.03em", color: "#fff", margin: 0 }}>
          {title}
        </h1>
        <p style={{ ...body, fontSize: 14, color: "var(--ll-on-ink-3)", margin: "16px 0 0" }}>
          Last updated: <strong style={{ color: "var(--ll-on-ink-2)", fontWeight: 600 }}>{lastUpdated}</strong>
        </p>
      </header>

      <div className="ll-legal-grid" style={{ display: "grid", gridTemplateColumns: "260px minmax(0, 760px)", gap: 64, alignItems: "start" }}>
        <nav aria-label="Table of contents" className="ll-legal-toc" style={{ position: "sticky", top: 100 }}>
          <p style={{ ...body, fontSize: 12, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--ll-on-ink-3)", margin: "0 0 16px" }}>
            Contents
          </p>
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {sections.map((s, i) => (
              <li key={s.id} style={{ marginBottom: 10 }}>
                <a href={`#${s.id}`} className="ll-legal-toc-link" style={{ ...body, display: "flex", gap: 10, fontSize: 13.5, lineHeight: 1.45, color: "var(--ll-on-ink-3)", textDecoration: "none", transition: "color .2s" }}>
                  <span style={{ color: "var(--ll-accent)", fontWeight: 700, flexShrink: 0, minWidth: 18 }}>{i + 1}.</span>
                  <span>{s.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article style={body}>{children}</article>
      </div>

      <style>{`
        .ll-legal-toc-link:hover { color: #fff !important; }
        .ll-legal-link { color: var(--ll-accent); text-decoration: underline; text-underline-offset: 3px; text-decoration-color: rgba(78,205,196,.35); transition: text-decoration-color .2s; }
        .ll-legal-link:hover { text-decoration-color: var(--ll-accent); }
        article p { margin: 0 0 16px; }
        article ul { margin: 0 0 18px; padding-left: 22px; }
        article li { margin-bottom: 8px; }
        article li::marker { color: var(--ll-accent); }
        article strong { color: #fff; font-weight: 700; }
        @media (max-width: 1023px) {
          .ll-legal-grid { grid-template-columns: minmax(0, 1fr) !important; gap: 40px !important; }
          .ll-legal-toc { position: static !important; padding: 20px 22px; border: 1px solid var(--ll-ink-line); border-radius: 14px; background: var(--ll-ink-2); }
        }
      `}</style>
    </div>
  );
}

export function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} style={{ scrollMarginTop: 96, marginBottom: 52 }}>
      <h2 style={{ fontFamily: "var(--ll-font-display)", fontSize: 24, fontWeight: 700, lineHeight: 1.25, letterSpacing: "-.02em", color: "#fff", margin: "0 0 18px", display: "flex", gap: 14 }}>
        <span style={{ color: "var(--ll-accent)", flexShrink: 0 }}>{number}.</span>
        <span>{title}</span>
      </h2>
      {children}
    </section>
  );
}

export function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 26 }}>
      <h3 style={{ fontFamily: "var(--ll-font-display)", fontSize: 17, fontWeight: 700, color: "#fff", margin: "0 0 10px" }}>{title}</h3>
      {children}
    </div>
  );
}

/** Emphasised legal notice (e.g. the all-caps banner at the top of the Terms). */
export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "20px 22px", marginBottom: 36, borderLeft: "3px solid var(--ll-accent)", borderRadius: "0 14px 14px 0", background: "rgba(78,205,196,.06)", color: "#fff", fontSize: 14.5, lineHeight: 1.65, fontWeight: 600 }}>
      {children}
    </div>
  );
}

export function A({ href, children }: { href: string; children: React.ReactNode }) {
  const external = /^https?:/.test(href);
  if (external) {
    return (
      <a href={href} className="ll-legal-link" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  if (href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a href={href} className="ll-legal-link">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className="ll-legal-link">
      {children}
    </Link>
  );
}

export function Email({ address }: { address: string }) {
  return <A href={`mailto:${address}`}>{address}</A>;
}

export function Phone({ number }: { number: string }) {
  return <A href={`tel:${number.replace(/[^\d+]/g, "")}`}>{number}</A>;
}

type TonedCell = { value: React.ReactNode; tone: "yes" | "no" | "warn" };
export type LegalTableCell = React.ReactNode | TonedCell;

const toneColor = { yes: "var(--ll-accent)", no: "var(--ll-on-ink-3)", warn: "#FF6B6B" } as const;

const isToned = (cell: LegalTableCell): cell is TonedCell =>
  typeof cell === "object" && cell !== null && "tone" in cell && "value" in cell;

export function LegalTable({ columns, rows }: { columns: string[]; rows: LegalTableCell[][] }) {
  return (
    <div style={{ overflowX: "auto", margin: "8px 0 24px", border: "1px solid var(--ll-ink-line)", borderRadius: 14, WebkitOverflowScrolling: "touch" }}>
      <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", fontSize: 14, lineHeight: 1.5 }}>
        <thead>
          <tr style={{ background: "var(--ll-ink-3)" }}>
            {columns.map((c) => (
              <th key={c} scope="col" style={{ textAlign: "left", padding: "12px 14px", fontWeight: 700, color: "#fff", fontSize: 12.5, letterSpacing: ".04em", textTransform: "uppercase", borderBottom: "1px solid var(--ll-ink-line)", whiteSpace: "nowrap" }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 ? "rgba(255,255,255,.02)" : "transparent" }}>
              {row.map((cell, ci) => {
                const value: React.ReactNode = isToned(cell) ? cell.value : cell;
                const tone = isToned(cell) ? cell.tone : null;
                return (
                  <td key={ci} style={{ padding: "12px 14px", verticalAlign: "top", borderBottom: ri === rows.length - 1 ? "none" : "1px solid var(--ll-ink-line)", color: tone ? toneColor[tone] : ci === 0 ? "#fff" : "var(--ll-on-ink-2)", fontWeight: tone || ci === 0 ? 700 : 400 }}>
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ContactCard({ heading, rows }: { heading: string; rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <div style={{ marginTop: 8, padding: "22px 24px", border: "1px solid var(--ll-ink-line)", borderRadius: 16, background: "var(--ll-ink-2)" }}>
      <p style={{ margin: "0 0 14px", fontFamily: "var(--ll-font-display)", fontWeight: 700, fontSize: 14, letterSpacing: ".06em", textTransform: "uppercase", color: "#fff" }}>{heading}</p>
      <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "max-content 1fr", columnGap: 18, rowGap: 8, fontSize: 14.5 }}>
        {rows.map((r) => (
          <React.Fragment key={r.label}>
            <dt style={{ color: "var(--ll-on-ink-3)", fontWeight: 600 }}>{r.label}</dt>
            <dd style={{ margin: 0, color: "var(--ll-on-ink-2)" }}>{r.value}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  );
}
