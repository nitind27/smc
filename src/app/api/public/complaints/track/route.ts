import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json(
        { error: "Complaint ID is required" },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.findFirst({
      where: { id },
      select: {
        id: true,
        title: true,
        status: true,
        category: true,
        location: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found. Check the ID and try again." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: complaint.id,
      title: complaint.title,
      status: complaint.status,
      category: complaint.category,
      location: complaint.location ?? undefined,
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
    });
  } catch (e) {
    console.error("Public track GET", e);
    return NextResponse.json(
      { error: "Failed to fetch complaint" },
      { status: 500 }
    );
  }
}
