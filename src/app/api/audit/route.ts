import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q          = searchParams.get("q") ?? "";
    const entityType = searchParams.get("entityType") ?? "";
    const action     = searchParams.get("action") ?? "";
    const userId     = searchParams.get("userId") ?? "";
    const dateFrom   = searchParams.get("dateFrom") ?? "";
    const dateTo     = searchParams.get("dateTo") ?? "";
    const page       = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit      = Math.min(Number(searchParams.get("limit")) || 25, 100);
    const skip       = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (q) {
      where.OR = [
        { action: { contains: q } },
        { userEmail: { contains: q } },
        { entityType: { contains: q } },
        { entityId: { contains: q } },
      ];
    }
    if (entityType) where.entityType = entityType;
    if (action)     where.action = { contains: action };
    if (userId)     where.userId = userId;
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo   ? { lte: new Date(dateTo + "T23:59:59Z") } : {}),
      };
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Summary counts for stats
    const [totalToday, totalWeek] = await Promise.all([
      prisma.auditLog.count({
        where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      }),
      prisma.auditLog.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
    ]);

    const data = logs.map((l) => ({
      id: l.id,
      action: l.action,
      userId: l.userId,
      userEmail: l.userEmail,
      entityType: l.entityType,
      entityId: l.entityId,
      metadata: l.metadata,
      createdAt: l.createdAt.toISOString(),
    }));

    return NextResponse.json({
      logs: data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats: { totalToday, totalWeek, totalAll: total },
    });
  } catch (e) {
    console.error("Audit GET", e);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}

// POST — create audit log entry from client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, userEmail, entityType, entityId, metadata } = body;

    if (!action?.trim()) {
      return NextResponse.json({ error: "action is required" }, { status: 400 });
    }

    const log = await prisma.auditLog.create({
      data: {
        action: String(action).trim(),
        userId:     userId     ? String(userId)     : null,
        userEmail:  userEmail  ? String(userEmail)  : null,
        entityType: entityType ? String(entityType) : null,
        entityId:   entityId   ? String(entityId)   : null,
        metadata:   metadata   ?? undefined,
      },
    });

    return NextResponse.json({ id: log.id, createdAt: log.createdAt.toISOString() }, { status: 201 });
  } catch (e) {
    console.error("Audit POST", e);
    return NextResponse.json({ error: "Failed to create audit log" }, { status: 500 });
  }
}
