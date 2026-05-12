import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = await prisma.blogTag.findUnique({ where: { slug } });
  if (!tag || tag.status !== "ACTIVE") return {};

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://craftusername.com";

  return {
    title: tag.seoTitle || `${tag.name} | Blog Tag`,
    description: tag.seoDescription || tag.description,
    openGraph: {
      title: tag.seoTitle || tag.name,
      description: tag.seoDescription || tag.description,
      url: `${baseUrl}/tag/${tag.slug}`,
      type: "website",
      images: tag.featuredImage ? [{ url: tag.featuredImage, alt: tag.featuredImageAlt || tag.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: tag.seoTitle || tag.name,
      description: tag.seoDescription || tag.description,
      images: tag.featuredImage ? [tag.featuredImage] : [],
    },
    alternates: {
      canonical: `${baseUrl}/tag/${tag.slug}`,
    },
    robots: tag.robots || "noindex, follow",
  };
}

export default async function TagArchivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let tag = await prisma.blogTag.findUnique({ 
    where: { slug },
    include: {
      posts: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: 'desc' },
      }
    }
  });

  if (!tag || tag.status !== "ACTIVE") {
    const isRedirect = await prisma.redirect.findUnique({ where: { source: `/tag/${slug}` } });
    if (isRedirect) {
      redirect(isRedirect.destination);
    }
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://craftusername.com";
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": tag.seoTitle || tag.name,
    "description": tag.seoDescription || tag.description,
    "url": `${baseUrl}/tag/${tag.slug}`
  };

  return (
    <div className="container" style={{ padding: "4rem 1rem", maxWidth: "1200px", margin: "0 auto" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      
      <header style={{ marginBottom: "3rem", textAlign: "center" }}>
        <h1 className="display-md" style={{ marginBottom: "1rem" }}>Posts tagged with "{tag.name}"</h1>
        {tag.description && (
          <p style={{ fontSize: "1.25rem", color: "var(--color-on-surface-variant)", maxWidth: "800px", margin: "0 auto" }}>
            {tag.description}
          </p>
        )}
      </header>

      {tag.posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "var(--color-surface-container-lowest)", borderRadius: "var(--radius-lg)" }}>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "1.125rem" }}>No posts found with this tag.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
          {tag.posts.map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <article style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "var(--color-surface-container-lowest)", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--color-outline-variant)", transition: "transform 0.2s, box-shadow 0.2s" }} className="hover-card">
                {post.featuredImage && (
                  <div style={{ width: "100%", height: "200px", overflow: "hidden" }}>
                    <img src={post.featuredImage} alt={post.featuredImageAlt || post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <h2 className="headline-sm" style={{ marginBottom: "0.5rem" }}>{post.title}</h2>
                  {post.seoDescription && <p style={{ color: "var(--color-on-surface-variant)", marginBottom: "1rem", flexGrow: 1 }}>{post.seoDescription}</p>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", fontSize: "0.875rem", color: "var(--color-on-surface-variant)" }}>
                    <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
