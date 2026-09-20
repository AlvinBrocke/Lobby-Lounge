# Privacy Policy §11 heading names California, matching its body

Written against: 79379de (branch `feat/legal-pages`; `src/app/(legal)/` is uncommitted on that branch)

## Evidence chain

- Surface: `/privacy`, section 11 — `src/app/(legal)/privacy/page.tsx:183-260`, rendered via `src/components/legal/LegalPage.tsx` (`Section` → `<h2>`, lines 95-98)
- Problem: The section heading reads "Do United States residents have specific privacy rights?" (line 183). The very next line of copy — the section's opening sentence — reads "This section applies exclusively to California residents pursuant to the California Consumer Privacy Act…" (line 184). Every subsection A–G (lines 186-259) is California-only (CCPA/CPRA categories table, California consumer rights, CPPA appeals, California "Shine the Light"). The table-of-contents label for the same section is "California specific rights (CCPA/CPRA)" (line 21). The heading is the only element that says "United States".
- Design evidence: direct contradiction between a heading and the body copy it introduces, on the same screen, in the same reading pass. The page's other headings follow a question form ("What information do we collect?", "Do we collect information from minors?", "Do we make updates to this notice?"), so the corrected heading keeps that form.
- Owner: `src/app/(legal)/privacy/page.tsx` (the `title` prop on the `<Section id="california">` element).
- Scope and affected surfaces: `/privacy` only. The TOC entry for this section is covered by `design-plans/legal-toc-labels-match-headings.md`, which already uses the corrected wording; applying this plan first or second yields the same end state.
- Uncertainty: none. The body, subsections, and TOC all agree on California; only the heading disagrees.

## Design decision

Change the §11 heading to **"Do California residents have specific privacy rights?"**. This resolves the contradiction with the body and TOC while preserving the page's question-form heading style. Nothing else about the section changes.

## Reuse

- `Section` component — `src/components/legal/LegalPage.tsx:82-102` (heading styling unchanged).
- Exemplar: sibling question-form headings in the same file, e.g. `<Section id="minors" number={8} title="Do we collect information from minors?">` (line 170).

No new primitive.

## Changes

1. `src/app/(legal)/privacy/page.tsx:183`
   - Change: `title="Do United States residents have specific privacy rights?"` → `title="Do California residents have specific privacy rights?"`.
     If `design-plans/legal-toc-labels-match-headings.md` has already been applied, the heading is read from the `sections` array instead; in that case set the `california` entry's `title` in `sections` to "Do California residents have specific privacy rights?" (it will already be that value if that plan was followed exactly — then there is nothing to do here).
   - Preserve: `id="california"`, `number={11}`, the opening paragraph, subsections A–G, the `LegalTable`, the "Submit a privacy request" CTA, and all anchors (`#california` is linked from §4 at line 138).
   - Verify: the rendered `<h2>` for section 11 reads "11. Do California residents have specific privacy rights?" and the paragraph below it still begins "This section applies exclusively to California residents".

## Scope

- Inherit: `/privacy` §11 heading.
- Verify: the §4 cross-reference "Sections 10 and 11" (line 138) still points at `#california` — unchanged `id`, so it does. The TOC label for this section (line 21) — if the TOC plan is not applied, it still reads "California specific rights (CCPA/CPRA)", which no longer contradicts the heading in substance.
- Exclude: any other heading or body copy on the page; the legal substance of the section; the `lastUpdated` date (a one-word heading correction is not a policy revision — leave it to the author to decide).

## Validation

- Product: a California resident reading the Privacy Policy sees a heading, TOC entry, and body that all say the section is about California rights.
- Interface: `/privacy#california` at desktop and mobile widths — heading wraps to at most two lines in the 760px article column and the numbered prefix "11." stays on the first line (same as before; the new heading is 4 characters shorter).
- System: no other legal page references "United States residents" — `grep -rn "United States residents" src/app/\(legal\)` → no results after the change.
- Repository: `grep -n 'Do California residents have specific privacy rights?' "src/app/(legal)/privacy/page.tsx"` → exactly one match (line 183, or the `sections` array line if the TOC plan was applied first). `pnpm build` → succeeds.

## Stop conditions

- Stop if the section body has been rewritten to cover other US states (e.g. Virginia, Colorado) — then "United States" is correct and the body, not the heading, was the outlier.
- Stop if the `<Section id="california">` element no longer exists or the section has been split.

## Design documentation

- After acceptance and validation: none. No design doc governs legal copy; the heading now matches the convention visible in the file itself.
