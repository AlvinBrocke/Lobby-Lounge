# Legal page table-of-contents labels match their section headings

Written against: 79379de (branch `feat/legal-pages`; the `(legal)` files are uncommitted on that branch)

## Evidence chain

- Surface: `/privacy` — `src/app/(legal)/privacy/page.tsx`, rendered through `src/app/(legal)/layout.tsx` → `src/components/legal/LegalPage.tsx`
- Problem: The sticky "Contents" list on the Privacy page shows labels that differ from the `<h2>` each entry links to. 9 of 14 entries differ (sections 3, 4, 5, 7, 10, 11, 12, 13, 14). Example: TOC entry 4 reads "Cookies & targeted advertising"; clicking it lands on the heading "Do we use cookies and other tracking technologies?". On the sibling pages the labels are verbatim the headings — Terms 9/9 match, Cookies 6/6 match.
- Design evidence:
  - `src/components/legal/LegalPage.tsx:50-57` — TOC link text comes from the page's `sections[].title`.
  - `src/components/legal/LegalPage.tsx:95-98` — the section `<h2>` text comes from `<Section title>`.
  - `src/app/(legal)/terms/page.tsx:9-19` vs. its `<Section title>` values, and `src/app/(legal)/cookies/page.tsx:9-16` vs. its `<Section title>` values — every label equals its heading. This is the family's convention.
  - `src/app/(legal)/privacy/page.tsx:10-25` (`sections`) vs. the `<Section title>` values in the same file — the two lists were typed independently and drifted.
- Owner: `src/components/legal/LegalPage.tsx` (`LegalPage` renders the TOC, `Section` renders the heading). Each page in `src/app/(legal)/*/page.tsx` supplies both.
- Scope and affected surfaces: `/privacy` (the drifted page); `/terms` and `/cookies` receive the same single-source mechanism with no visible change.
- Uncertainty: none for the direction of the fix (heading is the content; the TOC is derived navigation, as proven by Terms/Cookies). One dependency: the §11 heading on the Privacy page is itself wrong (see `design-plans/privacy-section-11-heading.md`); this plan uses the corrected heading text for that entry so the two plans can be applied in either order.

## Design decision

Each legal page's table of contents must show the exact heading text of the section it links to. To make this true and keep it true, each page's `sections` array becomes the single source of section titles: `<Section>` reads its `title` from that array by `id` instead of carrying a second, hand-typed copy. The TOC and the headings can no longer disagree.

## Reuse

- `LegalSectionLink` type — `src/components/legal/LegalPage.tsx:10` (already exported; the `sections` arrays are already this shape).
- `LegalPage` `sections` prop and `Section` `title` prop — unchanged in signature.
- Exemplar: `src/app/(legal)/terms/page.tsx` — a page whose TOC labels already equal its headings; the Privacy page must read the same way.

No new primitive. A one-line lookup helper is added next to the existing exports in `LegalPage.tsx` because all three pages need it and it belongs with the `LegalSectionLink` type it operates on.

## Changes

1. `src/components/legal/LegalPage.tsx`
   - Change: below the `LegalSectionLink` type export (line 10), add and export a lookup helper:
     ```ts
     /** Title for a TOC entry by id — keeps <Section> headings and the TOC in sync. */
     export const sectionTitle = (sections: LegalSectionLink[], id: string) =>
       sections.find((s) => s.id === id)?.title ?? id;
     ```
   - Preserve: `LegalPage`, `Section`, and every other export unchanged. No style changes.
   - Verify: file still compiles; nothing else in the component changes.

2. `src/app/(legal)/privacy/page.tsx`
   - Change: rewrite the `sections` array (lines 10-25) so every `title` is the heading text, in this exact order:
     | id | title |
     | --- | --- |
     | `what-we-collect` | What information do we collect? |
     | `how-we-process` | How do we process your information? |
     | `disclosures` | When and with whom do we share your personal information? |
     | `cookies` | Do we use cookies and other tracking technologies? |
     | `social-logins` | How do we handle work email and social logins? |
     | `retention` | Comprehensive data retention schedule |
     | `security` | How do we keep your information safe? |
     | `minors` | Do we collect information from minors? |
     | `your-rights` | What are your privacy rights? |
     | `gpc` | Controls for Do-Not-Track and opt-out preference signals |
     | `california` | Do California residents have specific privacy rights? |
     | `updates` | Do we make updates to this notice? |
     | `requests` | How can you review, update, or delete the data we collect? |
     | `contact` | How can you contact us about this Privacy Policy? |

     The `california` title above is the corrected heading from `design-plans/privacy-section-11-heading.md` (the current file reads "Do United States residents have specific privacy rights?", which contradicts the section's own first sentence). Use the California wording here regardless of whether that plan has been applied yet.
   - Change: import `sectionTitle` from `@/components/legal/LegalPage` and replace every `<Section id="X" number={N} title="…">` with `<Section id="X" number={N} title={sectionTitle(sections, "X")}>`. There are 14 `<Section>` elements; the `id` and `number` props stay as they are.
   - Preserve: all section bodies, `Sub` headings, tables, links, the `DoNotSellToggle` placement inside `gpc`, the `lastUpdated` value, and `metadata`.
   - Verify: the rendered TOC on `/privacy` reads exactly the 14 headings above, and each `<h2>` in the article reads the same text as its TOC entry.

3. `src/app/(legal)/terms/page.tsx` and `src/app/(legal)/cookies/page.tsx`
   - Change: same mechanical replacement — import `sectionTitle` and change each `<Section … title="…">` to `title={sectionTitle(sections, "<id>")}`. The `sections` arrays on these pages already contain the heading text, so no title values change.
   - Preserve: everything else, including `Notice` on Terms and the intro paragraph + `LegalTable` on Cookies.
   - Verify: `/terms` and `/cookies` render identically to before (9 and 6 headings respectively, unchanged text).

## Scope

- Inherit: `/privacy`, `/terms`, `/cookies` — every `<Section>` heading on the three pages is now sourced from its page's `sections` array.
- Verify: the Footer's deep link `/privacy#do-not-sell` (`src/components/landing/Footer.tsx:65`) and the in-page anchors `#gpc`, `#california`, `#do-not-sell`, `#arbitration` still resolve — `id` values are untouched, so they should.
- Exclude: the `Sub` (h3) headings — they are not in the TOC and have no counterpart to drift from. The `<ul>` items carrying manual "1."/"2." prefixes (Cookies §4, Privacy §11.B) — separate question, not part of this plan. Any restyling of the TOC or headings.

## Validation

- Product: a reader scanning the Privacy page's Contents list can predict the heading they will land on; the label and the heading are the same words.
- Interface: `/privacy` at ≥1024px (sticky two-column TOC) and at <1024px (TOC collapses into the bordered card above the article, `LegalPage.tsx:73-76`) — in both, the 14 labels equal the 14 headings. Longest label ("How can you review, update, or delete the data we collect?") wraps within the 260px column without overlap; the numbered prefix span (`minWidth: 18`) stays aligned. `/terms` and `/cookies` unchanged.
- System: no second source of heading text remains in any legal page — `grep -n 'title="' src/app/\(legal\)/*/page.tsx` should return only the `sections` array lines and `<LegalPage title=…>`, never a `<Section … title="…">` literal.
- Repository: `pnpm build` → completes without type errors. Then:
  `for p in privacy terms cookies; do grep -c 'title={sectionTitle(sections' "src/app/(legal)/$p/page.tsx"; done` → `14`, `9`, `6`.

## Stop conditions

- Stop if `LegalPage.tsx` no longer exports `LegalSectionLink` or the `sections` prop shape has changed — the helper's assumption no longer holds.
- Stop if any page's `<Section id>` set no longer matches its `sections[].id` set one-to-one (the helper would fall back to rendering the raw id as a heading).
- Stop if the executor is asked to change heading wording beyond the §11 California correction — that is copy work outside this plan.

## Design documentation

- After acceptance and validation: add to the comment block at the top of `src/components/legal/LegalPage.tsx` (lines 4-8): "Section titles live once, in each page's `sections` array; `<Section title>` is read via `sectionTitle()` so the table of contents always matches the headings." No separate design doc exists to update.
