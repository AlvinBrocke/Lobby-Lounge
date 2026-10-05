import React from "react";
import { ChevronDown } from "lucide-react";
import type { AnswerBlock, Faq, Inline } from "@/content/help";

/*
 * Native <details>/<summary> accordion: opening and closing works with no
 * client JavaScript, so this stays a Server Component. Each item has an id so a
 * question can be deep-linked (/help#<category>-<n>).
 */

export const inlineText = (parts: Inline[]) => parts.map((p) => (typeof p === "string" ? p : p.text)).join("");

export const answerText = (blocks: AnswerBlock[]) =>
  blocks
    .map((b) => (Array.isArray(b) ? inlineText(b) : "em" in b ? inlineText(b.em) : b.items.map(inlineText).join(" ")))
    .join(" ");

function Inlines({ parts }: { parts: Inline[] }) {
  return (
    <>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <React.Fragment key={i}>{p}</React.Fragment>
        ) : (
          <a key={i} href={p.href}>{p.text}</a>
        ),
      )}
    </>
  );
}

function Answer({ blocks }: { blocks: AnswerBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (Array.isArray(b)) return <p key={i}><Inlines parts={b} /></p>;
        if ("em" in b) return <p key={i}><em><Inlines parts={b.em} /></em></p>;
        const List = b.list;
        return (
          <List key={i}>
            {b.items.map((item, j) => <li key={j}><Inlines parts={item} /></li>)}
          </List>
        );
      })}
    </>
  );
}

export function FaqAccordion({ idPrefix, faqs }: { idPrefix: string; faqs: Faq[] }) {
  return (
    <div className="ll-faq">
      {faqs.map((faq, i) => (
        <details key={i} id={`${idPrefix}-${i + 1}`} className="ll-faq-item">
          <summary>
            <span>{faq.q}</span>
            <ChevronDown aria-hidden className="ll-faq-chevron" size={18} />
          </summary>
          <div className="ll-faq-answer">
            <Answer blocks={faq.a} />
          </div>
        </details>
      ))}
      <style>{`
        .ll-faq { border: 1px solid var(--ll-ink-line); border-radius: 16px; background: var(--ll-ink-2); overflow: hidden; }
        .ll-faq-item { scroll-margin-top: 96px; }
        .ll-faq-item + .ll-faq-item { border-top: 1px solid var(--ll-ink-line); }
        .ll-faq-item summary { list-style: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 18px 22px; font-family: var(--ll-font-body); font-size: 15.5px; font-weight: 700; line-height: 1.45; color: #fff; transition: color .2s; }
        .ll-faq-item summary::-webkit-details-marker { display: none; }
        .ll-faq-item summary:hover { color: var(--ll-accent); }
        .ll-faq-item summary:focus-visible { outline: 2px solid var(--ll-accent); outline-offset: -2px; }
        .ll-faq-chevron { flex-shrink: 0; color: var(--ll-on-ink-3); transition: transform .25s var(--ll-ease); }
        .ll-faq-item[open] .ll-faq-chevron { transform: rotate(180deg); color: var(--ll-accent); }
        .ll-faq-answer { padding: 0 22px 20px; font-family: var(--ll-font-body); font-size: 15px; line-height: 1.7; color: var(--ll-on-ink-2); }
        .ll-faq-answer p { margin: 0 0 12px; }
        .ll-faq-answer p:last-child { margin-bottom: 0; }
        .ll-faq-answer ul, .ll-faq-answer ol { margin: 0 0 14px; padding-left: 22px; }
        .ll-faq-answer ul { list-style: disc; }
        .ll-faq-answer ol { list-style: decimal; }
        .ll-faq-answer li { margin-bottom: 6px; }
        .ll-faq-answer li::marker { color: var(--ll-accent); font-weight: 700; }
        .ll-faq-answer a { color: var(--ll-accent); text-decoration: underline; text-underline-offset: 3px; overflow-wrap: anywhere; }
      `}</style>
    </div>
  );
}
