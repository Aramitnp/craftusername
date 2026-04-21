import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { config as defaultConfig } from "@/config/content";

async function getOrCreateConfig() {
  let siteConfig = await prisma.siteConfig.findUnique({
    where: { id: "global" },
  });

  if (!siteConfig) {
    const defaultContent = {
      heroTitle: defaultConfig.home.heroTitle,
      heroSubtitle: defaultConfig.home.heroSubtitle,
      searchPlaceholder: defaultConfig.home.searchPlaceholder,
      searchButton: defaultConfig.home.searchButton,
      supportedPlatformsTitle: defaultConfig.home.supportedPlatformsTitle,
      supportedPlatformsDesc: defaultConfig.home.supportedPlatformsDesc,
      explanationTitle: defaultConfig.seoContent.explanationTitle,
      explanationText: defaultConfig.seoContent.explanationText,
      faq: defaultConfig.seoContent.faq,
      relatedToolsTitle: defaultConfig.seoContent.relatedToolsTitle,
      relatedTools: defaultConfig.seoContent.relatedTools,
    };

    const defaultSeo = {
      siteName: defaultConfig.global.siteName,
      canonicalUrl: "https://craftusername.com",
      mainTitle: "CraftUsername | Check Username Availability",
      mainDescription: defaultConfig.global.description,
      platformTitleTemplate: "{Platform} Username Checker | CraftUsername",
      platformDescriptionTemplate: "Check if your desired username is available on {Platform}.",
    };

    siteConfig = await prisma.siteConfig.create({
      data: {
        id: "global",
        content: JSON.stringify(defaultContent),
        seo: JSON.stringify(defaultSeo),
      },
    });
  }

  return {
    content: JSON.parse(siteConfig.content),
    seo: JSON.parse(siteConfig.seo),
  };
}

export async function GET() {
  try {
    const config = await getOrCreateConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error("Failed to get config:", error);
    return NextResponse.json({ error: "Failed to get config" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    // Validate input briefly
    if (!data.content && !data.seo) {
      return NextResponse.json({ error: "No config data provided" }, { status: 400 });
    }

    // Ensure it exists first
    await getOrCreateConfig();

    const updateData: any = {};
    if (data.content) updateData.content = JSON.stringify(data.content);
    if (data.seo) updateData.seo = JSON.stringify(data.seo);

    const updated = await prisma.siteConfig.update({
      where: { id: "global" },
      data: updateData,
    });

    return NextResponse.json({
      content: JSON.parse(updated.content),
      seo: JSON.parse(updated.seo),
    });
  } catch (error) {
    console.error("Failed to update config:", error);
    return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
  }
}
