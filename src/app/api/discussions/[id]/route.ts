import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET posts for a discussion
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const posts = await prisma.discussionPost.findMany({
      where: { discussionId: params.id },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { name: true, role: true } } },
    });
    const discussion = await prisma.discussion.findUnique({
      where: { id: params.id },
      include: { meeting: { select: { title: true } } },
    });
    return NextResponse.json({
      discussion: discussion ? {
        id: discussion.id, topic: discussion.topic, status: discussion.status,
        meetingTitle: discussion.meeting.title,
      } : null,
      posts: posts.map(p => ({
        id: p.id, content: p.content, userId: p.userId,
        userName: p.user.name, userRole: p.user.role,
        createdAt: p.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST a new message to discussion
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { userId, content } = body;
    if (!userId || !content?.trim()) {
      return NextResponse.json({ error: "userId and content required" }, { status: 400 });
    }
    const post = await prisma.discussionPost.create({
      data: { discussionId: params.id, userId, content: content.trim() },
      include: { user: { select: { name: true, role: true } } },
    });
    // Update discussion updatedAt
    await prisma.discussion.update({ where: { id: params.id }, data: { updatedAt: new Date() } });
    return NextResponse.json({
      id: post.id, content: post.content, userId: post.userId,
      userName: post.user.name, userRole: post.user.role,
      createdAt: post.createdAt.toISOString(),
    }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to post message" }, { status: 500 });
  }
}
