import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [
      totalComplaints,
      resolvedCount,
      pendingCount,
      inProgressCount,
      activeProjects,
      totalMeetings,
      completedMeetings,
    ] = await Promise.all([
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: "resolved" } }),
      prisma.complaint.count({ where: { status: { in: ["submitted", "assigned"] } } }),
      prisma.complaint.count({ where: { status: "in_progress" } }),
      prisma.project.count({ where: { status: "active" } }),
      prisma.meeting.count(),
      prisma.meeting.count({ where: { status: "completed" } }),
    ]);

    const resolutionRate =
      totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0;
    const transparencyScore = totalMeetings > 0
      ? Math.round((completedMeetings / totalMeetings) * 100)
      : 100;

    return NextResponse.json({
      totalComplaints,
      completedWorks: resolvedCount,
      pendingIssues: pendingCount + inProgressCount,
      resolutionRate,
      transparencyScore,
      totalMeetings,
      completedMeetings,
      activeProjects,
    });
  } catch (e) {
    console.error("Public stats GET", e);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
