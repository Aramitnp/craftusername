import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });
    return NextResponse.json(categories);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const category = await prisma.blogCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        featuredImage: data.featuredImage,
        featuredImageAlt: data.featuredImageAlt,
        status: data.status || "ACTIVE",
        robots: data.robots || "index, follow",
      },
    });
    return NextResponse.json(category);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
