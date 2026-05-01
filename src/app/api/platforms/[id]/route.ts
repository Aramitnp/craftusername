import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    let cleanedSlug = (data.slug || "").trim().toLowerCase();
    while (cleanedSlug.endsWith("-username-checker-username-checker")) {
      cleanedSlug = cleanedSlug.replace("-username-checker-username-checker", "-username-checker");
    }

    const platform = await prisma.platform.update({
      where: { id },
      data: {
        name: data.name,
        slug: cleanedSlug,
        logo: data.logo,
        profileUrlPattern: data.profileUrlPattern,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        checkMethod: data.checkMethod,
        seoTitleOverride: data.seoTitleOverride || null,
        seoDescOverride: data.seoDescOverride || null,
        contentTitle: data.contentTitle || null,
        contentBody: data.contentBody || null,
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
