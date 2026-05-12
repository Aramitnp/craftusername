import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blogPost = await prisma.blogPost.findUnique({
      where: { id },
      include: { category: true, tags: true }
    });
    
    if (!blogPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }
    
    return NextResponse.json(blogPost);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 });
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
    const existingPost = await prisma.blogPost.findUnique({ where: { id } });
    
    if (!existingPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    if (existingPost.status === "PUBLISHED" && existingPost.slug !== cleanedSlug) {
      // Slug changed after publish, create redirect
      await prisma.redirect.create({
        data: {
          source: `/blog/${existingPost.slug}`,
          destination: `/blog/${cleanedSlug}`,
        }
      });
    }

    const blogPost = await prisma.blogPost.update({
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
        categoryId: data.categoryId || null,
        tags: data.tagIds ? { set: data.tagIds.map((tid: string) => ({ id: tid })) } : { set: [] },
        author: data.author || null,
        content: data.content || null,
        status: data.status,
        robots: data.robots,
        publishedAt: (data.status === "PUBLISHED" && !existingPost.publishedAt) ? new Date() : existingPost.publishedAt,
      },
    });
    return NextResponse.json(blogPost);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.blogPost.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
