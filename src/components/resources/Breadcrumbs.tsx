import React from "react";
import Link from "next/link";

/**
 * Renders a "Blog > Music Licensing > Title" line from the source doc as-is,
 * linking the first segment back to /blog.
 */
export function Breadcrumbs({ trail }: { trail: string }) {
  const parts = trail.split(">").map((p) => p.trim()).filter(Boolean);
  return (
    <nav aria-label="Breadcrumb" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, textTransform: "none", letterSpacing: ".02em", fontSize: 13 }}>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span aria-hidden style={{ color: "var(--ll-on-ink-3)" }}>›</span>}
          {i === 0 ? (
            <Link href="/blog" style={{ color: "var(--ll-accent)" }}>{part}</Link>
          ) : (
            <span style={{ color: i === parts.length - 1 ? "var(--ll-on-ink-2)" : "var(--ll-accent)" }}>{part}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
