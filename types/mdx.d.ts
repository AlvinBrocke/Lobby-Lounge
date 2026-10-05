// Blog posts (src/content/blog/*.mdx) export a `meta` object alongside the
// default MDX component. This merges with @types/mdx's `*.mdx` declaration.
declare module "*.mdx" {
  export const meta: import("@/content/blog").PostMeta;
}
