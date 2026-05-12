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
  let platform = await prisma.platform.findUnique({ where: { slug } });
  if (platform) return platform;

  if (slug.endsWith("-username-checker")) {
    const baseSlug = slug.replace("-username-checker", "");
    platform = await prisma.platform.findUnique({ where: { slug: baseSlug } });
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
      take: 6,
    });

    const contentTitle = platform.contentTitle || `About ${platform.name} Username Checker`;
    const contentBody = platform.contentBody || `Use CraftUsername to instantly check if your desired username is available on ${platform.name}. Our tool queries ${platform.name}'s public profile system to determine availability in real time. Save time by checking here before signing up.`;

    return (
      <main className={styles.main}>
        <CheckerClient initialPlatformSlug={platform.slug} dynamicContent={content} />

        <section className={styles.platformContentSection}>
          <h2 className="headline-md">{contentTitle}</h2>
          <p style={{ color: "var(--color-on-surface-variant)", lineHeight: 1.7, fontSize: "1.0625rem" }}>
            {contentBody}
          </p>
        </section>

        {relatedPlatforms.length > 0 && (
          <section className={styles.relatedPlatformsSection}>
            <h3 className="headline-md" style={{ paddingTop: 0 }}>Check Other Platforms</h3>
            <div className={styles.popularPlatformsGrid}>
              {relatedPlatforms.map(p => {
                const fullSlug = p.slug.endsWith("-username-checker") ? p.slug : `${p.slug}-username-checker`;
                return (
                  <Link key={p.id} href={`/${fullSlug}`} className={styles.popularPlatformCard}>
                    <div className={styles.popularPlatformLogo}>
                      {p.logo ? <img src={p.logo} alt={p.name} /> : <span>{p.name[0]}</span>}
                    </div>
                    <span className={styles.popularPlatformName}>{p.name}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
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
