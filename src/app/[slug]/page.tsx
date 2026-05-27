import { Metadata } from "next";
import prisma from "@/lib/prisma";
import styles from "@/app/page.module.css";
import CheckerClient from "@/components/CheckerClient";
import { notFound, redirect } from "next/navigation";
import { getSiteConfig } from "@/lib/config";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPlatformBySlug(slug: string) {
  const include = {
    faqs: { orderBy: { sortOrder: 'asc' } as const },
    relatedBlogPosts: {
      orderBy: { sortOrder: 'asc' } as const,
      include: { blogPost: true }
    }
  };

  let platform = await prisma.platform.findUnique({ where: { slug }, include });
  if (platform) return platform;

  if (slug.endsWith("-username-checker")) {
    const baseSlug = slug.replace("-username-checker", "");
    platform = await prisma.platform.findUnique({ where: { slug: baseSlug }, include });
  }

  return platform;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const platform = await getPlatformBySlug(slug);
  const { seo } = await getSiteConfig();
  const brand = seo.siteName || "CraftUsername";
  const canonical = seo.canonicalUrl || "https://craftusername.com";

  if (platform && platform.isActive) {
    const fullSlug = platform.slug.endsWith("-username-checker") ? platform.slug : `${platform.slug}-username-checker`;
    const pageUrl = `${canonical}/${fullSlug}`;
    const title = platform.seoTitleOverride || `${platform.name} Username Checker | ${brand}`;
    const description = platform.seoDescOverride || `Check if your desired username is available on ${platform.name}.`;
    const ogImage = seo.ogImage;

    return {
      title,
      description,
      alternates: { canonical: pageUrl },
      openGraph: {
        title,
        description,
        url: pageUrl,
        siteName: brand,
        type: "website",
        ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(ogImage ? { images: [ogImage] } : {}),
      },
    };
  }

  const page = await prisma.page.findUnique({ where: { slug } });
  if (page && page.status === "PUBLISHED") {
    const pageUrl = `${canonical}/${page.slug}`;
    const title = page.seoTitle || `${page.title} | ${brand}`;
    const description = page.seoDescription || "";
    const ogImage = page.openGraphImage || page.featuredImage || seo.ogImage;

    const robotsParts = page.robots.split(",").map(s => s.trim());
    const index = robotsParts.includes("index") && !robotsParts.includes("noindex");
    const follow = robotsParts.includes("follow") && !robotsParts.includes("nofollow");

    return {
      title,
      description,
      alternates: { canonical: pageUrl },
      robots: { index, follow },
      openGraph: {
        title: page.openGraphTitle || title,
        description: page.openGraphDesc || description,
        url: pageUrl,
        siteName: brand,
        type: "website",
        ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
      },
      twitter: {
        card: "summary_large_image",
        title: page.openGraphTitle || title,
        description: page.openGraphDesc || description,
        ...(ogImage ? { images: [ogImage] } : {}),
      },
    };
  }

  return { title: "Not Found | CraftUsername" };
}

export default async function PlatformCheckerOrCustomPage({ params }: Props) {
  const { slug } = await params;
  
  // 1. Try Platform
  const platform = await getPlatformBySlug(slug);

  if (platform && platform.isActive) {
    const { content } = await getSiteConfig();
    const relatedPlatforms = await prisma.platform.findMany({
      where: { isActive: true, id: { not: platform.id } },
      orderBy: { sortOrder: "asc" },
    });

    const contentTitle = platform.contentTitle || `About ${platform.name} Username Checker`;
    const contentBody = platform.contentBody || `Use CraftUsername to instantly check if your desired username is available on ${platform.name}. Our tool queries ${platform.name}'s public profile system to determine availability in real time. Save time by checking here before signing up.`;

    return (
      <main className={styles.main}>
        <CheckerClient initialPlatformSlug={platform.slug} dynamicContent={content} platformHeroSubtitle={platform.heroSubtitle} />

        <div style={{ backgroundColor: "var(--color-surface-container-lowest)", borderTop: "1px solid var(--color-outline-variant)", flexGrow: 1, paddingTop: "4rem" }}>
          
          {contentBody && (
            <article style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1rem", width: "100%" }}>
              {contentTitle && <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "2rem", color: "var(--color-on-surface)", textAlign: "center", letterSpacing: "-0.01em" }}>{contentTitle}</h2>}
              <div 
                className="rich-content"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentBody, {
                  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h2', 'h3', 'h4', 'span']),
                  allowedAttributes: {
                    ...sanitizeHtml.defaults.allowedAttributes,
                    'img': ['src', 'alt', 'class'],
                    'a': ['href', 'target', 'rel', 'class'],
                  },
                }) }}
              />
            </article>
          )}

          {platform.faqs && platform.faqs.length > 0 && (
            <section style={{ width: "100%", maxWidth: "800px", margin: "5rem auto 0", padding: "0 1rem" }}>
              <h3 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-on-surface)", marginBottom: "2rem", textAlign: "center" }}>Frequently Asked Questions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                {platform.faqs.map((faq: any, index: number) => (
                  <details key={index} className="faq-accordion">
                    <summary className="faq-summary">
                      {faq.question}
                      <span className="faq-icon">↓</span>
                    </summary>
                    <div className="faq-answer">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {platform.relatedBlogPosts && platform.relatedBlogPosts.length > 0 && (
            <section style={{ width: "100%", maxWidth: "1000px", margin: "5rem auto 0", padding: "0 1rem" }}>
              <h3 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-on-surface)", marginBottom: "2.5rem", textAlign: "center" }}>Related Username Ideas & Guides</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
                {platform.relatedBlogPosts.map(({ blogPost }: any) => (
                  <Link key={blogPost.id} href={`/blog/${blogPost.slug}`} style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", height: "100%", backgroundColor: "var(--color-surface)", border: "1px solid var(--color-outline-variant)", borderRadius: "var(--radius-lg)", overflow: "hidden" }} className="hover-card">
                    {blogPost.featuredImage && (
                      <div style={{ width: "100%", height: "200px", overflow: "hidden" }}>
                        <img src={blogPost.featuredImage} alt={blogPost.featuredImageAlt || blogPost.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                    <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                      <h4 style={{ fontWeight: 600, fontSize: "1.25rem", color: "var(--color-primary)", marginBottom: "0.5rem", lineHeight: 1.4 }}>{blogPost.title}</h4>
                      {blogPost.seoDescription && <p style={{ color: "var(--color-on-surface-variant)", fontSize: "0.9375rem", lineHeight: 1.6, margin: 0, flexGrow: 1 }}>{blogPost.seoDescription}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {relatedPlatforms.length > 0 && (
            <section style={{ width: "100%", maxWidth: "1000px", margin: "5rem auto 5rem", padding: "0 1rem", textAlign: "center" }}>
              <h2 className="headline-md" style={{ paddingTop: 0, marginBottom: "1rem" }}>Check Other Platforms</h2>
              <p style={{ color: "var(--color-on-surface-variant)", fontSize: "1.125rem", marginBottom: "3rem" }}>
                Explore username availability across other popular social media platforms.
              </p>
              <div className={styles.popularPlatformsGrid}>
                {relatedPlatforms.map(p => {
                  const fullSlug = p.slug.endsWith("-username-checker") ? p.slug : `${p.slug}-username-checker`;
                  return (
                    <Link key={p.id} href={`/${fullSlug}`} className={styles.popularPlatformCard}>
                      <div className={styles.popularPlatformLogo}>
                        {p.logo ? <img src={p.logo} alt={p.name} /> : <span>{p.name[0]}</span>}
                      </div>
                      <span className={styles.popularPlatformName}>{p.name} Username Checker</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .rich-content { font-size: 1.125rem; line-height: 1.8; color: var(--color-on-surface); }
          .rich-content h2 { font-size: 2rem; margin-top: 3rem; margin-bottom: 1.5rem; font-weight: 700; color: var(--color-primary); }
          .rich-content h3 { font-size: 1.5rem; margin-top: 2rem; margin-bottom: 1rem; font-weight: 600; }
          .rich-content p { margin-bottom: 1.5rem; }
          .rich-content img { max-width: 100%; height: auto; border-radius: var(--radius-lg); margin: 2rem 0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .rich-content a { color: var(--color-primary); text-decoration: underline; text-underline-offset: 4px; font-weight: 500; transition: color 0.2s; }
          .rich-content a:hover { color: var(--color-on-surface); }
          .rich-content ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; }
          .rich-content ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 1.5rem; }
          .rich-content li { margin-bottom: 0.5rem; }
          .rich-content blockquote { border-left: 4px solid var(--color-primary); padding-left: 1.5rem; margin-left: 0; color: var(--color-on-surface-variant); font-style: italic; background: var(--color-surface-container-lowest); padding: 1.5rem; border-radius: 0 var(--radius-lg) var(--radius-lg) 0; }
          
          .faq-accordion { background-color: var(--color-surface-container-lowest); border: 1px solid var(--color-outline-variant); border-radius: var(--radius-lg); overflow: hidden; transition: box-shadow 0.2s; }
          .faq-accordion:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
          .faq-summary { padding: 1.25rem 1.5rem; font-weight: 600; font-size: 1.125rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; list-style: none; }
          .faq-summary::-webkit-details-marker { display: none; }
          .faq-icon { color: var(--color-primary); transition: transform 0.2s; font-size: 1.25rem; line-height: 1; }
          .faq-accordion[open] .faq-icon { transform: rotate(180deg); }
          .faq-answer { padding: 0 1.5rem 1.5rem; color: var(--color-on-surface-variant); line-height: 1.6; font-size: 1.0625rem; }
          
          .hover-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
          .hover-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); border-color: var(--color-outline); }
        `}} />
      </main>
    );
  }

  // 2. Try Custom Page
  const page = await prisma.page.findUnique({ where: { slug } });
  
  if (page && page.status === "PUBLISHED") {
    const { seo } = await getSiteConfig();
    const canonicalUrl = seo.canonicalUrl || "https://craftusername.com";

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": page.title,
      "description": page.seoDescription || "",
      "url": `${canonicalUrl}/${page.slug}`,
    };

    // Sanitize content before rendering
    const cleanContent = sanitizeHtml(page.content || "", {
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
          <h1 className="headline-lg" style={{ marginBottom: "1rem", paddingTop: 0 }}>{page.title}</h1>
          
          {page.updatedAt && (
            <div style={{ color: "var(--color-on-surface-variant)", marginBottom: "2rem", fontSize: "0.875rem" }}>
              Last updated: {new Date(page.updatedAt).toLocaleDateString()}
            </div>
          )}

          {page.featuredImage && (
            <div style={{ marginBottom: "2rem", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
              <img 
                src={page.featuredImage} 
                alt={page.featuredImageAlt || page.title} 
                style={{ width: "100%", height: "auto", display: "block" }} 
              />
            </div>
          )}

          <div 
            className="rich-content" 
            dangerouslySetInnerHTML={{ __html: cleanContent }} 
            style={{ lineHeight: 1.8, fontSize: "1.125rem", color: "var(--color-on-surface)" }}
          />
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

  // 3. Try Redirects
  const redirectRule = await prisma.redirect.findUnique({ where: { source: `/${slug}` } });
  if (redirectRule) {
    redirect(redirectRule.destination); // Next.js handles 307/308 based on type but we do default
  }

  notFound();
}
