import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const approved = body.approved !== false;
    const approvedByRaw = typeof body.approvedBy === "string" ? body.approvedBy.trim() : null;

    const billExists = await prisma.bill.findUnique({ where: { id } });
    if (!billExists) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    let approvedBy: string | null = null;
    if (approvedByRaw) {
      const approverExists = await prisma.user.findUnique({
        where: { id: approvedByRaw },
      });
      if (approverExists) approvedBy = approvedByRaw;
    }

    const bill = await prisma.bill.update({
      where: { id },
      data: {
        status: approved ? "approved" : "rejected",
        approvedBy,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: approved ? `BILL_APPROVED` : `BILL_REJECTED`,
        userId: approvedBy,
        entityType: "bill",
        entityId: id,
        metadata: { billTitle: billExists.title, amount: Number(billExists.amount), approvedBy },
      },
    }).catch(() => {});

    return NextResponse.json({
      id: bill.id,
      status: bill.status,
      approvedBy: bill.approvedBy,
      updatedAt: bill.updatedAt.toISOString(),
    });
  } catch (e) {
    console.error("Bill approve POST", e);
    return NextResponse.json(
      { error: "Failed to update bill" },
      { status: 500 }
    );
  }
}
