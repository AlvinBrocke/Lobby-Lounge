import { Metadata } from "next";
import { notFound } from "next/navigation";
import { posts, getPost, relatedPosts } from "@/content/blog";
import { PageHeader } from "@/components/resources/PageHeader";
import { Breadcrumbs } from "@/components/resources/Breadcrumbs";
import { Prose } from "@/components/resources/Prose";
import { SupportCard } from "@/components/resources/SupportCard";
import { PostGrid } from "@/components/resources/PostCard";

// Every post is known at build time, so each one is prerendered as static HTML
// and any other slug is a 404 rather than an on-demand render.
export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      images: post.cover ? [post.cover.src] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const { Content } = post;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.date,
    image: post.cover?.src,
    publisher: { "@type": "Organization", name: "Lobby & Lounge Music" },
  };

  return (
    <div style={{ width: "100%", maxWidth: 1240, margin: "0 auto", padding: "72px 32px 96px" }}>
      <article style={{ maxWidth: 760, margin: "0 auto" }}>
        <PageHeader eyebrow={<Breadcrumbs trail={post.breadcrumb} />} title={post.title}>
          {post.published}
        </PageHeader>
        <Prose>
          <Content />
        </Prose>
        <SupportCard lines={["Was this article helpful?", "Have more questions? Submit a request"]} subject={`Question about: ${post.title}`} />
      </article>

      <section aria-labelledby="related" style={{ marginTop: 80, paddingTop: 40, borderTop: "1px solid var(--ll-ink-line)" }}>
        <h2 id="related" style={{ fontFamily: "var(--ll-font-display)", fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 24px" }}>
          Related Articles
        </h2>
        <PostGrid posts={relatedPosts(post.slug)} />
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
