"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  MessageSquareWarning, Users, FileText, Calendar, CheckSquare,
  ArrowUpRight, Loader2, TrendingUp, Clock, CheckCircle2, Building2,
  RefreshCw, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useFetch } from "@/hooks/use-fetch";
import { useAuth } from "@/providers/auth-provider";
import { motion } from "framer-motion";
import { useMemo } from "react";

export function DashboardDepartmentHead() {
  const { user } = useAuth();
  const deptId = user?.departmentId;

  const { data: stats, isLoading: statsLoading, refetch } = useFetch<{
    deptComplaints: number;
    teamMembers: number;
    pendingBills: number;
    upcomingMeetings: number;
    activeTasks: number;
    resolvedThisMonth: number;
  }>(`/api/dashboard/stats?role=department_head&departmentId=${deptId ?? ""}`);

  const { data: complaintsData } = useFetch<Array<{
    id: string; title: string; status: string; priority: string; createdAt: string;
  }>>(`/api/complaints?departmentId=${deptId ?? ""}`);

  const { data: staffData } = useFetch<Array<{
    id: string; name: string; role: string; departmentName: string | null;
  }>>("/api/staff");

  const { data: tasksData } = useFetch<Array<{
    id: string; title: string; status: string; priority: string;
  }>>("/api/tasks");

  const { data: billsData } = useFetch<Array<{
    id: string; title: string; amount: number; status: string;
  }>>(`/api/bills?departmentId=${deptId ?? ""}`);

  const complaints = complaintsData ?? [];
  const staff = staffData ?? [];
  const tasks = tasksData ?? [];
  const bills = billsData ?? [];

  const recentComplaints = complaints.slice(0, 5);
  const pendingBills = bills.filter(b => b.status === "pending").slice(0, 4);
  const activeTasks = tasks.filter(t => t.status !== "done").slice(0, 5);

  const taskProgress = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => t.status === "done").length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [tasks]);

  const statCards = [
    {
      label: "Dept. Complaints",
      value: stats?.deptComplaints ?? 0,
      icon: MessageSquareWarning,
      gradient: "from-blue-500 to-cyan-600",
      iconBg: "bg-blue-500/20",
      href: "/complaints",
      desc: "Open in your department",
    },
    {
      label: "Team Members",
      value: stats?.teamMembers ?? 0,
      icon: Users,
      gradient: "from-emerald-500 to-green-600",
      iconBg: "bg-emerald-500/20",
      href: "/staff",
      desc: "Active staff",
    },
    {
      label: "Pending Bills",
      value: stats?.pendingBills ?? 0,
      icon: FileText,
      gradient: "from-amber-500 to-orange-600",
      iconBg: "bg-amber-500/20",
      href: "/bills/approvals",
      desc: "Awaiting approval",
    },
    {
      label: "Upcoming Meetings",
      value: stats?.upcomingMeetings ?? 0,
      icon: Calendar,
      gradient: "from-violet-500 to-purple-600",
      iconBg: "bg-violet-500/20",
      href: "/schedule",
      desc: "Scheduled ahead",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  Department Dashboard
                </h1>
                <p className="text-muted-foreground text-sm">Manage your department operations</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Refresh
              </Button>
              <Button size="sm" asChild className="gap-2">
                <Link href="/complaints/submit">
                  <MessageSquareWarning className="h-4 w-4" /> New Complaint
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link href={card.href}>
                  <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-3 rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform`}>
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {statsLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <p className="text-3xl font-bold">{card.value}</p>
                          <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
                          <p className="text-xs text-muted-foreground/70">{card.desc}</p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          {[
            { label: "Resolved This Month", value: stats?.resolvedThisMonth ?? 0, icon: CheckCircle2, color: "text-emerald-600" },
            { label: "Active Tasks", value: stats?.activeTasks ?? 0, icon: CheckSquare, color: "text-blue-600" },
            { label: "Task Completion", value: `${taskProgress}%`, icon: TrendingUp, color: "text-violet-600" },
          ].map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.05 }}>
                <Card className="border-0 shadow-md bg-white/50 dark:bg-gray-900/50">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{m.value}</p>
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                      </div>
                      <Icon className={`h-8 w-8 ${m.color} opacity-70`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Recent Complaints */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Department Complaints</CardTitle>
                  <CardDescription>Recent issues in your department</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/complaints">View all <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentComplaints.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
                    <MessageSquareWarning className="h-10 w-10 opacity-20" />
                    <p className="text-sm">No complaints in your department</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {recentComplaints.map((c) => (
                      <li key={c.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2.5 hover:bg-muted/30 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{c.title}</p>
                          <p className="text-xs text-muted-foreground font-mono">#{c.id.slice(0, 8)}</p>
                        </div>
                        <div className="flex gap-2 ml-2">
                          <Badge className={`text-xs ${c.priority === "urgent" ? "bg-red-500/20 text-red-600" : c.priority === "high" ? "bg-orange-500/20 text-orange-600" : "bg-gray-500/20 text-gray-600"}`}>
                            {c.priority}
                          </Badge>
                          <Badge className={`text-xs ${c.status === "resolved" ? "bg-emerald-500/20 text-emerald-600" : "bg-amber-500/20 text-amber-600"}`}>
                            {c.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Tasks */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Team Tasks</CardTitle>
                  <CardDescription>Overall task progress</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/tasks">Task Board <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Overall Completion</span>
                    <span className="text-muted-foreground">{taskProgress}%</span>
                  </div>
                  <Progress value={taskProgress} className="h-3 rounded-full" />
                </div>
                {activeTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No active tasks</p>
                ) : (
                  <ul className="space-y-2">
                    {activeTasks.map((t) => (
                      <li key={t.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <p className="text-sm truncate">{t.title}</p>
                        </div>
                        <Badge variant="outline" className="text-xs ml-2 shrink-0">
                          {t.status.replace(/_/g, " ")}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Bills */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Pending Bills</CardTitle>
                  <CardDescription>Bills awaiting approval</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/bills/approvals">Approvals <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
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
                    {pendingBills.map((b) => (
                      <li key={b.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2.5 hover:bg-muted/30 transition-colors">
                        <div>
                          <p className="text-sm font-medium">{b.title}</p>
                          <p className="text-xs text-muted-foreground">ID: {b.id.slice(0, 8)}</p>
                        </div>
                        <p className="font-bold text-emerald-600">₹{Number(b.amount).toLocaleString()}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Members */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Team Members</CardTitle>
                  <CardDescription>Staff in your department</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/staff">Manage <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {staff.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
                    <Users className="h-10 w-10 opacity-20" />
                    <p className="text-sm">No staff members found</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {staff.slice(0, 5).map((s) => (
                      <li key={s.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {s.name.slice(0, 2).toUpperCase()}
                          </div>
                          <p className="text-sm font-medium">{s.name}</p>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">{s.role.replace(/_/g, " ")}</Badge>
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
