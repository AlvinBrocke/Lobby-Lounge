import type { Metadata } from "next";
import { MarketingPage } from "@/components/landing/MarketingPage";

export const metadata: Metadata = { title: "Blog · Lobby & Lounge" };

// Add posts here as { slug, title, date, summary }. The list is empty on
// purpose until the first real post is written.
const posts: { slug: string; title: string; date: string; summary: string }[] = [];

export default function BlogPage() {
  return (
    <MarketingPage
      eyebrow="Blog"
      title="Notes on music, venues and atmosphere."
      intro="Practical writing about background music for hospitality — what works, what the research says, and what we're building."
    >
      {posts.length === 0 ? (
        <div className="ll-card">
          <h3>First posts coming soon</h3>
          <p>
            We&apos;re writing the first pieces now. In the meantime, the <a href="/licensing">Licensing</a> page is a good place to start.
          </p>
        </div>
      ) : (
        posts.map((post) => (
          <div className="ll-card" key={post.slug}>
            <h3>{post.title}</h3>
            <p>{post.summary}</p>
            <small>{post.date}</small>
          </div>
        ))
      )}
    </MarketingPage>
  );
}
