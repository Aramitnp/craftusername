import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const blogPosts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true, tags: true }
    });
    return NextResponse.json(blogPosts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const cleanedSlug = (data.slug || "").trim().toLowerCase();

    const blogPost = await prisma.blogPost.create({
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
        tags: data.tagIds?.length > 0 ? { connect: data.tagIds.map((id: string) => ({ id })) } : undefined,
        author: data.author || null,
        content: data.content || null,
        status: data.status || "DRAFT",
        robots: data.robots || "index, follow",
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });
    return NextResponse.json(blogPost, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}
