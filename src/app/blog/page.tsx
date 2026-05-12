import { Metadata } from "next";
import prisma from "@/lib/prisma";
import Link from "next/link";
import styles from "@/app/page.module.css";
import { getSiteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSiteConfig();
  const brand = seo.siteName || "CraftUsername";
  const canonical = seo.canonicalUrl || "https://craftusername.com";

  return {
    title: `Blog | ${brand}`,
    description: "Read the latest tips, guides, and ideas for creating the perfect username.",
    alternates: { canonical: `${canonical}/blog` },
  };
}

export default async function BlogListingPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: { category: true }
  });

  return (
    <main className={styles.main}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem 1rem", width: "100%" }}>
        <h1 className="headline-lg" style={{ marginBottom: "1rem", paddingTop: 0 }}>Blog</h1>
        <p style={{ color: "var(--color-on-surface-variant)", marginBottom: "3rem", fontSize: "1.125rem" }}>
          Latest articles, tips, and username ideas.
        </p>

        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", backgroundColor: "var(--color-surface-container-lowest)", borderRadius: "var(--radius-lg)" }}>
            <p style={{ color: "var(--color-on-surface-variant)" }}>No posts found.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
            {posts.map((post) => {
              // Create excerpt from content
              let excerpt = post.seoDescription;
              if (!excerpt && post.content) {
                const plainText = post.content.replace(/<[^>]*>?/gm, '');
                excerpt = plainText.substring(0, 150) + "...";
              }

              return (
                <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--color-outline)", transition: "transform 0.2s, box-shadow 0.2s" }} className="blog-card">
                  {post.featuredImage && (
                    <div style={{ width: "100%", height: "200px", backgroundColor: "var(--color-surface-container)" }}>
                      <img src={post.featuredImage} alt={post.featuredImageAlt || post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    {post.category && (
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-primary)", marginBottom: "0.5rem" }}>
                        {post.category.name}
                      </span>
                    )}
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem", lineHeight: 1.4 }}>{post.title}</h2>
                    <p style={{ color: "var(--color-on-surface-variant)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1rem", flexGrow: 1 }}>
                      {excerpt}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--color-outline)", fontSize: "0.75rem", color: "var(--color-on-surface-variant)" }}>
                      <span>{post.author || "Admin"}</span>
                      <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        <style dangerouslySetInnerHTML={{__html: `
          .blog-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.05);
          }
        `}} />
      </div>
    </main>
  );
}
