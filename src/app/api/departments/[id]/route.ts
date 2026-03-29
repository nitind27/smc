import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { name, headId } = body;

    const data: Record<string, unknown> = {};
    if (typeof name === "string" && name.trim()) data.name = name.trim();
    if (headId !== undefined) data.headId = headId || null;

    const dept = await prisma.department.update({
      where: { id: params.id },
      data,
      include: { head: { select: { name: true } }, _count: { select: { users: true, complaints: true, projects: true } } },
    });

    await prisma.auditLog.create({
      data: { action: "DEPARTMENT_UPDATED", entityType: "department", entityId: dept.id, metadata: body },
    }).catch(() => {});

    return NextResponse.json({
      id: dept.id, name: dept.name, headId: dept.headId,
      headName: dept.head?.name ?? null, staffCount: dept._count.users,
    });
  } catch (e) {
    console.error("Department PATCH", e);
    return NextResponse.json({ error: "Failed to update department" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dept = await prisma.department.findUnique({
      where: { id: params.id },
      include: { _count: { select: { users: true } } },
    });
    if (!dept) return NextResponse.json({ error: "Department not found" }, { status: 404 });
    if (dept._count.users > 0) return NextResponse.json({ error: `Cannot delete: ${dept._count.users} staff members are assigned to this department` }, { status: 409 });

    await prisma.department.delete({ where: { id: params.id } });
    await prisma.auditLog.create({
      data: { action: "DEPARTMENT_DELETED", entityType: "department", entityId: params.id, metadata: { name: dept.name } },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Department DELETE", e);
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 });
  }
}
