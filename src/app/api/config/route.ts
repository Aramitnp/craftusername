import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { config as defaultConfig } from "@/config/content";
import sanitizeHtml from "sanitize-html";
import { getSiteConfig } from "@/lib/config";

async function getOrCreateConfig() {
  const config = await getSiteConfig();
  // Ensure it actually exists in DB
  let siteConfig = await prisma.siteConfig.findUnique({
    where: { id: "global" },
  });
  if (!siteConfig) {
    siteConfig = await prisma.siteConfig.create({
      data: {
        id: "global",
        content: JSON.stringify(config.content),
        seo: JSON.stringify(config.seo),
      },
    });
  }
  return config;
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
    if (data.content) {
      if (data.content.supportedPlatformsDesc) {
        data.content.supportedPlatformsDesc = sanitizeHtml(data.content.supportedPlatformsDesc, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'br']),
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            'a': ['href', 'name', 'target', 'rel']
          }
        });
      }
      updateData.content = JSON.stringify(data.content);
    }
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
