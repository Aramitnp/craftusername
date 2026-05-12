import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const tags = await prisma.blogTag.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });
    return NextResponse.json(tags);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const tag = await prisma.blogTag.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        featuredImage: data.featuredImage,
        featuredImageAlt: data.featuredImageAlt,
        status: data.status || "ACTIVE",
        robots: data.robots || "noindex, follow",
      },
    });
    return NextResponse.json(tag);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create tag" }, { status: 500 });
  }
}
