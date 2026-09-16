import React, { ReactNode } from "react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";

interface MarketingPageProps {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  /** Shows a "Draft" banner — for legal pages awaiting final copy. */
  draft?: boolean;
  children: ReactNode;
}

// Shared shell for the secondary marketing pages (About, Help, Licensing,
// legal…). Same nav, footer and brand tokens as the landing page, with a
// single readable prose column in the middle.
export function MarketingPage({ eyebrow, title, intro, draft, children }: MarketingPageProps) {
  return (
    <div style={{ fontFamily: "var(--ll-font-body)", background: "var(--ll-ink-1)", color: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navigation />

      <main style={{ flex: 1, padding: "150px 0 110px" }}>
        <div style={{ width: "100%", maxWidth: 760, margin: "0 auto", padding: "0 32px" }}>
          <span style={{ fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: ".2em", color: "var(--ll-accent)", display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 26, height: 1, background: "var(--ll-accent)", opacity: .6 }} />
            {eyebrow}
          </span>
          <h1 style={{ fontFamily: "var(--ll-font-display)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-.03em", margin: "18px 0 0" }}>
            {title}
          </h1>
          {intro && (
            <p style={{ marginTop: 20, fontSize: "clamp(17px, 2vw, 20px)", lineHeight: 1.6, color: "var(--ll-on-ink-2)" }}>
              {intro}
            </p>
          )}

          {draft && (
            <div role="note" style={{ marginTop: 28, padding: "14px 18px", borderRadius: 12, border: "1px solid rgba(251,191,36,.35)", background: "rgba(251,191,36,.08)", color: "#fcd34d", fontSize: 14, lineHeight: 1.5 }}>
              <b>Draft.</b> This page is a placeholder while the final policy is reviewed. It is not yet a binding document.
            </div>
          )}

          <div className="ll-prose" style={{ marginTop: 44 }}>
            {children}
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .ll-prose h2 { font-family: var(--ll-font-display); font-weight: 700; font-size: 24px; letter-spacing: -.01em; margin: 44px 0 12px; color: #fff; }
        .ll-prose h2:first-child { margin-top: 0; }
        .ll-prose h3 { font-family: var(--ll-font-display); font-weight: 700; font-size: 18px; margin: 28px 0 8px; color: #fff; }
        .ll-prose p, .ll-prose li { font-size: 16px; line-height: 1.7; color: var(--ll-on-ink-2); }
        .ll-prose p { margin: 0 0 16px; }
        .ll-prose ul { list-style: disc; margin: 0 0 16px; padding-left: 22px; }
        .ll-prose ol { list-style: decimal; margin: 0 0 16px; padding-left: 22px; }
        .ll-prose li { margin-bottom: 8px; }
        .ll-prose a { color: var(--ll-accent); text-decoration: underline; text-underline-offset: 3px; }
        .ll-prose a:hover { color: #fff; }
        .ll-prose b, .ll-prose strong { color: #fff; }
        .ll-prose small { display: block; font-size: 13px; color: var(--ll-on-ink-3); }
        .ll-prose hr { border: 0; border-top: 1px solid var(--ll-ink-line); margin: 36px 0; }
        .ll-prose .ll-card { padding: 22px 24px; border-radius: 16px; background: var(--ll-ink-2); border: 1px solid var(--ll-ink-line); margin-bottom: 14px; }
        .ll-prose .ll-card h3 { margin-top: 0; }
        .ll-prose .ll-card p:last-child { margin-bottom: 0; }
      `}</style>
    </div>
  );
}
