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
            {allPlatforms.map(p => (
              <Link key={p.id} href={`/${p.slug}-username-checker`} className={styles.popularPlatformCard}>
                <div className={styles.popularPlatformLogo}>
                  {p.logo ? <img src={p.logo} alt={p.name} /> : <span>{p.name[0]}</span>}
                </div>
                <span className={styles.popularPlatformName}>{p.name} Username Checker</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
