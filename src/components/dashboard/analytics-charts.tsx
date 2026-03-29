"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useFetch } from "@/hooks/use-fetch";
import { Loader2 } from "lucide-react";

const fallbackData = [
  { month: "Jan", submitted: 0, resolved: 0 },
  { month: "Feb", submitted: 0, resolved: 0 },
  { month: "Mar", submitted: 0, resolved: 0 },
];

export function AnalyticsCharts() {
  const { data, isLoading } = useFetch<{ monthlyData: Array<{ month: string; submitted: number; resolved: number }> }>(
    "/api/analytics/complaints"
  );

  const chartData = (data?.monthlyData?.length ? data.monthlyData : fallbackData) as Array<{
    month: string;
    submitted: number;
    resolved: number;
  }>;

  if (isLoading) {
    return (
      <div className="h-[280px] w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: "var(--radius)",
              border: "1px solid hsl(var(--border))",
            }}
          />
          <Line
            type="monotone"
            dataKey="submitted"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="Submitted"
          />
          <Line
            type="monotone"
            dataKey="resolved"
            stroke="hsl(var(--success))"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="Resolved"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
