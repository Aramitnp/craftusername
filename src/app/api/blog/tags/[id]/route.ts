import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tag = await prisma.blogTag.findUnique({
      where: { id },
    });
    if (!tag) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(tag);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch tag" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // Check for slug change to create redirect
    const existing = await prisma.blogTag.findUnique({ where: { id } });
    if (existing && existing.slug !== data.slug && existing.status === "ACTIVE") {
      await prisma.redirect.create({
        data: {
          source: `/tag/${existing.slug}`,
          destination: `/tag/${data.slug}`,
          permanent: true,
        }
      });
    }

    const tag = await prisma.blogTag.update({
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
    return NextResponse.json(tag);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update tag" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Deleting a tag naturally removes the many-to-many relationship with posts
    await prisma.blogTag.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 });
  }
}
