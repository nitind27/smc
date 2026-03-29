import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const meetings = await prisma.meeting.findMany({
      orderBy: { meetingDate: "desc" },
      include: {
        department: { select: { name: true } },
        complaint: { select: { id: true, title: true, status: true } },
        _count: { select: { participants: true } },
      },
    });

    const data = meetings.map((m) => ({
      id: m.id,
      title: m.title,
      agenda: m.agenda,
      date: m.meetingDate.toISOString().slice(0, 10),
      time: m.meetingTime.toISOString().slice(11, 16),
      status: m.status,
      departmentId: m.departmentId,
      departmentName: m.department?.name ?? null,
      complaintId: m.complaintId,
      complaintTitle: m.complaint?.title ?? null,
      complaintStatus: m.complaint?.status ?? null,
      participants: m._count.participants,
      createdAt: m.createdAt.toISOString(),
    }));

    return NextResponse.json(data);
  } catch (e) {
    console.error("Meetings GET", e);
    return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, agenda, meetingDate, meetingTime, departmentId, participantIds, complaintId } = body;

    if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (!meetingDate) return NextResponse.json({ error: "Date is required" }, { status: 400 });

    const timeStr = meetingTime || "09:00";
    const dateTimeStr = `1970-01-01T${timeStr}:00.000Z`;

    const meeting = await prisma.meeting.create({
      data: {
        title: title.trim(),
        agenda: agenda?.trim() || null,
        meetingDate: new Date(meetingDate),
        meetingTime: new Date(dateTimeStr),
        departmentId: departmentId || null,
        complaintId: complaintId || null,
        participants: participantIds?.length
          ? { create: participantIds.map((uid: string) => ({ userId: uid })) }
          : undefined,
      },
    });

    return NextResponse.json({ id: meeting.id, title: meeting.title });
  } catch (e) {
    console.error("Meetings POST", e);
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
  }
}
