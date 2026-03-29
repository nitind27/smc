import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const complaints = await prisma.complaint.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: {
        createdAt: true,
        status: true,
        category: true,
      },
    });

    const byMonth: Record<string, { submitted: number; resolved: number }> = {};
    complaints.forEach((c) => {
      const key = c.createdAt.toISOString().slice(0, 7);
      if (!byMonth[key]) byMonth[key] = { submitted: 0, resolved: 0 };
      byMonth[key].submitted += 1;
      if (c.status === "resolved") byMonth[key].resolved += 1;
    });

    const byCategory: Record<string, number> = {};
    complaints.forEach((c) => {
      byCategory[c.category] = (byCategory[c.category] ?? 0) + 1;
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([ym, v]) => ({
        month: monthNames[parseInt(ym.slice(5), 10) - 1] ?? ym,
        ...v,
      }));

    const categoryData = Object.entries(byCategory).map(([name, count]) => ({
      name,
      count,
    }));

    return NextResponse.json({ monthlyData, categoryData });
  } catch (e) {
    console.error("Analytics complaints GET", e);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
