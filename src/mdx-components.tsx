import type { MDXComponents } from "mdx/types";
import { Figure, FigureRow } from "@/components/resources/Figure";

// Required by @next/mdx in the App Router. Typography for MDX lives in the
// `.ll-prose` styles (src/components/resources/Prose.tsx); here we only make
// external links open safely in a new tab and expose the figure components.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href = "", children }) =>
      href.startsWith("http") ? (
        <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
      ) : (
        <a href={href}>{children}</a>
      ),
    table: ({ children }) => (
      <div className="ll-table-wrap">
        <table>{children}</table>
      </div>
    ),
    Figure,
    FigureRow,
    ...components,
  };
}
