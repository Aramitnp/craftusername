import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { getSiteConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { seo } = await getSiteConfig();
  const baseUrl = seo.canonicalUrl || "https://craftusername.com";

  // Platforms
  const platforms = await prisma.platform.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const platformEntries: MetadataRoute.Sitemap = platforms.map((p) => {
    const fullSlug = p.slug.endsWith("-username-checker") ? p.slug : `${p.slug}-username-checker`;
    return {
      url: `${baseUrl}/${fullSlug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    };
  });

  // Pages
  const pages = await prisma.page.findMany({
    where: { 
      status: "PUBLISHED",
      NOT: { robots: { contains: "noindex" } }
    },
  });

  const pageEntries: MetadataRoute.Sitemap = pages.map((p) => ({
    url: `${baseUrl}/${p.slug}`,
    lastModified: p.updatedAt || new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Blog Posts
  const blogPosts = await prisma.blogPost.findMany({
    where: { 
      status: "PUBLISHED",
      NOT: { robots: { contains: "noindex" } }
    },
  });

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: p.updatedAt || new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Blog Categories
  const categories = await prisma.blogCategory.findMany({
    where: { 
      status: "ACTIVE",
      NOT: { robots: { contains: "noindex" } }
    },
  });

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/category/${c.slug}`,
    lastModified: c.updatedAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  // Blog Tags
  const tags = await prisma.blogTag.findMany({
    where: { 
      status: "ACTIVE",
      NOT: { robots: { contains: "noindex" } }
    },
  });

  const tagEntries: MetadataRoute.Sitemap = tags.map((t) => ({
    url: `${baseUrl}/tag/${t.slug}`,
    lastModified: t.updatedAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...platformEntries,
    ...pageEntries,
    ...blogEntries,
    ...categoryEntries,
    ...tagEntries,
  ];
}
