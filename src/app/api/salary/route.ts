import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/salary?workerId=xxx  (omit workerId to get all)
export async function GET(request: NextRequest) {
  try {
    const workerId = request.nextUrl.searchParams.get("workerId");

    const records = await prisma.workerSalary.findMany({
      where: workerId ? { workerId } : {},
      orderBy: [{ month: "desc" }, { createdAt: "desc" }],
      include: {
        worker: { select: { id: true, name: true, role: true, departmentId: true } },
      },
    });

    return NextResponse.json(
      records.map((r) => ({
        id: r.id,
        workerId: r.workerId,
        workerName: r.worker.name,
        workerRole: r.worker.role,
        amount: Number(r.amount),
        month: r.month,
        note: r.note,
        paidAt: r.paidAt.toISOString(),
        createdAt: r.createdAt.toISOString(),
      }))
    );
  } catch (e) {
    console.error("Salary GET", e);
    return NextResponse.json({ error: "Failed to fetch salaries" }, { status: 500 });
  }
}

// POST /api/salary
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const workerId = typeof body.workerId === "string" ? body.workerId.trim() : "";
    const amount = parseFloat(body.amount);
    const month = typeof body.month === "string" ? body.month.trim() : "";
    const note = typeof body.note === "string" ? body.note.trim() || null : null;

    if (!workerId) return NextResponse.json({ error: "Worker is required" }, { status: 400 });
    if (!month || !/^\d{4}-\d{2}$/.test(month))
      return NextResponse.json({ error: "Month must be in YYYY-MM format" }, { status: 400 });
    if (!Number.isFinite(amount) || amount <= 0)
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });

    const worker = await prisma.user.findUnique({ where: { id: workerId } });
    if (!worker) return NextResponse.json({ error: "Worker not found" }, { status: 404 });

    const record = await prisma.workerSalary.create({
      data: { workerId, amount, month, note },
      include: { worker: { select: { name: true, role: true } } },
    });

    return NextResponse.json(
      {
        id: record.id,
        workerId: record.workerId,
        workerName: record.worker.name,
        workerRole: record.worker.role,
        amount: Number(record.amount),
        month: record.month,
        note: record.note,
        paidAt: record.paidAt.toISOString(),
        createdAt: record.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Salary POST", e);
    return NextResponse.json({ error: "Failed to add salary" }, { status: 500 });
  }
}
