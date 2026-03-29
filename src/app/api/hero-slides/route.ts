import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    const slides = await prisma.heroSlide.findMany({
      where: all ? {} : { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    const data = slides.map((s) => ({
      id: s.id,
      imageUrl: s.imageUrl,
      title: s.title,
      subtitle: s.subtitle,
      linkUrl: s.linkUrl,
      order: s.order,
      active: s.active,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));

    return NextResponse.json(data);
  } catch (e) {
    console.error("HeroSlides GET", e);
    return NextResponse.json(
      { error: "Failed to fetch slides" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
    const title = typeof body.title === "string" ? body.title.trim() : null;
    const subtitle = typeof body.subtitle === "string" ? body.subtitle.trim() : null;
    const linkUrl = typeof body.linkUrl === "string" ? body.linkUrl.trim() : null;
    const order = Number.isFinite(Number(body.order)) ? Number(body.order) : 0;
    const active = typeof body.active === "boolean" ? body.active : true;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    const slide = await prisma.heroSlide.create({
      data: {
        imageUrl,
        title: title && title.length > 0 ? title : null,
        subtitle: subtitle && subtitle.length > 0 ? subtitle : null,
        linkUrl: linkUrl && linkUrl.length > 0 ? linkUrl : null,
        order,
        active,
      },
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
    console.error("HeroSlides POST", e);
    return NextResponse.json(
      { error: "Failed to create slide" },
      { status: 500 }
    );
  }
}

