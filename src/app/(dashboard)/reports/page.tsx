"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3, Download, Loader2, TrendingUp, CheckCircle2,
  AlertCircle, Clock, Building2, FileText, Users,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { useFetch } from "@/hooks/use-fetch";
import { motion } from "framer-motion";
import { useMemo } from "react";

const CHART_COLORS = ["hsl(var(--primary))", "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

export default function ReportsPage() {
  const { data, isLoading, error } = useFetch<{
    monthlyData: Array<{ month: string; submitted: number; resolved: number }>;
    categoryData: Array<{ name: string; count: number }>;
  }>("/api/analytics/complaints");

  const { data: stats } = useFetch<{
    openComplaints: number; activeProjects: number; pendingBills: number;
    resolutionRate: number; totalComplaints: number; resolvedCount: number;
    totalStaff: number; totalDepartments: number;
  }>("/api/dashboard/stats");

  const { data: billsData } = useFetch<Array<{ id: string; amount: number; status: string; createdAt: string }>>("/api/bills");
  const { data: departmentsData } = useFetch<Array<{ id: string; name: string }>>("/api/departments");

  const monthlyData = data?.monthlyData ?? [];
  const categoryData = (data?.categoryData ?? []).map((c, i) => ({
    ...c,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const billStats = useMemo(() => {
    const bills = billsData ?? [];
    const approved = bills.filter(b => b.status === "approved").length;
    const pending = bills.filter(b => b.status === "pending").length;
    const rejected = bills.filter(b => b.status === "rejected").length;
    const totalAmount = bills.reduce((sum, b) => sum + Number(b.amount), 0);
    return { approved, pending, rejected, totalAmount };
  }, [billsData]);

  const summaryCards = [
    { label: "Total Complaints", value: stats?.totalComplaints ?? 0, icon: AlertCircle, color: "from-blue-500 to-cyan-600", bg: "bg-blue-500/10" },
    { label: "Resolved", value: stats?.resolvedCount ?? 0, icon: CheckCircle2, color: "from-emerald-500 to-green-600", bg: "bg-emerald-500/10" },
    { label: "Resolution Rate", value: `${stats?.resolutionRate ?? 0}%`, icon: TrendingUp, color: "from-violet-500 to-purple-600", bg: "bg-violet-500/10" },
    { label: "Active Projects", value: stats?.activeProjects ?? 0, icon: Building2, color: "from-amber-500 to-orange-600", bg: "bg-amber-500/10" },
    { label: "Total Staff", value: stats?.totalStaff ?? 0, icon: Users, color: "from-rose-500 to-pink-600", bg: "bg-rose-500/10" },
    { label: "Departments", value: stats?.totalDepartments ?? 0, icon: Building2, color: "from-indigo-500 to-blue-600", bg: "bg-indigo-500/10" },
  ];

  const billChartData = [
    { name: "Approved", value: billStats.approved, color: "#10b981" },
    { name: "Pending", value: billStats.pending, color: "#f59e0b" },
    { name: "Rejected", value: billStats.rejected, color: "#ef4444" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  Reports & Analytics
                </h1>
                <p className="text-muted-foreground text-sm">Comprehensive insights and performance metrics</p>
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export Report
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {summaryCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-0 shadow-md bg-white/80 dark:bg-gray-900/80 text-center">
                  <CardContent className="pt-4 pb-4">
                    <div className={`p-2 rounded-xl ${card.bg} w-fit mx-auto mb-2`}>
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {error && <p className="text-sm text-destructive">Failed to load analytics data.</p>}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">

            {/* Monthly Trend */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" /> Monthly Complaint Trend
                  </CardTitle>
                  <CardDescription>Submitted vs resolved per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                        <Legend />
                        <Bar dataKey="submitted" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Submitted" />
                        <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} name="Resolved" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Distribution */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Complaints by Category</CardTitle>
                  <CardDescription>Distribution of complaint types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    {categoryData.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Resolution Line Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-500" /> Resolution Trend
                  </CardTitle>
                  <CardDescription>Monthly resolution performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                        <Legend />
                        <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Resolved" />
                        <Line type="monotone" dataKey="submitted" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Submitted" strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Bills Status */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-amber-500" /> Bills Status Overview
                  </CardTitle>
                  <CardDescription>Financial approval breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-emerald-600">₹{(billStats.totalAmount / 100000).toFixed(1)}L</p>
                    <p className="text-sm text-muted-foreground">Total Bill Value</p>
                  </div>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={billChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                          {billChartData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {billChartData.map((b) => (
                      <div key={b.name} className="rounded-lg p-2" style={{ backgroundColor: b.color + "20" }}>
                        <p className="text-lg font-bold" style={{ color: b.color }}>{b.value}</p>
                        <p className="text-xs text-muted-foreground">{b.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
