import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { status } = body;

    const meeting = await prisma.meeting.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({ id: meeting.id, status: meeting.status });
  } catch (e) {
    console.error("Meeting PATCH", e);
    return NextResponse.json({ error: "Failed to update meeting" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.meeting.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Meeting DELETE", e);
    return NextResponse.json({ error: "Failed to delete meeting" }, { status: 500 });
  }
}
