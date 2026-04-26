"use client";

import { useState, useEffect } from "react";
import styles from "@/app/page.module.css";
import { config as staticConfig } from "@/config/content";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Search } from "lucide-react";
import Link from "next/link";

type CheckResult = {
  platformId: string;
  platformName: string;
  platformLogo: string;
  profileUrl: string;
  status: "Available" | "Taken" | "Unknown";
};

export default function CheckerClient({ 
  initialPlatformSlug,
  dynamicContent
}: { 
  initialPlatformSlug?: string,
  dynamicContent?: any
}) {
  const [username, setUsername] = useState("");
  const [results, setResults] = useState<CheckResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [platforms, setPlatforms] = useState<any[]>([]);

  // Fallback to static config if dynamic content isn't passed (e.g. build time issues)
  const homeContent = dynamicContent || staticConfig.home;
  const seoContent = dynamicContent || staticConfig.seoContent;

  useEffect(() => {
    fetch("/api/platforms?activeOnly=true")
      .then(res => res.json())
      .then(data => {
        if (initialPlatformSlug) {
          setPlatforms(data.filter((p: any) => p.slug === initialPlatformSlug));
        } else {
          setPlatforms(data);
        }
      })
      .catch(console.error);
  }, [initialPlatformSlug]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const platformIds = platforms.map((p: any) => p.id);
      if (platformIds.length === 0) {
        setError("No active platforms found to check.");
        setLoading(false);
        return;
      }

      const checkRes = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, platformIds }),
      });

      if (!checkRes.ok) throw new Error("Failed to check username");
      const checkData = await checkRes.json();
      setResults(checkData);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const hasSearched = results.length > 0 || loading;

  const isPlatformPage = initialPlatformSlug && platforms.length > 0;
  
  const rawHeroTitle = homeContent.heroTitle?.trim() || "";
  
  let actualDisplayTitle = rawHeroTitle;

  if (isPlatformPage) {
    actualDisplayTitle = `Check ${platforms[0].name} Username.`;
  }

  return (
    <>
      <section className={styles.heroSection} style={{ paddingBottom: hasSearched ? "4rem" : "6rem" }}>
        <h1 className={`display-lg ${styles.heroTitle}`}>
          {actualDisplayTitle}
        </h1>
        <p className={styles.heroSubtitle}>{homeContent.heroSubtitle}</p>

        <form className={styles.searchContainer} onSubmit={handleSearch}>
          <Input 
            placeholder={homeContent.searchPlaceholder}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading || platforms.length === 0}
          />
          <Button type="submit" disabled={loading || !username.trim() || platforms.length === 0} style={{ padding: "1rem 2rem", fontSize: "1.125rem" }}>
            {loading ? "Checking..." : <><Search size={22} style={{marginRight: 8}}/> {homeContent.searchButton}</>}
          </Button>
        </form>
        {error && <p style={{color: "var(--color-on-error-container)", marginTop: "1.5rem"}}>{error}</p>}
      </section>

      {!hasSearched && platforms.length > 0 && (
        <section className={styles.supportedPlatformsSection}>
          <h2 className="headline-md" style={{ paddingTop: 0 }}>{homeContent.supportedPlatformsTitle}</h2>
          <div 
            style={{ color: "var(--color-on-surface-variant)", fontSize: "1.125rem", marginBottom: "1rem" }}
            dangerouslySetInnerHTML={{ __html: homeContent.supportedPlatformsDesc }}
          />
          <div className={styles.supportedPlatformsGrid}>
            {platforms.map(p => {
              const fullSlug = p.slug.endsWith("-username-checker") ? p.slug : `${p.slug}-username-checker`;
              return (
                <Link key={p.id} href={`/${fullSlug}`} className={styles.supportedBadge} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className={styles.supportedLogo}>
                    {p.logo ? <img src={p.logo} alt={p.name} /> : <span style={{ fontSize: "12px", fontWeight: "bold" }}>{p.name[0]}</span>}
                  </div>
                  <span>{p.name}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {results.length > 0 && (
        <section className={styles.resultsSection}>
          <div className={styles.resultsGrid}>
            {results.map((result) => (
              <Card key={result.platformId} hoverable={true} className={styles.platformCard}>
                <div className={styles.platformInfo}>
                  <div className={styles.platformLogo}>
                    {result.platformLogo ? (
                      <img src={result.platformLogo} alt={result.platformName} />
                    ) : (
                      <span className="label-md">{result.platformName.charAt(0)}</span>
                    )}
                  </div>
                  <span className={styles.platformName}>{result.platformName}</span>
                </div>
                <Badge status={result.status} />
              </Card>
            ))}
          </div>
        </section>
      )}

      {!loading && (
        <section className={styles.seoSection}>
          <h2 className="headline-md">{seoContent.explanationTitle}</h2>
          <p style={{marginBottom: "3rem", color: "var(--color-on-surface-variant)", lineHeight: 1.6, fontSize: "1.125rem"}}>
            {seoContent.explanationText}
          </p>

          <h3 className="headline-md" style={{paddingTop: 0}}>Frequently Asked Questions</h3>
          <div style={{ marginBottom: "4rem" }}>
            {seoContent.faq.map((faq: any, index: number) => (
              <div key={index} className={styles.faqItem}>
                <h4 className={styles.faqQuestion} style={{ fontSize: "1.125rem" }}>{faq.question}</h4>
                <p className={styles.faqAnswer}>{faq.answer}</p>
              </div>
            ))}
          </div>

          <h3 className="headline-md" style={{paddingTop: 0}}>{seoContent.relatedToolsTitle}</h3>
          <div className={styles.relatedToolsGrid}>
            {seoContent.relatedTools.map((tool: any, index: number) => (
              <div key={index} className={styles.relatedToolCard}>
                <h4 style={{ marginBottom: "0.5rem", color: "var(--color-primary)", fontWeight: 700 }}>{tool.title}</h4>
                <p style={{ color: "var(--color-on-surface-variant)", fontSize: "0.875rem" }}>{tool.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
