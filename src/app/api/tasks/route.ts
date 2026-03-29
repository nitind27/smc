import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const assigneeId = searchParams.get("assigneeId");

    const tasks = await prisma.task.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(assigneeId ? { assigneeId } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      include: {
        assignee: { select: { name: true } },
        project: { select: { name: true } },
      },
    });

    const data = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      assigneeId: t.assigneeId,
      assigneeName: t.assignee?.name,
      dueDate: t.dueDate?.toISOString().slice(0, 10),
      projectId: t.projectId,
      projectName: t.project?.name,
      sortOrder: t.sortOrder,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    return NextResponse.json(data);
  } catch (e) {
    console.error("Tasks GET", e);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const task = await prisma.task.create({
      data: {
        title,
        description: typeof body.description === "string" ? body.description.trim() || null : null,
        status: ["todo", "in_progress", "review", "done"].includes(body.status) ? body.status : "todo",
        priority: ["low", "medium", "high"].includes(body.priority) ? body.priority : "medium",
        assigneeId: typeof body.assigneeId === "string" && body.assigneeId.trim() ? body.assigneeId.trim() : null,
        projectId: typeof body.projectId === "string" && body.projectId.trim() ? body.projectId.trim() : null,
        dueDate: typeof body.dueDate === "string" && body.dueDate ? new Date(body.dueDate) : null,
      },
      include: { assignee: { select: { name: true } }, project: { select: { name: true } } },
    });

    return NextResponse.json({
      id: task.id, title: task.title, description: task.description,
      status: task.status, priority: task.priority,
      assigneeId: task.assigneeId, assigneeName: task.assignee?.name,
      projectId: task.projectId, projectName: task.project?.name,
      dueDate: task.dueDate?.toISOString().slice(0, 10),
      createdAt: task.createdAt.toISOString(),
    }, { status: 201 });
  } catch (e) {
    console.error("Tasks POST", e);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;
    if (!id) {
      return NextResponse.json(
        { error: "Task id required" },
        { status: 400 }
      );
    }

    const task = await prisma.task.update({
      where: { id },
      data: { ...(status && { status }) },
    });

    return NextResponse.json({
      id: task.id,
      status: task.status,
      updatedAt: task.updatedAt.toISOString(),
    });
  } catch (e) {
    console.error("Tasks PATCH", e);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
