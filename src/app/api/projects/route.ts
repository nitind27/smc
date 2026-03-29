import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        department: { select: { name: true } },
        _count: { select: { tasks: true } },
      },
    });

    const data = projects.map((p) => ({
      id: p.id,
      name: p.name,
      departmentId: p.departmentId,
      departmentName: p.department?.name,
      status: p.status,
      progress: p.progress,
      taskCount: p._count.tasks,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return NextResponse.json(data);
  } catch (e) {
    console.error("Projects GET", e);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const departmentId = typeof body.departmentId === "string" && body.departmentId.trim() ? body.departmentId.trim() : null;
    const status = ["active", "completed", "on_hold"].includes(body.status) ? body.status : "active";
    const progress = Number.isFinite(Number(body.progress)) ? Math.min(100, Math.max(0, Number(body.progress))) : 0;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const project = await prisma.project.create({
      data: { name, departmentId, status, progress },
      include: { department: { select: { name: true } }, _count: { select: { tasks: true } } },
    });

    return NextResponse.json({
      id: project.id,
      name: project.name,
      departmentId: project.departmentId,
      departmentName: project.department?.name,
      status: project.status,
      progress: project.progress,
      taskCount: project._count.tasks,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    }, { status: 201 });
  } catch (e) {
    console.error("Projects POST", e);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
