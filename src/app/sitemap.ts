import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { getSiteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { seo } = await getSiteConfig();
  const baseUrl = seo.canonicalUrl || "https://craftusername.com";

  const platforms = await prisma.platform.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const platformEntries: MetadataRoute.Sitemap = platforms.map((p) => ({
    url: `${baseUrl}/${p.slug}-username-checker`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...platformEntries,
  ];
}
