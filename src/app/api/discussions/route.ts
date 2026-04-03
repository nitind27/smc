import { NextRequest, NextResponse } from "next/server";
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
    return NextResponse.json(discussions.map(d => ({
      id: d.id, meetingId: d.meetingId, meetingTitle: d.meeting.title,
      topic: d.topic, status: d.status, postCount: d._count.posts,
      createdAt: d.createdAt.toISOString(), updatedAt: d.updatedAt.toISOString(),
    })));
  } catch (e) {
    console.error("Discussions GET", e);
    return NextResponse.json({ error: "Failed to fetch discussions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { meetingId, topic } = body;
    if (!meetingId || !topic?.trim()) {
      return NextResponse.json({ error: "meetingId and topic are required" }, { status: 400 });
    }
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) return NextResponse.json({ error: "Meeting not found" }, { status: 404 });

    const discussion = await prisma.discussion.create({
      data: { meetingId, topic: topic.trim() },
      include: { meeting: { select: { title: true } }, _count: { select: { posts: true } } },
    });
    return NextResponse.json({
      id: discussion.id, meetingId: discussion.meetingId,
      meetingTitle: discussion.meeting.title, topic: discussion.topic,
      status: discussion.status, postCount: 0,
      createdAt: discussion.createdAt.toISOString(),
    }, { status: 201 });
  } catch (e) {
    console.error("Discussions POST", e);
    return NextResponse.json({ error: "Failed to create discussion" }, { status: 500 });
  }
}
