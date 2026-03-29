"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  MessageSquareWarning, ArrowUpRight, Scale, CheckCircle2,
  AlertCircle, Building2, TrendingUp, FileText, BarChart3,
  RefreshCw, Download, Users, Shield, Eye, FileCheck,
} from "lucide-react";
import Link from "next/link";
import { useFetch } from "@/hooks/use-fetch";
import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function DashboardDC() {
  const { data: statsData, refetch } = useFetch<{
    openComplaints: number; activeProjects: number; pendingBills: number;
    resolutionRate: number; totalComplaints: number; resolvedCount: number;
    totalStaff: number; totalDepartments: number;
  }>("/api/dashboard/stats");

  const { data: complaintsData } = useFetch<Array<{
    id: string; title: string; status: string; priority: string;
    category: string; departmentName: string | null; createdAt: string;
  }>>("/api/complaints");

  const { data: auditData } = useFetch<Array<{
    id: string; action: string; userEmail?: string; entityType?: string; createdAt: string;
  }>>("/api/audit");

  const { data: analyticsData } = useFetch<{
    monthlyData: Array<{ month: string; submitted: number; resolved: number }>;
    categoryData: Array<{ name: string; count: number }>;
  }>("/api/analytics/complaints");

  const { data: projectsData } = useFetch<Array<{
    id: string; name: string; status: string; progress: number; departmentName?: string;
  }>>("/api/projects");

  const complaints = complaintsData ?? [];
  const auditLogs = (auditData ?? []).slice(0, 5);
  const monthlyData = analyticsData?.monthlyData ?? [];
  const categoryData = (analyticsData?.categoryData ?? []).map((c, i) => ({ ...c, color: PIE_COLORS[i % PIE_COLORS.length] }));
  const projects = (projectsData ?? []).slice(0, 5);

  const urgentCount = complaints.filter(c => c.priority === "urgent").length;
  const highCount = complaints.filter(c => c.priority === "high").length;
  const resolvedToday = complaints.filter(c => {
    const today = new Date().toDateString();
    return c.status === "resolved" && new Date(c.createdAt).toDateString() === today;
  }).length;

  const kpiCards = [
    { label: "Total Complaints", value: statsData?.totalComplaints ?? 0, icon: MessageSquareWarning, color: "text-blue-600", bg: "bg-blue-500/10", change: "+5%" },
    { label: "Resolution Rate", value: `${statsData?.resolutionRate ?? 0}%`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-500/10", change: "+2%" },
    { label: "Active Projects", value: statsData?.activeProjects ?? 0, icon: Building2, color: "text-violet-600", bg: "bg-violet-500/10", change: "+1" },
    { label: "Pending Bills", value: statsData?.pendingBills ?? 0, icon: FileText, color: "text-amber-600", bg: "bg-amber-500/10", change: "-3" },
    { label: "Total Staff", value: statsData?.totalStaff ?? 0, icon: Users, color: "text-indigo-600", bg: "bg-indigo-500/10", change: "" },
    { label: "Departments", value: statsData?.totalDepartments ?? 0, icon: Building2, color: "text-rose-600", bg: "bg-rose-500/10", change: "" },
    { label: "Urgent Issues", value: urgentCount, icon: AlertCircle, color: "text-red-600", bg: "bg-red-500/10", change: "" },
    { label: "Resolved Today", value: resolvedToday, icon: CheckCircle2, color: "text-teal-600", bg: "bg-teal-500/10", change: "" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-700 to-gray-800 p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm font-medium opacity-80">Deputy Commissioner</span>
                </div>
                <h1 className="text-3xl font-bold">DC Command Center</h1>
                <p className="text-white/70 mt-1">Full district governance, compliance & oversight</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => refetch()} variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 gap-1">
                  <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
                <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 gap-1">
                  <Download className="h-4 w-4" /> Export
                </Button>
                <Button asChild size="sm" className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold gap-1">
                  <Link href="/audit"><Shield className="h-4 w-4" /> Audit</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* KPI Grid */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
          {kpiCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-0 shadow-md bg-white/80 dark:bg-gray-900/80 text-center">
                  <CardContent className="pt-3 pb-3">
                    <div className={`p-1.5 rounded-lg ${card.bg} w-fit mx-auto mb-1.5`}>
                      <Icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                    <p className="text-xl font-bold">{card.value}</p>
                    <p className="text-xs text-muted-foreground leading-tight">{card.label}</p>
                    {card.change && <p className="text-xs text-emerald-600 font-medium">{card.change}</p>}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Line Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-slate-600" /> District Complaint Trend
                </CardTitle>
                <CardDescription>6-month submitted vs resolved</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                      <Line type="monotone" dataKey="submitted" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Submitted" />
                      <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Resolved" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pie Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">By Category</CardTitle>
                <CardDescription>Complaint type distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  {categoryData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name.slice(0, 6)} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Grid */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* High Priority Complaints */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" /> High Priority
                  </CardTitle>
                  <CardDescription>Urgent unresolved issues</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/complaints">All <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {complaints.filter(c => ["urgent", "high"].includes(c.priority) && c.status !== "resolved").slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.category}</p>
                    </div>
                    <Badge className={`text-xs ml-2 shrink-0 ${c.priority === "urgent" ? "bg-red-500/20 text-red-600" : "bg-orange-500/20 text-orange-600"}`}>{c.priority}</Badge>
                  </div>
                ))}
                {complaints.filter(c => ["urgent", "high"].includes(c.priority) && c.status !== "resolved").length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">No high priority issues</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Projects */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-violet-500" /> Active Projects
                  </CardTitle>
                  <CardDescription>District project progress</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/projects">All <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No projects</p>
                ) : projects.map(p => (
                  <div key={p.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium truncate max-w-[140px]">{p.name}</span>
                      <span className="text-muted-foreground shrink-0">{p.progress}%</span>
                    </div>
                    <Progress value={p.progress} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Audit Trail */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-slate-600" /> Recent Audit
                  </CardTitle>
                  <CardDescription>Latest system actions</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/audit">Full <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {auditLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No audit logs</p>
                ) : (
                  <ul className="space-y-2">
                    {auditLogs.map(log => (
                      <li key={log.id} className="py-2 border-b border-border/30 last:border-0">
                        <p className="text-xs font-medium truncate">{log.action}</p>
                        <p className="text-xs text-muted-foreground">{log.userEmail ?? "System"} · {new Date(log.createdAt).toLocaleDateString("en-IN")}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
