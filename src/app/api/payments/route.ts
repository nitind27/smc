import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        bill: {
          select: {
            id: true, title: true, amount: true,
            department: { select: { name: true } },
            submitter: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json(
      payments.map((p) => ({
        id: p.id,
        billId: p.billId,
        billTitle: p.bill.title,
        billAmount: Number(p.bill.amount),
        departmentName: p.bill.department?.name ?? null,
        submitterName: p.bill.submitter?.name ?? null,
        amount: Number(p.amount),
        status: p.status,
        reference: p.reference,
        createdAt: p.createdAt.toISOString(),
      }))
    );
  } catch (e) {
    console.error("Payments GET", e);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { billId, amount, reference } = body;

    if (!billId) return NextResponse.json({ error: "Bill ID is required" }, { status: 400 });

    const bill = await prisma.bill.findUnique({ where: { id: billId } });
    if (!bill) return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    if (bill.status !== "approved") return NextResponse.json({ error: "Only approved bills can be paid" }, { status: 400 });

    const payment = await prisma.payment.create({
      data: {
        billId,
        amount: Number(amount) || Number(bill.amount),
        status: "completed",
        reference: reference?.trim() || `PAY-${Date.now()}`,
      },
    });

    await prisma.auditLog.create({
      data: { action: "PAYMENT_CREATED", entityType: "payment", entityId: payment.id, metadata: { billId, amount } },
    }).catch(() => {});

    return NextResponse.json({ id: payment.id, status: payment.status, reference: payment.reference }, { status: 201 });
  } catch (e) {
    console.error("Payments POST", e);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
