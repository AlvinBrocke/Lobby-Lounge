import { Metadata } from "next";
import { posts } from "@/content/blog";
import { PageHeader } from "@/components/resources/PageHeader";
import { PostGrid } from "@/components/resources/PostCard";

export const metadata: Metadata = {
  title: "Blog",
  description: "Music licensing, PROs and background music for hospitality and retail businesses.",
};

export default function BlogIndexPage() {
  return (
    <div style={{ width: "100%", maxWidth: 1240, margin: "0 auto", padding: "72px 32px 96px" }}>
      <PageHeader eyebrow="Lobby & Lounge Music · Blog" title="Blog" />
      <PostGrid posts={posts} prioritiseFirst />
    </div>
  );
}
