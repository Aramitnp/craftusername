import { Metadata } from "next";
import prisma from "@/lib/prisma";
import styles from "@/app/page.module.css";
import { notFound, redirect } from "next/navigation";
import { getSiteConfig } from "@/lib/config";
import sanitizeHtml from "sanitize-html";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  
  if (post && post.status === "PUBLISHED") {
    const { seo } = await getSiteConfig();
    const brand = seo.siteName || "CraftUsername";
    const canonical = seo.canonicalUrl || "https://craftusername.com";
    const pageUrl = `${canonical}/blog/${post.slug}`;
    const title = post.seoTitle || `${post.title} | ${brand}`;
    const description = post.seoDescription || "";
    const ogImage = post.openGraphImage || post.featuredImage || seo.ogImage;

    const robotsParts = post.robots.split(",").map(s => s.trim());
    const index = robotsParts.includes("index") && !robotsParts.includes("noindex");
    const follow = robotsParts.includes("follow") && !robotsParts.includes("nofollow");

    return {
      title,
      description,
      alternates: { canonical: pageUrl },
      robots: { index, follow },
      openGraph: {
        title: post.openGraphTitle || title,
        description: post.openGraphDesc || description,
        url: pageUrl,
        siteName: brand,
        type: "article",
        publishedTime: post.publishedAt ? post.publishedAt.toISOString() : undefined,
        modifiedTime: post.updatedAt ? post.updatedAt.toISOString() : undefined,
        authors: post.author ? [post.author] : [],
        ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
      },
      twitter: {
        card: "summary_large_image",
        title: post.openGraphTitle || title,
        description: post.openGraphDesc || description,
        ...(ogImage ? { images: [ogImage] } : {}),
      },
    };
  }

  return { title: "Not Found | CraftUsername" };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  
  const post = await prisma.blogPost.findUnique({ 
    where: { slug },
    include: { category: true, tags: true }
  });
  
  if (post && post.status === "PUBLISHED") {
    const { seo } = await getSiteConfig();
    const canonicalUrl = seo.canonicalUrl || "https://craftusername.com";

    // JSON-LD Schema for BlogPosting
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${canonicalUrl}/blog/${post.slug}`
      },
      "headline": post.title,
      "description": post.seoDescription || "",
      "image": post.featuredImage || seo.ogImage,
      "author": {
        "@type": "Person",
        "name": post.author || "Admin"
      },
      "publisher": {
        "@type": "Organization",
        "name": seo.siteName || "CraftUsername",
        "logo": {
          "@type": "ImageObject",
          "url": `${canonicalUrl}/favicon.ico`
        }
      },
      "datePublished": post.publishedAt ? post.publishedAt.toISOString() : undefined,
      "dateModified": post.updatedAt ? post.updatedAt.toISOString() : undefined,
    };

    // Sanitize content before rendering
    const cleanContent = sanitizeHtml(post.content || "", {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h2', 'h3', 'h4', 'span']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        'img': ['src', 'alt', 'class'],
        'a': ['href', 'target', 'rel', 'class'],
      },
    });

    return (
      <main className={styles.main}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        
        <article style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1rem", width: "100%" }}>
          {post.category && (
            <Link href={`/category/${post.category.slug}`} style={{ color: "var(--color-primary)", textTransform: "uppercase", fontSize: "0.875rem", fontWeight: 700, textDecoration: "none", display: "inline-block", marginBottom: "1rem" }}>
              {post.category.name}
            </Link>
          )}
          <h1 className="headline-lg" style={{ marginBottom: "1rem", paddingTop: 0 }}>{post.title}</h1>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--color-on-surface-variant)", marginBottom: "2rem", fontSize: "0.875rem", borderBottom: "1px solid var(--color-outline)", paddingBottom: "1rem" }}>
            {post.author && <span>By <strong>{post.author}</strong></span>}
            {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString()}</span>}
          </div>

          {post.featuredImage && (
            <div style={{ marginBottom: "2.5rem", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
              <img 
                src={post.featuredImage} 
                alt={post.featuredImageAlt || post.title} 
                style={{ width: "100%", height: "auto", display: "block" }} 
              />
            </div>
          )}

          <div 
            className="rich-content" 
            dangerouslySetInnerHTML={{ __html: cleanContent }} 
            style={{ lineHeight: 1.8, fontSize: "1.125rem", color: "var(--color-on-surface)" }}
          />

          {post.tags && post.tags.length > 0 && (
            <div style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px solid var(--color-outline)", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, marginRight: "0.5rem", alignSelf: "center" }}>Tags:</span>
              {post.tags.map(tag => (
                <Link key={tag.id} href={`/tag/${tag.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <span style={{ backgroundColor: "var(--color-surface-container)", padding: "0.25rem 0.75rem", borderRadius: "100px", fontSize: "0.75rem", display: "inline-block" }} className="hover-card">
                    {tag.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </article>

        <style dangerouslySetInnerHTML={{__html: `
          .rich-content h2 { font-size: 1.75rem; margin-top: 2rem; margin-bottom: 1rem; font-weight: 700; }
          .rich-content h3 { font-size: 1.5rem; margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 600; }
          .rich-content p { margin-bottom: 1.25rem; }
          .rich-content img { max-width: 100%; height: auto; border-radius: var(--radius-md); margin: 1.5rem 0; }
          .rich-content a { color: var(--color-primary); text-decoration: underline; }
          .rich-content ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; }
          .rich-content ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 1.25rem; }
          .rich-content blockquote { border-left: 4px solid var(--color-outline); padding-left: 1rem; margin-left: 0; color: var(--color-on-surface-variant); font-style: italic; }
        `}} />
      </main>
    );
  }

  // 3. Try Redirects (if slug was changed)
  const redirectRule = await prisma.redirect.findUnique({ where: { source: `/blog/${slug}` } });
  if (redirectRule) {
    redirect(redirectRule.destination);
  }

  notFound();
}
