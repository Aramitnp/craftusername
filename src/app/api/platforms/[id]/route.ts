import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const platform = await prisma.platform.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        logo: data.logo,
        profileUrlPattern: data.profileUrlPattern,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        checkMethod: data.checkMethod,
      },
    });
    return NextResponse.json(platform);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update platform" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.platform.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete platform" }, { status: 500 });
  }
}
