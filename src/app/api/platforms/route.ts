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
    const platform = await prisma.platform.create({
      data: {
        name: data.name,
        slug: data.slug,
        logo: data.logo,
        profileUrlPattern: data.profileUrlPattern,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
        checkMethod: data.checkMethod ?? "GET",
      },
    });
    return NextResponse.json(platform, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create platform" }, { status: 500 });
  }
}
