import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.blogCategory.findUnique({ where: { slug } });
  if (!category || category.status !== "ACTIVE") return {};

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://craftusername.com";

  return {
    title: category.seoTitle || `${category.name} | Blog Category`,
    description: category.seoDescription || category.description,
    openGraph: {
      title: category.seoTitle || category.name,
      description: category.seoDescription || category.description,
      url: `${baseUrl}/category/${category.slug}`,
      type: "website",
      images: category.featuredImage ? [{ url: category.featuredImage, alt: category.featuredImageAlt || category.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: category.seoTitle || category.name,
      description: category.seoDescription || category.description,
      images: category.featuredImage ? [category.featuredImage] : [],
    },
    alternates: {
      canonical: `${baseUrl}/category/${category.slug}`,
    },
    robots: category.robots || "index, follow",
  };
}

export default async function CategoryArchivePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let category = await prisma.blogCategory.findUnique({ 
    where: { slug },
    include: {
      posts: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: 'desc' },
      }
    }
  });

  if (!category || category.status !== "ACTIVE") {
    const isRedirect = await prisma.redirect.findUnique({ where: { source: `/category/${slug}` } });
    if (isRedirect) {
      redirect(isRedirect.destination);
    }
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://craftusername.com";
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category.seoTitle || category.name,
    "description": category.seoDescription || category.description,
    "url": `${baseUrl}/category/${category.slug}`
  };

  return (
    <div className="container" style={{ padding: "4rem 1rem", maxWidth: "1200px", margin: "0 auto" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      
      <header style={{ marginBottom: "3rem", textAlign: "center" }}>
        <h1 className="display-md" style={{ marginBottom: "1rem" }}>{category.name}</h1>
        {category.description && (
          <p style={{ fontSize: "1.25rem", color: "var(--color-on-surface-variant)", maxWidth: "800px", margin: "0 auto" }}>
            {category.description}
          </p>
        )}
      </header>

      {category.posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "var(--color-surface-container-lowest)", borderRadius: "var(--radius-lg)" }}>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "1.125rem" }}>No posts found in this category.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
          {category.posts.map(post => (
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
