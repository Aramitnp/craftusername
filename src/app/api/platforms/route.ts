import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("activeOnly") === "true";

  try {
    const platforms = await prisma.platform.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(platforms);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch platforms" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    let cleanedSlug = (data.slug || "").trim().toLowerCase();
    while (cleanedSlug.endsWith("-username-checker-username-checker")) {
      cleanedSlug = cleanedSlug.replace("-username-checker-username-checker", "-username-checker");
    }

    const platform = await prisma.platform.create({
      data: {
        name: data.name,
        slug: cleanedSlug,
        logo: data.logo,
        profileUrlPattern: data.profileUrlPattern,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
        checkMethod: data.checkMethod ?? "GET",
        seoTitleOverride: data.seoTitleOverride || null,
        seoDescOverride: data.seoDescOverride || null,
        contentTitle: data.contentTitle || null,
        contentBody: data.contentBody || null,
      },
    });
    return NextResponse.json(platform, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create platform" }, { status: 500 });
  }
}
