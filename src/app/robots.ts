import { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { seo } = await getSiteConfig();
  const baseUrl = seo.canonicalUrl || "https://craftusername.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/admin/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
