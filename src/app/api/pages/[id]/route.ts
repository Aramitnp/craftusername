import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const page = await prisma.page.findUnique({
      where: { id },
    });
    
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    
    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const cleanedSlug = (data.slug || "").trim().toLowerCase();

    // Check existing to see if slug changed
    const existingPage = await prisma.page.findUnique({ where: { id } });
    
    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    if (existingPage.status === "PUBLISHED" && existingPage.slug !== cleanedSlug) {
      // Slug changed after publish, create redirect
      await prisma.redirect.create({
        data: {
          source: `/${existingPage.slug}`,
          destination: `/${cleanedSlug}`,
        }
      });
    }

    const page = await prisma.page.update({
      where: { id },
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
        status: data.status,
        robots: data.robots,
        publishedAt: (data.status === "PUBLISHED" && !existingPage.publishedAt) ? new Date() : existingPage.publishedAt,
      },
    });
    return NextResponse.json(page);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.page.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }
}
