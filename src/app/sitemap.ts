import type { MetadataRoute } from "next";
import { posts } from "@/content/blog";
import { SITE_URL } from "@/lib/site";

// Served at /sitemap.xml. Public pages only — the app routes sit behind sign-in.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/blog", "/help", "/privacy", "/terms", "/cookies"];
  return [
    ...pages.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.date })),
  ];
}
