import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      include: {
        head: { select: { id: true, name: true, email: true } },
        _count: { select: { users: true, complaints: true, projects: true } },
      },
    });

    return NextResponse.json(
      departments.map((d) => ({
        id: d.id,
        name: d.name,
        headId: d.headId,
        headName: d.head?.name ?? null,
        headEmail: d.head?.email ?? null,
        staffCount: d._count.users,
        complaintCount: d._count.complaints,
        projectCount: d._count.projects,
        createdAt: d.createdAt.toISOString(),
      }))
    );
  } catch (e) {
    console.error("Departments GET", e);
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return NextResponse.json({ error: "Department name is required" }, { status: 400 });

    const existing = await prisma.department.findFirst({ where: { name: { equals: name } } });
    if (existing) return NextResponse.json({ error: "Department with this name already exists" }, { status: 409 });

    const dept = await prisma.department.create({
      data: { name },
      include: { head: { select: { name: true } }, _count: { select: { users: true, complaints: true, projects: true } } },
    });

    await prisma.auditLog.create({
      data: { action: "DEPARTMENT_CREATED", entityType: "department", entityId: dept.id, metadata: { name } },
    }).catch(() => {});

    return NextResponse.json({
      id: dept.id, name: dept.name, headId: dept.headId,
      headName: dept.head?.name ?? null, staffCount: dept._count.users,
      complaintCount: dept._count.complaints, projectCount: dept._count.projects,
      createdAt: dept.createdAt.toISOString(),
    }, { status: 201 });
  } catch (e) {
    console.error("Departments POST", e);
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
  }
}
