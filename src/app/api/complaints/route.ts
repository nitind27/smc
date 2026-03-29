import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const departmentId = searchParams.get("departmentId");

    const complaints = await prisma.complaint.findMany({
      where: {
        ...(status && status !== "all" ? { status } : {}),
        ...(departmentId ? { departmentId } : {}),
        ...(searchParams.get("assignedTo") ? { assignedTo: searchParams.get("assignedTo")! } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        department: { select: { name: true } },
        assignee: { select: { name: true, email: true } },
      },
    });

    const data = complaints.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      status: c.status,
      priority: c.priority,
      submittedBy: c.submittedBy,
      assignedTo: c.assignedTo,
      assigneeName: c.assignee?.name,
      departmentId: c.departmentId,
      departmentName: c.department?.name,
      location: c.location,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json(data);
  } catch (e) {
    console.error("Complaints GET", e);
    return NextResponse.json(
      { error: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, priority, submittedBy, location, departmentId, attachmentUrls } = body;

    // Generate unique 10-char complaint ID (same format as public complaints)
    const generateId = () => {
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let id = "";
      for (let i = 0; i < 5; i++) id += letters[Math.floor(Math.random() * 26)];
      for (let i = 0; i < 5; i++) id += Math.floor(Math.random() * 10);
      return id;
    };
    let customId = generateId();
    while (await prisma.complaint.findUnique({ where: { id: customId }, select: { id: true } })) {
      customId = generateId();
    }

    const complaint = await prisma.complaint.create({
      data: {
        id: customId,
        title: title ?? "Untitled",
        description: description ?? "",
        category: category ?? "Other",
        priority: priority ?? "medium",
        submittedBy: submittedBy ?? "anonymous",
        location: location ?? undefined,
        departmentId: departmentId && departmentId !== "auto" ? departmentId : undefined,
        ...(attachmentUrls?.length ? {
          attachments: {
            create: (attachmentUrls as string[]).map((url: string) => ({
              fileUrl: url,
              fileName: url.split("/").pop() ?? "attachment",
            })),
          },
        } : {}),
      },
    });

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: "COMPLAINT_CREATED",
          entityType: "complaint",
          entityId: complaint.id,
          metadata: { category, priority, submittedBy },
        },
      });
    } catch { /* non-critical */ }

    return NextResponse.json({
      id: complaint.id,
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      status: complaint.status,
      priority: complaint.priority,
      submittedBy: complaint.submittedBy,
      departmentId: complaint.departmentId,
      location: complaint.location,
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
    });
  } catch (e) {
    console.error("Complaints POST", e);
    return NextResponse.json(
      { error: "Failed to create complaint" },
      { status: 500 }
    );
  }
}
