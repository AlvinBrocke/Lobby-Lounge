import React from "react";

/*
 * Long-form text styles for blog posts and help answers. Plain CSS scoped to
 * `.ll-prose` (Tailwind Typography isn't installed), on the landing-page tokens
 * so it matches the Navigation/Footer around it.
 */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="ll-prose">
      {children}
      <style>{`
        .ll-prose { font-family: var(--ll-font-body); font-size: 16.5px; line-height: 1.75; color: var(--ll-on-ink-2); }
        .ll-prose > :first-child { margin-top: 0; }
        .ll-prose p { margin: 0 0 20px; }
        .ll-prose h2 { font-family: var(--ll-font-display); font-size: 26px; font-weight: 600; line-height: 1.25; letter-spacing: -.02em; color: var(--ll-on-ink-1); margin: 48px 0 16px; }
        .ll-prose h3 { font-family: var(--ll-font-display); font-size: 19px; font-weight: 600; color: var(--ll-on-ink-1); margin: 32px 0 12px; }
        .ll-prose strong { color: var(--ll-on-ink-1); font-weight: 700; }
        .ll-prose em { color: var(--ll-on-ink-2); }
        .ll-prose a { color: var(--ll-accent); text-decoration: underline; text-underline-offset: 3px; text-decoration-color: rgba(78,205,196,.35); transition: text-decoration-color .2s; overflow-wrap: anywhere; }
        .ll-prose a:hover { text-decoration-color: var(--ll-accent); }
        .ll-prose ul, .ll-prose ol { margin: 0 0 22px; padding-left: 24px; }
        .ll-prose ul { list-style: disc; }
        .ll-prose ol { list-style: decimal; }
        .ll-prose li { margin-bottom: 10px; padding-left: 4px; }
        .ll-prose li::marker { color: var(--ll-accent); font-weight: 700; }
        .ll-prose .ll-figure { margin: 36px 0; }
        .ll-prose .ll-figure img { width: 100%; height: auto; border-radius: 14px; border: 1px solid var(--ll-ink-line); background: var(--ll-ink-2); }
        .ll-prose figcaption { margin-top: 10px; font-size: 13.5px; line-height: 1.5; font-style: italic; color: var(--ll-on-ink-3); text-align: center; }
        .ll-prose .ll-figure-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin: 36px 0; }
        .ll-prose .ll-figure-row .ll-figure { margin: 0; }
        .ll-prose .ll-table-wrap { overflow-x: auto; margin: 28px 0 32px; border: 1px solid var(--ll-ink-line); border-radius: 14px; }
        .ll-prose table { width: 100%; border-collapse: collapse; font-size: 14.5px; line-height: 1.5; }
        .ll-prose th { text-align: left; font-weight: 700; color: var(--ll-on-ink-1); background: var(--ll-ink-2); }
        .ll-prose th, .ll-prose td { padding: 12px 16px; border-bottom: 1px solid var(--ll-ink-line); vertical-align: top; }
        .ll-prose tr:last-child td { border-bottom: none; }
        .ll-prose td:first-child { color: var(--ll-on-ink-1); font-weight: 600; }
      `}</style>
    </div>
  );
}
