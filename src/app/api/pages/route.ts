import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(pages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const cleanedSlug = (data.slug || "").trim().toLowerCase();

    const page = await prisma.page.create({
      data: {
        title: data.title,
        slug: cleanedSlug,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        openGraphTitle: data.openGraphTitle || null,
        openGraphDesc: data.openGraphDesc || null,
        openGraphImage: data.openGraphImage || null,
        featuredImage: data.featuredImage || null,
        featuredImageAlt: data.featuredImageAlt || null,
        content: data.content || null,
        status: data.status || "DRAFT",
        robots: data.robots || "index, follow",
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });
    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
