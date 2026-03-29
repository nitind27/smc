import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    const data: {
      imageUrl?: string;
      title?: string | null;
      subtitle?: string | null;
      linkUrl?: string | null;
      order?: number;
      active?: boolean;
    } = {};

    if (typeof body.imageUrl === "string" && body.imageUrl.trim()) data.imageUrl = body.imageUrl.trim();
    if (typeof body.title === "string") data.title = body.title.trim() || null;
    if (typeof body.subtitle === "string") data.subtitle = body.subtitle.trim() || null;
    if (typeof body.linkUrl === "string") data.linkUrl = body.linkUrl.trim() || null;
    if (Number.isFinite(Number(body.order))) data.order = Number(body.order);
    if (typeof body.active === "boolean") data.active = body.active;

    const slide = await prisma.heroSlide.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      id: slide.id,
      imageUrl: slide.imageUrl,
      title: slide.title,
      subtitle: slide.subtitle,
      linkUrl: slide.linkUrl,
      order: slide.order,
      active: slide.active,
      createdAt: slide.createdAt.toISOString(),
      updatedAt: slide.updatedAt.toISOString(),
    });
  } catch (e) {
    console.error("HeroSlides PATCH", e);
    return NextResponse.json(
      { error: "Failed to update slide" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await prisma.heroSlide.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("HeroSlides DELETE", e);
    return NextResponse.json(
      { error: "Failed to delete slide" },
      { status: 500 }
    );
  }
}

