"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MessageSquareWarning,
  Briefcase,
  FileText,
  TrendingUp,
  ArrowUpRight,
  Loader2,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Building2,
  Activity,
  Zap,
  BarChart3,
  PieChart,
  DollarSign,
  AlertCircle,
  Sparkles,
  Shield,
  Eye,
  Download,
  RefreshCw,
  Bell,
  Settings,
  UserCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { useFetch } from "@/hooks/use-fetch";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";

export function DashboardAdmin() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");
  
  const { data: stats, isLoading: statsLoading, refetch } = useFetch<{
    openComplaints: number;
    activeProjects: number;
    pendingBills: number;
    resolutionRate: number;
    totalRevenue?: number;
    averageResponseTime?: string;
    satisfactionScore?: number;
  }>("/api/dashboard/stats");

  const { data: complaintsData } = useFetch<
    Array<{ id: string; title: string; status: string; priority: string; createdAt: string }>
  >("/api/complaints");

  const { data: billsData } = useFetch<
    Array<{ id: string; title: string; amount: number; departmentName: string; status?: string }>
  >("/api/bills");

  const { data: departmentsData } = useFetch<Array<{ name: string; id: string; workload?: number }>>("/api/departments");

  const complaints = complaintsData ?? [];
  const bills = billsData ?? [];
  const departments = departmentsData ?? [];
  const recentComplaints = complaints.slice(0, 4);
  const pendingBillsList = bills.filter((b) => b.status === "pending" || !b.status).slice(0, 4);

  // Calculate additional metrics
  const metrics = useMemo(() => {
    const urgentComplaints = complaints.filter(c => c.priority === "urgent" || c.priority === "high").length;
    const resolvedThisMonth = complaints.filter(c => 
      c.status === "resolved" && 
      new Date(c.createdAt).getMonth() === new Date().getMonth()
    ).length;
    const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0);
    
    return {
      urgentComplaints,
      resolvedThisMonth,
      totalAmount,
      activeDepartments: departments.length,
    };
  }, [complaints, bills, departments]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const statCards = [
    {
      label: "Open Complaints",
      value: stats?.openComplaints ?? 0,
      change: "+12%",
      trend: "up" as const,
      icon: MessageSquareWarning,
      gradient: "from-blue-500 to-cyan-600",
      iconBg: "bg-blue-500/20",
      href: "/complaints",
      description: "Active issues pending resolution",
    },
    {
      label: "Active Projects",
      value: stats?.activeProjects ?? 0,
      change: "+5%",
      trend: "up" as const,
      icon: Briefcase,
      gradient: "from-emerald-500 to-green-600",
      iconBg: "bg-emerald-500/20",
      href: "/projects",
      description: "Ongoing municipal projects",
    },
    {
      label: "Pending Bills",
      value: stats?.pendingBills ?? 0,
      change: "-8%",
      trend: "down" as const,
      icon: FileText,
      gradient: "from-amber-500 to-orange-600",
      iconBg: "bg-amber-500/20",
      href: "/bills",
      description: "Awaiting approval",
    },
    {
      label: "Resolution Rate",
      value: stats ? `${stats.resolutionRate}%` : "0%",
      change: "+2%",
      trend: "up" as const,
      icon: TrendingUp,
      gradient: "from-violet-500 to-purple-600",
      iconBg: "bg-violet-500/20",
      href: "/reports",
      description: "Complaints resolved successfully",
    },
  ];

  const quickActions = [
    { label: "New Complaint", icon: MessageSquareWarning, href: "/complaints/submit", color: "from-blue-500 to-blue-600" },
    { label: "Schedule Meeting", icon: Calendar, href: "/meetings", color: "from-emerald-500 to-green-600" },
    { label: "Add Bill", icon: DollarSign, href: "/bills/create", color: "from-amber-500 to-orange-600" },
    { label: "View Reports", icon: BarChart3, href: "/reports", color: "from-violet-500 to-purple-600" },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "bg-red-500/20 text-red-600 border-red-500/30";
      case "high":
        return "bg-orange-500/20 text-orange-600 border-orange-500/30";
      case "medium":
        return "bg-amber-500/20 text-amber-600 border-amber-500/30";
      case "low":
        return "bg-emerald-500/20 text-emerald-600 border-emerald-500/30";
      default:
        return "bg-gray-500/20 text-gray-600 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-3xl blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Municipal operations overview, analytics, and control center
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-emerald-500/10 rounded-full px-3 py-1.5 border border-emerald-500/20">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.7)]" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">System Active</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2 border-2 hover:border-primary/50 hover:bg-primary/5"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={card.href}>
                  <Card className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-3 rounded-xl ${card.iconBg} backdrop-blur-sm group-hover:scale-110 transition-transform`}>
                          <Icon className={`h-6 w-6 bg-gradient-to-br ${card.gradient} bg-clip-text text-transparent`} />
                        </div>
                        <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50">
                          {card.trend === "up" ? "↑" : "↓"} {card.change}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-2xl md:text-3xl font-bold tracking-tight">{card.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">{card.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Stats Row */}
        <div className="grid gap-5 grid-cols-2 md:grid-cols-4">
          {[
            { label: "Urgent Issues", value: metrics.urgentComplaints, icon: AlertCircle, color: "from-red-500 to-red-600" },
            { label: "Resolved (This Month)", value: metrics.resolvedThisMonth, icon: CheckCircle2, color: "from-emerald-500 to-green-600" },
            { label: "Total Bill Value", value: `₹${(metrics.totalAmount / 100000).toFixed(1)}L`, icon: DollarSign, color: "from-amber-500 to-orange-600" },
            { label: "Active Departments", value: metrics.activeDepartments, icon: Building2, color: "from-blue-500 to-cyan-600" },
          ].map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
              >
                <Card className="bg-white/50 dark:bg-gray-900/50 border-0 shadow-md">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <p className="text-xs text-muted-foreground">{metric.label}</p>
                      </div>
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color} bg-opacity-10`}>
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Analytics + Department Overview */}
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold">Analytics Overview</CardTitle>
                    <CardDescription>Complaints and resolution trends</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {["week", "month", "year"].map((period) => (
                      <Button
                        key={period}
                        variant={selectedPeriod === period ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPeriod(period as "week" | "month" | "year")}
                        className="capitalize"
                      >
                        {period}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl bg-background/40 p-4 backdrop-blur-md">
                  <AnalyticsCharts />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Department Workload</CardTitle>
                <CardDescription>Real-time workload distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {departments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Building2 className="h-12 w-12 opacity-20 mb-3" />
                    <p className="text-sm">No departments data available</p>
                  </div>
                ) : (
                  departments.slice(0, 5).map((d, index) => {
                    const workload = d.workload || 40 + index * 12;
                    const gradientClass = index === 0 ? "from-blue-500 to-cyan-500" :
                                         index === 1 ? "from-emerald-500 to-green-500" :
                                         index === 2 ? "from-amber-500 to-orange-500" :
                                         index === 3 ? "from-violet-500 to-purple-500" :
                                         "from-pink-500 to-rose-500";
                    
                    return (
                      <motion.div
                        key={d.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                      >
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${gradientClass}`} />
                            {d.name}
                          </span>
                          <span className="text-muted-foreground">{workload}%</span>
                        </div>
                        <Progress value={workload} className="h-2 rounded-full bg-muted" />
                      </motion.div>
                    );
                  })
                )}
                {departments.length > 0 && (
                  <Button variant="ghost" size="sm" className="w-full mt-4" asChild>
                    <Link href="/departments">
                      View all departments
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
              <CardDescription>Frequently used administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.label}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.65 + index * 0.05 }}
                    >
                      <Link href={action.href}>
                        <Button
                          variant="outline"
                          className="w-full gap-2 h-auto py-4 flex-col border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
                        >
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-sm font-medium">{action.label}</span>
                        </Button>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Complaints + Pending Approvals */}
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Recent Complaints</CardTitle>
                  <CardDescription>Latest citizen submissions</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="rounded-xl border-2 hover:border-primary/50"
                >
                  <Link href="/complaints">
                    View all
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {recentComplaints.length === 0 ? (
                    <li className="text-sm text-muted-foreground text-center py-8">No complaints yet.</li>
                  ) : (
                    <AnimatePresence>
                      {recentComplaints.map((c, index) => (
                        <motion.li
                          key={c.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.75 + index * 0.05 }}
                          className="flex items-center justify-between rounded-xl border border-border/50 bg-white/30 dark:bg-gray-800/30 px-4 py-3 transition-all duration-300 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:translate-x-1"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{c.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground font-mono">{c.id.slice(0, 8)}</span>
                              <Badge className={getPriorityColor(c.priority)}>
                                {c.priority}
                              </Badge>
                            </div>
                          </div>

                          <Badge
                            variant={c.status === "resolved" ? "default" : "secondary"}
                            className={`capitalize ${
                              c.status === "resolved" ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          >
                            {c.status.replace(/_/g, " ")}
                          </Badge>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  )}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Pending Approvals</CardTitle>
                  <CardDescription>Bills awaiting your review</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="rounded-xl border-2 hover:border-primary/50"
                >
                  <Link href="/bills/approvals">
                    View all
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {pendingBillsList.length === 0 ? (
                    <li className="text-sm text-muted-foreground text-center py-8">No pending bills.</li>
                  ) : (
                    <AnimatePresence>
                      {pendingBillsList.map((b, index) => (
                        <motion.li
                          key={b.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.05 }}
                          className="flex items-center justify-between rounded-xl border border-border/50 bg-white/30 dark:bg-gray-800/30 px-4 py-3 transition-all duration-300 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:translate-x-1"
                        >
                          <div>
                            <p className="font-medium text-sm">{b.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {b.departmentName ?? "—"} · ID: {b.id.slice(0, 8)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600 dark:text-emerald-400">
                              ₹{Number(b.amount).toLocaleString()}
                            </p>
                            <Badge variant="outline" className="mt-1 bg-amber-500/10 text-amber-600 border-amber-500/20">
                              Pending
                            </Badge>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  )}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}