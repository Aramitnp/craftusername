import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const category = await prisma.blogCategory.findUnique({
      where: { id },
    });
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(category);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // Check for slug change to create redirect
    const existing = await prisma.blogCategory.findUnique({ where: { id } });
    if (existing && existing.slug !== data.slug && existing.status === "ACTIVE") {
      await prisma.redirect.create({
        data: {
          source: `/category/${existing.slug}`,
          destination: `/category/${data.slug}`,
          permanent: true,
        }
      });
    }

    const category = await prisma.blogCategory.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        featuredImage: data.featuredImage,
        featuredImageAlt: data.featuredImageAlt,
        status: data.status,
        robots: data.robots,
      },
    });
    return NextResponse.json(category);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const fallbackCategoryId = url.searchParams.get("fallbackCategoryId");

    if (fallbackCategoryId) {
      // Move posts to fallback category before deleting
      await prisma.blogPost.updateMany({
        where: { categoryId: id },
        data: { categoryId: fallbackCategoryId }
      });
    } // If no fallback, Prisma onDelete: SetNull handles it.

    await prisma.blogCategory.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
