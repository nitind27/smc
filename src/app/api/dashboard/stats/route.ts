import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") ?? "admin";
    const departmentId = searchParams.get("departmentId");
    const userId = searchParams.get("userId");

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (role === "department_head" && departmentId) {
      const [deptComplaints, teamMembers, pendingBills, upcomingMeetings, activeTasks, resolvedThisMonth] =
        await Promise.all([
          prisma.complaint.count({ where: { departmentId, status: { in: ["submitted", "assigned", "in_progress"] } } }),
          prisma.user.count({ where: { departmentId } }),
          prisma.bill.count({ where: { departmentId, status: "pending" } }),
          prisma.meeting.count({ where: { departmentId, status: "scheduled", meetingDate: { gte: now } } }),
          prisma.task.count({ where: { status: { in: ["todo", "in_progress"] } } }),
          prisma.complaint.count({ where: { departmentId, status: "resolved", updatedAt: { gte: startOfMonth } } }),
        ]);
      return NextResponse.json({ deptComplaints, teamMembers, pendingBills, upcomingMeetings, activeTasks, resolvedThisMonth });
    }

    if (role === "staff" && userId) {
      const [myTasks, assignedComplaints, todayMeetings, completedTasks] = await Promise.all([
        prisma.task.count({ where: { assigneeId: userId, status: { in: ["todo", "in_progress"] } } }),
        prisma.complaint.count({ where: { assignedTo: userId, status: { in: ["assigned", "in_progress"] } } }),
        prisma.meeting.count({
          where: {
            status: "scheduled",
            meetingDate: {
              gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
              lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
            },
            participants: { some: { userId } },
          },
        }),
        prisma.task.count({ where: { assigneeId: userId, status: "done" } }),
      ]);
      return NextResponse.json({ myTasks, assignedComplaints, todayMeetings, completedTasks });
    }

    if (role === "auditor") {
      const [auditLogs, billsReviewed, totalComplaints, resolvedComplaints] = await Promise.all([
        prisma.auditLog.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.bill.count({ where: { status: { in: ["approved", "rejected"] } } }),
        prisma.complaint.count(),
        prisma.complaint.count({ where: { status: "resolved" } }),
      ]);
      const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;
      return NextResponse.json({ auditLogs, billsReviewed, totalComplaints, resolvedComplaints, resolutionRate });
    }

    if (role === "public" && userId) {
      const [myComplaints, resolvedComplaints, pendingComplaints] = await Promise.all([
        prisma.complaint.count({ where: { submittedBy: userId } }),
        prisma.complaint.count({ where: { submittedBy: userId, status: "resolved" } }),
        prisma.complaint.count({ where: { submittedBy: userId, status: { in: ["submitted", "assigned", "in_progress"] } } }),
      ]);
      return NextResponse.json({ myComplaints, resolvedComplaints, pendingComplaints });
    }

    // Admin stats (default)
    const [openComplaints, activeProjects, pendingBills, resolvedCount, totalComplaints, totalStaff, totalDepartments, scheduledMeetings] =
      await Promise.all([
        prisma.complaint.count({ where: { status: { in: ["submitted", "assigned", "in_progress"] } } }),
        prisma.project.count({ where: { status: "active" } }),
        prisma.bill.count({ where: { status: "pending" } }),
        prisma.complaint.count({ where: { status: "resolved" } }),
        prisma.complaint.count(),
        prisma.user.count({ where: { role: { not: "public" } } }),
        prisma.department.count(),
        prisma.meeting.count({ where: { status: "scheduled" } }),
      ]);

    const resolutionRate = totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0;

    return NextResponse.json({
      openComplaints, activeProjects, pendingBills, resolutionRate,
      totalComplaints, resolvedCount, totalStaff, totalDepartments, scheduledMeetings,
    });
  } catch (e) {
    console.error("Dashboard stats GET", e);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
