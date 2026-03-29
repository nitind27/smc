"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckSquare, Calendar, MessageSquareWarning, ArrowUpRight,
  Loader2, Clock, CheckCircle2, TrendingUp, User, Bell, Plus,
} from "lucide-react";
import Link from "next/link";
import { useFetch } from "@/hooks/use-fetch";
import { useAuth } from "@/providers/auth-provider";
import { motion } from "framer-motion";
import { useMemo } from "react";

export function DashboardStaff() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useFetch<{
    myTasks: number;
    assignedComplaints: number;
    todayMeetings: number;
    completedTasks: number;
  }>(`/api/dashboard/stats?role=staff&userId=${user?.id ?? ""}`);

  const { data: tasksData } = useFetch<Array<{
    id: string; title: string; status: string; priority: string; dueDate?: string;
  }>>("/api/tasks");

  const { data: complaintsData } = useFetch<Array<{
    id: string; title: string; status: string; priority: string; createdAt: string;
  }>>(`/api/complaints?assignedTo=${user?.id ?? ""}`);

  const { data: meetingsData } = useFetch<Array<{
    id: string; title: string; date: string; time: string; status: string;
  }>>("/api/meetings");

  const { data: notificationsData } = useFetch<Array<{
    id: string; title: string; body?: string; type: string; readAt?: string; createdAt: string;
  }>>(`/api/notifications?userId=${user?.id ?? ""}&unreadOnly=false`);

  const tasks = (tasksData ?? []).filter(t => t.status !== "done");
  const allTasks = tasksData ?? [];
  const complaints = complaintsData ?? [];
  const meetings = (meetingsData ?? []).filter(m => m.status === "scheduled").slice(0, 3);
  const notifications = (notificationsData ?? []).filter(n => !n.readAt).slice(0, 4);

  const taskProgress = useMemo(() => {
    const total = allTasks.length;
    const done = allTasks.filter(t => t.status === "done").length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [allTasks]);

  const statCards = [
    { label: "My Tasks", value: stats?.myTasks ?? 0, icon: CheckSquare, gradient: "from-blue-500 to-cyan-600", iconBg: "bg-blue-500/20", href: "/tasks" },
    { label: "Assigned Complaints", value: stats?.assignedComplaints ?? 0, icon: MessageSquareWarning, gradient: "from-amber-500 to-orange-600", iconBg: "bg-amber-500/20", href: "/complaints" },
    { label: "Today's Meetings", value: stats?.todayMeetings ?? 0, icon: Calendar, gradient: "from-violet-500 to-purple-600", iconBg: "bg-violet-500/20", href: "/schedule" },
    { label: "Completed Tasks", value: stats?.completedTasks ?? 0, icon: CheckCircle2, gradient: "from-emerald-500 to-green-600", iconBg: "bg-emerald-500/20", href: "/tasks" },
  ];

  const priorityColor = (p: string) => {
    if (p === "urgent") return "bg-red-500/20 text-red-600";
    if (p === "high") return "bg-orange-500/20 text-orange-600";
    if (p === "medium") return "bg-amber-500/20 text-amber-600";
    return "bg-gray-500/20 text-gray-600";
  };

  const statusColor = (s: string) => {
    if (s === "done") return "bg-emerald-500/20 text-emerald-600";
    if (s === "in_progress") return "bg-blue-500/20 text-blue-600";
    if (s === "review") return "bg-violet-500/20 text-violet-600";
    return "bg-gray-500/20 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  My Workspace
                </h1>
                <p className="text-muted-foreground text-sm">Welcome back, {user?.name?.split(" ")[0]}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/complaints/submit"><Plus className="h-4 w-4 mr-1" /> Report Issue</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/tasks">View Tasks</Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link href={card.href}>
                  <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.gradient} opacity-5 rounded-full blur-xl group-hover:opacity-10 transition-opacity`} />
                    <CardContent className="pt-5 pb-4">
                      <div className={`p-2.5 rounded-xl ${card.iconBg} w-fit mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      {statsLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <p className="text-2xl font-bold">{card.value}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Task Progress Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-0 shadow-md bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Overall Task Progress</span>
                </div>
                <span className="text-sm font-bold text-primary">{taskProgress}%</span>
              </div>
              <Progress value={taskProgress} className="h-3 rounded-full" />
              <p className="text-xs text-muted-foreground mt-2">
                {allTasks.filter(t => t.status === "done").length} of {allTasks.length} tasks completed
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* My Tasks */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-blue-500" /> My Tasks
                  </CardTitle>
                  <CardDescription>Active and pending tasks</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/tasks">Board <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
                    <CheckCircle2 className="h-10 w-10 opacity-20" />
                    <p className="text-sm">All tasks completed!</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {tasks.slice(0, 5).map((t) => (
                      <li key={t.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2.5 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <p className="text-sm truncate">{t.title}</p>
                        </div>
                        <div className="flex gap-1.5 ml-2 shrink-0">
                          <Badge className={`text-xs ${priorityColor(t.priority)}`}>{t.priority}</Badge>
                          <Badge className={`text-xs ${statusColor(t.status)}`}>{t.status.replace(/_/g, " ")}</Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Assigned Complaints */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <MessageSquareWarning className="h-5 w-5 text-amber-500" /> Assigned Complaints
                  </CardTitle>
                  <CardDescription>Complaints assigned to you</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/complaints">View all <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {complaints.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
                    <MessageSquareWarning className="h-10 w-10 opacity-20" />
                    <p className="text-sm">No complaints assigned to you</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {complaints.slice(0, 5).map((c) => (
                      <li key={c.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2.5 hover:bg-muted/30 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{c.title}</p>
                          <p className="text-xs text-muted-foreground font-mono">#{c.id.slice(0, 8)}</p>
                        </div>
                        <Badge className={`text-xs ml-2 shrink-0 ${c.status === "resolved" ? "bg-emerald-500/20 text-emerald-600" : "bg-amber-500/20 text-amber-600"}`}>
                          {c.status.replace(/_/g, " ")}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Meetings */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-violet-500" /> Upcoming Meetings
                  </CardTitle>
                  <CardDescription>Scheduled meetings</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/schedule">Schedule <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {meetings.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
                    <Calendar className="h-10 w-10 opacity-20" />
                    <p className="text-sm">No upcoming meetings</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {meetings.map((m) => (
                      <li key={m.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2.5 hover:bg-muted/30 transition-colors">
                        <div>
                          <p className="text-sm font-medium">{m.title}</p>
                          <p className="text-xs text-muted-foreground">{m.date} · {m.time}</p>
                        </div>
                        <Badge className="text-xs bg-blue-500/20 text-blue-600">Scheduled</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Bell className="h-5 w-5 text-rose-500" /> Notifications
                  </CardTitle>
                  <CardDescription>Unread alerts</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/notifications">All <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
                    <Bell className="h-10 w-10 opacity-20" />
                    <p className="text-sm">No unread notifications</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {notifications.map((n) => (
                      <li key={n.id} className="flex items-start gap-3 rounded-lg border border-border/50 px-3 py-2.5 hover:bg-muted/30 transition-colors">
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{n.title}</p>
                          {n.body && <p className="text-xs text-muted-foreground truncate">{n.body}</p>}
                        </div>
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
