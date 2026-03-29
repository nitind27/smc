import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const discussions = await prisma.discussion.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        meeting: { select: { id: true, title: true } },
        _count: { select: { posts: true } },
      },
    });

    const data = discussions.map((d) => ({
      id: d.id,
      meetingId: d.meetingId,
      meetingTitle: d.meeting.title,
      topic: d.topic,
      status: d.status,
      postCount: d._count.posts,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));

    return NextResponse.json(data);
  } catch (e) {
    console.error("Discussions GET", e);
    return NextResponse.json(
      { error: "Failed to fetch discussions" },
      { status: 500 }
    );
  }
}
