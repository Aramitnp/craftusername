import { Metadata } from "next";
import styles from "./page.module.css";
import CheckerClient from "@/components/CheckerClient";
import { getSiteConfig } from "@/lib/config";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSiteConfig();
  const canonical = seo.canonicalUrl || "https://craftusername.com";

  return {
    title: seo.mainTitle,
    description: seo.mainDescription,
    alternates: { canonical },
    openGraph: {
      title: seo.ogTitle || seo.mainTitle,
      description: seo.ogDescription || seo.mainDescription,
      url: canonical,
      siteName: seo.siteName,
      type: "website",
      ...(seo.ogImage ? { images: [{ url: seo.ogImage, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.ogTitle || seo.mainTitle,
      description: seo.ogDescription || seo.mainDescription,
      ...(seo.ogImage ? { images: [seo.ogImage] } : {}),
    },
  };
}

export default async function Home() {
  const { content } = await getSiteConfig();
  const allPlatforms = await prisma.platform.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  let featuredPosts: any[] = [];
  
  if (content.featuredBlogPosts && content.featuredBlogPosts.length > 0) {
    featuredPosts = await prisma.blogPost.findMany({
      where: { 
        id: { in: content.featuredBlogPosts },
        status: "PUBLISHED"
      },
      include: { category: true, tags: true },
      take: 3
    });
  } else if (content.featuredBlogTagId) {
    featuredPosts = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        tags: { some: { id: content.featuredBlogTagId } }
      },
      include: { category: true, tags: true },
      orderBy: { publishedAt: "desc" },
      take: 3
    });
  } else {
    // Fallback: Latest 3 posts
    featuredPosts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      include: { category: true, tags: true },
      orderBy: { publishedAt: "desc" },
      take: 3
    });
  }

  return (
    <main className={styles.main}>
      <CheckerClient dynamicContent={content} />

      {/* How It Works */}
      <section className={styles.howItWorksSection}>
        <h2 className="headline-md">{content.howItWorksTitle || "How It Works"}</h2>
        <div className={styles.howItWorksGrid}>
          <div className={styles.howItWorksCard}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>{content.howItWorksStep1Title || "Enter a Username"}</h3>
            <p className={styles.stepText}>{content.howItWorksStep1Text || "Type the username you want to check."}</p>
          </div>
          <div className={styles.howItWorksCard}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>{content.howItWorksStep2Title || "We Check All Platforms"}</h3>
            <p className={styles.stepText}>{content.howItWorksStep2Text || "Our system queries multiple platforms."}</p>
          </div>
          <div className={styles.howItWorksCard}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>{content.howItWorksStep3Title || "See Your Results"}</h3>
            <p className={styles.stepText}>{content.howItWorksStep3Text || "Get a clear overview of availability."}</p>
          </div>
        </div>
      </section>

      {/* Popular Platform Pages — internal linking */}
      {allPlatforms.length > 0 && (
        <section className={styles.popularPlatformsSection}>
          <h2 className="headline-md">{content.popularPlatformsTitle || "Check By Platform"}</h2>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "1.125rem", marginBottom: "2rem" }}>
            {content.popularPlatformsDesc || "Jump directly to a platform-specific username checker."}
          </p>
          <div className={styles.popularPlatformsGrid}>
            {allPlatforms.map(p => {
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

      {/* Homepage Blog Section */}
      {featuredPosts.length > 0 && (
        <section className={styles.homepageBlogSection}>
          <h2 className="headline-md">{content.homepageBlogTitle || "Latest Username Ideas & Guides"}</h2>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: "1.125rem", marginBottom: "1rem" }}>
            {content.homepageBlogSubtitle || "Explore tips, username ideas, and branding guides for social media platforms."}
          </p>
          
          <div className={styles.homepageBlogGrid}>
            {featuredPosts.map((post) => {
              let excerpt = post.seoDescription;
              if (!excerpt && post.content) {
                const plainText = post.content.replace(/<[^>]*>?/gm, '');
                excerpt = plainText.substring(0, 150) + "...";
              }

              return (
                <Link key={post.id} href={`/blog/${post.slug}`} className={styles.homepageBlogCard}>
                  {post.featuredImage && (
                    <div className={styles.homepageBlogImage}>
                      <img 
                        src={post.featuredImage} 
                        alt={post.featuredImageAlt || post.title} 
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className={styles.homepageBlogContent}>
                    {post.category && (
                      <span className={styles.homepageBlogBadge}>
                        {post.category.name}
                      </span>
                    )}
                    <h3 className={styles.homepageBlogTitle}>{post.title}</h3>
                    <p className={styles.homepageBlogExcerpt}>{excerpt}</p>
                    <div className={styles.homepageBlogFooter}>
                      <span className={styles.homepageBlogReadMore}>Read More →</span>
                      {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
