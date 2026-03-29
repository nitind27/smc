import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const all = searchParams.get("all") === "true";
    const limit = parseInt(searchParams.get("limit") ?? "50");

    if (!userId && !all) {
      return NextResponse.json({ error: "userId or all=true required" }, { status: 400 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        ...(all ? {} : { userId: userId! }),
        ...(unreadOnly ? { readAt: null } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
      include: { user: { select: { name: true, role: true } } },
    });

    const data = notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      title: n.title,
      body: n.body,
      type: n.type,
      readAt: n.readAt?.toISOString() ?? null,
      entityType: n.entityType,
      entityId: n.entityId,
      createdAt: n.createdAt.toISOString(),
      userName: n.user?.name ?? null,
      userRole: n.user?.role ?? null,
    }));

    return NextResponse.json(data);
  } catch (e) {
    console.error("Notifications GET", e);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, userId, markAll } = body;

    if (markAll && userId) {
      await prisma.notification.updateMany({
        where: { userId, readAt: null },
        data: { readAt: new Date() },
      });
      return NextResponse.json({ success: true, updated: "all" });
    }

    if (Array.isArray(ids) && ids.length > 0) {
      await prisma.notification.updateMany({
        where: { id: { in: ids } },
        data: { readAt: new Date() },
      });
      return NextResponse.json({ success: true, updated: ids.length });
    }

    return NextResponse.json({ error: "Provide ids or markAll+userId" }, { status: 400 });
  } catch (e) {
    console.error("Notifications PATCH", e);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}

// Create notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, body: bodyText, type, entityType, entityId } = body;

    if (!userId || !title) {
      return NextResponse.json({ error: "userId and title required" }, { status: 400 });
    }

    const notif = await prisma.notification.create({
      data: {
        userId,
        title,
        body: bodyText ?? null,
        type: type ?? "info",
        entityType: entityType ?? null,
        entityId: entityId ?? null,
      },
    });

    return NextResponse.json({ id: notif.id, createdAt: notif.createdAt.toISOString() });
  } catch (e) {
    console.error("Notifications POST", e);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}
