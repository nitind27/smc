import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const departmentId = searchParams.get("departmentId");

    const bills = await prisma.bill.findMany({
      where: {
        ...(status && status !== "all" ? { status } : {}),
        ...(departmentId ? { departmentId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        submitter: { select: { name: true } },
        approver: { select: { name: true } },
        department: { select: { name: true } },
      },
    });

    const data = bills.map((b) => ({
      id: b.id,
      title: b.title,
      amount: Number(b.amount),
      status: b.status,
      submittedBy: b.submittedBy,
      submitterName: b.submitter.name,
      approvedBy: b.approvedBy,
      approverName: b.approver?.name,
      departmentId: b.departmentId,
      departmentName: b.department?.name,
      description: b.description,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    }));

    return NextResponse.json(data);
  } catch (e) {
    console.error("Bills GET", e);
    return NextResponse.json(
      { error: "Failed to fetch bills" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, amount, submittedBy, departmentId, description } = body;

    const submitterId =
      typeof submittedBy === "string" && submittedBy.trim() ? submittedBy.trim() : null;
    if (!submitterId) {
      return NextResponse.json(
        { error: "Submitter is required. Please ensure you are signed in." },
        { status: 400 }
      );
    }

    let submitterIdToUse = submitterId;
    const submitterExists = await prisma.user.findUnique({
      where: { id: submitterId },
    });
    if (!submitterExists) {
      const fallbackUser = await prisma.user.findFirst({
        where: { role: { in: ["admin", "department_head", "staff"] } },
        orderBy: { createdAt: "asc" },
      });
      if (fallbackUser) {
        submitterIdToUse = fallbackUser.id;
      } else {
        return NextResponse.json(
          { error: "No valid submitter found. Add at least one staff user in Staff management." },
          { status: 400 }
        );
      }
    }

    const deptId =
      typeof departmentId === "string" && departmentId.trim() && departmentId !== "__none__"
        ? departmentId.trim()
        : null;

    if (deptId) {
      const deptExists = await prisma.department.findUnique({
        where: { id: deptId },
      });
      if (!deptExists) {
        return NextResponse.json(
          { error: "Selected department was not found." },
          { status: 400 }
        );
      }
    }

    const amountNum = Number(amount);
    const safeAmount = Number.isFinite(amountNum) && amountNum >= 0 ? amountNum : 0;

    const bill = await prisma.bill.create({
      data: {
        title: title && String(title).trim() ? String(title).trim() : "Untitled",
        amount: safeAmount,
        submittedBy: submitterIdToUse,
        departmentId: deptId,
        description: description && String(description).trim() ? String(description).trim() : null,
      },
    });

    return NextResponse.json({
      id: bill.id,
      title: bill.title,
      amount: Number(bill.amount),
      status: bill.status,
      submittedBy: bill.submittedBy,
      departmentId: bill.departmentId,
      createdAt: bill.createdAt.toISOString(),
    });
  } catch (e) {
    console.error("Bills POST", e);
    const message =
      e && typeof e === "object" && "message" in e ? String((e as { message: unknown }).message) : "";
    let errorMessage = "Failed to create bill.";
    if (message) {
      if (message.includes("Foreign key") || message.includes("foreign key"))
        errorMessage = "Invalid submitter or department. Add staff and departments first.";
      else if (message.includes("Unique constraint") || message.includes("unique"))
        errorMessage = "A bill with this data already exists.";
      else
        errorMessage = message.length > 120 ? message.slice(0, 120) + "…" : message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
