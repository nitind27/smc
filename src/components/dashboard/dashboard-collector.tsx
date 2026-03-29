"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  MessageSquareWarning, ArrowUpRight, Loader2, Landmark,
  CheckCircle2, Clock, AlertCircle, Building2, Bell,
  TrendingUp, FileText, BarChart3, RefreshCw, Download, Users,
} from "lucide-react";
import Link from "next/link";
import { useFetch } from "@/hooks/use-fetch";
import { useAuth } from "@/providers/auth-provider";
import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export function DashboardCollector() {
  const { user } = useAuth();

  const { data: statsData, refetch } = useFetch<{
    openComplaints: number; activeProjects: number; pendingBills: number;
    resolutionRate: number; totalComplaints: number; resolvedCount: number;
    totalStaff: number; totalDepartments: number;
  }>("/api/dashboard/stats");

  const { data: complaintsData } = useFetch<Array<{
    id: string; title: string; status: string; priority: string;
    category: string; departmentName: string | null; createdAt: string;
  }>>("/api/complaints");

  const { data: deptData } = useFetch<Array<{ id: string; name: string }>>("/api/departments");
  const { data: projectsData } = useFetch<Array<{ id: string; name: string; status: string; progress: number }>>("/api/projects");
  const { data: billsData } = useFetch<Array<{ id: string; title: string; amount: number; status: string }>>("/api/bills");
  const { data: analyticsData } = useFetch<{ monthlyData: Array<{ month: string; submitted: number; resolved: number }> }>("/api/analytics/complaints");

  const complaints = complaintsData ?? [];
  const departments = deptData ?? [];
  const projects = projectsData ?? [];
  const bills = billsData ?? [];
  const monthlyData = analyticsData?.monthlyData ?? [];

  const escalated = complaints.filter(c => (c.priority === "urgent" || c.priority === "high") && c.status !== "resolved").slice(0, 5);
  const pendingBills = bills.filter(b => b.status === "pending").slice(0, 4);

  const deptStats = useMemo(() => {
    return departments.map(d => ({
      name: d.name.length > 12 ? d.name.slice(0, 12) + "…" : d.name,
      complaints: complaints.filter(c => c.departmentName === d.name).length,
    }));
  }, [departments, complaints]);

  const statCards = [
    { label: "Open Complaints", value: statsData?.openComplaints ?? 0, icon: MessageSquareWarning, gradient: "from-blue-500 to-cyan-600", bg: "bg-blue-500/10", href: "/complaints" },
    { label: "Active Projects", value: statsData?.activeProjects ?? 0, icon: Building2, gradient: "from-emerald-500 to-green-600", bg: "bg-emerald-500/10", href: "/projects" },
    { label: "Pending Bills", value: statsData?.pendingBills ?? 0, icon: FileText, gradient: "from-amber-500 to-orange-600", bg: "bg-amber-500/10", href: "/bills/approvals" },
    { label: "Resolution Rate", value: `${statsData?.resolutionRate ?? 0}%`, icon: TrendingUp, gradient: "from-violet-500 to-purple-600", bg: "bg-violet-500/10", href: "/reports" },
    { label: "Total Staff", value: statsData?.totalStaff ?? 0, icon: Users, gradient: "from-rose-500 to-pink-600", bg: "bg-rose-500/10", href: "/staff" },
    { label: "Departments", value: statsData?.totalDepartments ?? 0, icon: Building2, gradient: "from-indigo-500 to-blue-600", bg: "bg-indigo-500/10", href: "/departments" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Landmark className="h-5 w-5" />
                  <span className="text-sm font-medium opacity-80">District Collector</span>
                </div>
                <h1 className="text-3xl font-bold">Collector Dashboard</h1>
                <p className="text-white/80 mt-1">District-level oversight and governance</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => refetch()} variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 gap-1">
                  <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
                <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 gap-1">
                  <Download className="h-4 w-4" /> Export
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link href={card.href}>
                  <Card className="group border-0 shadow-md bg-white/80 dark:bg-gray-900/80 text-center hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer">
                    <CardContent className="pt-4 pb-4">
                      <div className={`p-2 rounded-xl ${card.bg} w-fit mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-2xl font-bold">{card.value}</p>
                      <p className="text-xs text-muted-foreground">{card.label}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* Monthly Trend Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-500" /> Monthly Complaint Trend
                </CardTitle>
                <CardDescription>Submitted vs resolved per month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                      <Bar dataKey="submitted" fill="#6366f1" radius={[4, 4, 0, 0]} name="Submitted" />
                      <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} name="Resolved" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Department Complaints */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Department Load</CardTitle>
                <CardDescription>Complaints per department</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {deptStats.slice(0, 5).map((d, i) => {
                  const max = Math.max(...deptStats.map(x => x.complaints), 1);
                  return (
                    <div key={d.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{d.name}</span>
                        <span className="text-muted-foreground">{d.complaints}</span>
                      </div>
                      <Progress value={(d.complaints / max) * 100} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Escalated / High Priority */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" /> Escalated Issues
                  </CardTitle>
                  <CardDescription>Urgent & high priority unresolved</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/complaints">All <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {escalated.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
                    <CheckCircle2 className="h-10 w-10 opacity-20" />
                    <p className="text-sm">No escalated issues</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {escalated.map(c => (
                      <li key={c.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2.5 hover:bg-muted/20 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{c.title}</p>
                          <p className="text-xs text-muted-foreground">{c.departmentName ?? "Unassigned"} · {c.category}</p>
                        </div>
                        <div className="flex gap-1.5 ml-2 shrink-0">
                          <Badge className={`text-xs ${c.priority === "urgent" ? "bg-red-500/20 text-red-600" : "bg-orange-500/20 text-orange-600"}`}>{c.priority}</Badge>
                          <Button size="sm" variant="ghost" asChild className="h-6 px-2 text-xs">
                            <Link href={`/complaints/${c.id}`}>View</Link>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Bills for Approval */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-amber-500" /> Pending Bill Approvals
                  </CardTitle>
                  <CardDescription>Bills awaiting collector approval</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/bills/approvals">Review <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {pendingBills.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
                    <CheckCircle2 className="h-10 w-10 opacity-20" />
                    <p className="text-sm">No pending bills</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {pendingBills.map(b => (
                      <li key={b.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2.5 hover:bg-muted/20 transition-colors">
                        <div>
                          <p className="text-sm font-medium">{b.title}</p>
                          <p className="text-xs text-muted-foreground font-mono">#{b.id.slice(0, 8)}</p>
                        </div>
                        <p className="font-bold text-emerald-600 text-sm">₹{Number(b.amount).toLocaleString()}</p>
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
