import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/content/blog";

export function PostCard({ post, priority }: { post: Post; priority?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className="ll-post-card">
      <div className="ll-post-card-media">
        {post.cover ? (
          <Image src={post.cover.src} alt={post.cover.alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 380px" style={{ objectFit: "cover" }} priority={priority} />
        ) : (
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "var(--ll-grad-tide)", opacity: 0.85 }} />
        )}
      </div>
      <div style={{ padding: "20px 22px 24px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "var(--ll-accent)" }}>
          {post.category}
        </p>
        <h2 style={{ margin: 0, fontFamily: "var(--ll-font-display)", fontSize: 20, fontWeight: 700, lineHeight: 1.3, letterSpacing: "-.01em", color: "var(--ll-on-ink-1)" }}>
          {post.title}
        </h2>
        <p className="ll-clamp-3" style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "var(--ll-on-ink-2)" }}>
          {post.excerpt}
        </p>
        <p style={{ margin: "auto 0 0", paddingTop: 6, fontSize: 13, color: "var(--ll-on-ink-3)" }}>{post.published}</p>
      </div>
    </Link>
  );
}

/** Card grid + its hover styles; used by /blog and the related-posts strip. */
export function PostGrid({ posts, prioritiseFirst }: { posts: Post[]; prioritiseFirst?: boolean }) {
  return (
    <div className="ll-post-grid">
      {posts.map((post, i) => (
        <PostCard key={post.slug} post={post} priority={prioritiseFirst && i < 3} />
      ))}
      <style>{`
        .ll-post-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
        .ll-post-card { display: flex; flex-direction: column; border: 1px solid var(--ll-ink-line); border-radius: 18px; overflow: hidden; background: var(--ll-ink-2); font-family: var(--ll-font-body); transition: transform .3s var(--ll-ease), border-color .3s; }
        .ll-post-card:hover { transform: translateY(-4px); border-color: rgba(78,205,196,.45); }
        .ll-post-card-media { position: relative; aspect-ratio: 16 / 9; background: var(--ll-ink-3); }
        .ll-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        @media (max-width: 1023px) { .ll-post-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 640px) { .ll-post-grid { grid-template-columns: minmax(0, 1fr); } }
      `}</style>
    </div>
  );
}
