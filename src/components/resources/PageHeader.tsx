import React from "react";

/** Eyebrow + title + intro, matching the LegalPage header. */
export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header style={{ marginBottom: 48, paddingBottom: 32, borderBottom: "1px solid var(--ll-ink-line)" }}>
      <div style={{ fontFamily: "var(--ll-font-body)", fontSize: 14, fontWeight: 500, color: "var(--ll-accent)", margin: "0 0 14px" }}>
        {eyebrow}
      </div>
      <h1 style={{ fontFamily: "var(--ll-font-display)", fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 600, lineHeight: 1.08, letterSpacing: "-.03em", color: "var(--ll-on-ink-1)", margin: 0 }}>
        {title}
      </h1>
      {children && (
        <div style={{ fontFamily: "var(--ll-font-body)", fontSize: 15, lineHeight: 1.6, color: "var(--ll-on-ink-3)", margin: "16px 0 0" }}>
          {children}
        </div>
      )}
    </header>
  );
}
