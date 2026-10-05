import React from "react";
import { supportHref } from "@/lib/site";

/**
 * The "Was this … helpful? / Have more questions? Submit a request" footer from
 * the source docs. `lines` are rendered verbatim; the phrase "Submit a request"
 * becomes a mailto link.
 */
export function SupportCard({ lines, subject }: { lines: string[]; subject?: string }) {
  return (
    <aside style={{ marginTop: 40, padding: "22px 26px", border: "1px solid var(--ll-ink-line)", borderRadius: 16, background: "var(--ll-ink-2)", fontFamily: "var(--ll-font-body)", fontSize: 15, lineHeight: 1.6, color: "var(--ll-on-ink-2)" }}>
      {lines.map((line) => {
        const [before, after] = line.split("Submit a request");
        return (
          <p key={line} style={{ margin: "4px 0" }}>
            {after === undefined ? (
              line
            ) : (
              <>
                {before}
                <a href={supportHref(subject)} style={{ color: "var(--ll-accent)", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}>
                  Submit a request
                </a>
                {after}
              </>
            )}
          </p>
        );
      })}
    </aside>
  );
}
