import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const meetings = await prisma.meeting.findMany({
      orderBy: [{ meetingDate: "desc" }, { meetingTime: "desc" }],
      include: {
        department: { select: { name: true } },
      },
    });

    const data = meetings.map((m) => ({
      id: m.id,
      title: m.title,
      agenda: m.agenda,
      meetingDate: m.meetingDate.toISOString().slice(0, 10),
      meetingTime: m.meetingTime.toString().slice(0, 5),
      status: m.status,
      departmentName: m.department?.name ?? null,
    }));

    return NextResponse.json(data);
  } catch (e) {
    console.error("Public meetings GET", e);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}
