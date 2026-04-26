import { Metadata } from "next";
import prisma from "@/lib/prisma";
import styles from "@/app/page.module.css";
import CheckerClient from "@/components/CheckerClient";
import { notFound } from "next/navigation";
import { getSiteConfig } from "@/lib/config";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPlatformBySlug(slug: string) {
  // Try exact match first (if admin entered the full custom slug)
  let platform = await prisma.platform.findUnique({ where: { slug } });
  if (platform) return platform;

  // Fallback: If it ends with -username-checker, strip it and try again.
  // This supports legacy database entries like 'instagram' resolving for '/instagram-username-checker'
  if (slug.endsWith("-username-checker")) {
    const baseSlug = slug.replace("-username-checker", "");
    platform = await prisma.platform.findUnique({ where: { slug: baseSlug } });
  }

  return platform;
}



export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const platform = await getPlatformBySlug(slug);

  if (!platform) {
    return { title: "Not Found | CraftUsername" };
  }

  const { seo } = await getSiteConfig();
  const brand = seo.siteName || "CraftUsername";
  const canonical = seo.canonicalUrl || "https://craftusername.com";
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
      title: title,
      description: description,
      url: pageUrl,
      siteName: brand,
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function PlatformCheckerPage({ params }: Props) {
  const { slug } = await params;
  const platform = await getPlatformBySlug(slug);

  if (!platform || !platform.isActive) {
    notFound();
  }

  const { content } = await getSiteConfig();

  // Get other active platforms for "Related Platforms"
  const relatedPlatforms = await prisma.platform.findMany({
    where: { isActive: true, id: { not: platform.id } },
    orderBy: { sortOrder: "asc" },
    take: 6,
  });

  // Content fallbacks
  const contentTitle = platform.contentTitle || `About ${platform.name} Username Checker`;
  const contentBody = platform.contentBody || `Use CraftUsername to instantly check if your desired username is available on ${platform.name}. Our tool queries ${platform.name}'s public profile system to determine availability in real time. Save time by checking here before signing up.`;

  return (
    <main className={styles.main}>
      <CheckerClient initialPlatformSlug={platform.slug} dynamicContent={content} />

      {/* Platform-specific SEO content */}
      <section className={styles.platformContentSection}>
        <h2 className="headline-md">{contentTitle}</h2>
        <p style={{ color: "var(--color-on-surface-variant)", lineHeight: 1.7, fontSize: "1.0625rem" }}>
          {contentBody}
        </p>
      </section>

      {/* Related Platforms — internal linking */}
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
