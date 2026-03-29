"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileCheck, FileText, BarChart3, ArrowUpRight, Loader2,
  Shield, TrendingUp, AlertCircle, CheckCircle2, Clock, Download, Eye,
} from "lucide-react";
import Link from "next/link";
import { useFetch } from "@/hooks/use-fetch";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export function DashboardAuditor() {
  const { data: stats, isLoading: statsLoading } = useFetch<{
    auditLogs: number;
    billsReviewed: number;
    totalComplaints: number;
    resolvedComplaints: number;
    resolutionRate: number;
  }>("/api/dashboard/stats?role=auditor");

  const { data: auditData } = useFetch<Array<{
    id: string; action: string; userEmail?: string; entityType?: string; createdAt: string;
  }>>("/api/audit");

  const { data: billsData } = useFetch<Array<{
    id: string; title: string; amount: number; status: string; submitterName?: string; createdAt: string;
  }>>("/api/bills");

  const { data: complaintsData } = useFetch<Array<{
    id: string; title: string; status: string; priority: string; category: string;
  }>>("/api/complaints");

  const auditLogs = (auditData ?? []).slice(0, 6);
  const recentBills = (billsData ?? []).slice(0, 5);
  const urgentComplaints = (complaintsData ?? []).filter(c => c.priority === "urgent" || c.priority === "high").slice(0, 4);

  const statCards = [
    {
      label: "Audit Logs (Month)",
      value: stats?.auditLogs ?? 0,
      icon: FileCheck,
      gradient: "from-blue-500 to-cyan-600",
      iconBg: "bg-blue-500/20",
      href: "/audit",
      desc: "System actions recorded",
    },
    {
      label: "Bills Reviewed",
      value: stats?.billsReviewed ?? 0,
      icon: FileText,
      gradient: "from-emerald-500 to-green-600",
      iconBg: "bg-emerald-500/20",
      href: "/bills",
      desc: "Approved or rejected",
    },
    {
      label: "Total Complaints",
      value: stats?.totalComplaints ?? 0,
      icon: AlertCircle,
      gradient: "from-amber-500 to-orange-600",
      iconBg: "bg-amber-500/20",
      href: "/complaints",
      desc: "All time",
    },
    {
      label: "Resolution Rate",
      value: `${stats?.resolutionRate ?? 0}%`,
      icon: TrendingUp,
      gradient: "from-violet-500 to-purple-600",
      iconBg: "bg-violet-500/20",
      href: "/reports",
      desc: "Complaints resolved",
    },
  ];

  const actionColor = (action: string) => {
    if (action.includes("DELETE") || action.includes("REJECT")) return "bg-red-500/20 text-red-600";
    if (action.includes("CREATE") || action.includes("APPROVE")) return "bg-emerald-500/20 text-emerald-600";
    if (action.includes("UPDATE") || action.includes("ASSIGN")) return "bg-blue-500/20 text-blue-600";
    return "bg-gray-500/20 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  Audit Dashboard
                </h1>
                <p className="text-muted-foreground text-sm">Compliance monitoring and audit trail</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Export Report
              </Button>
              <Button size="sm" asChild>
                <Link href="/audit">View Full Audit</Link>
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

        {/* Resolution Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-0 shadow-md bg-gradient-to-r from-violet-500/5 via-purple-500/10 to-violet-500/5">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-violet-600" />
                  <span className="font-semibold text-sm">System Resolution Rate</span>
                </div>
                <span className="text-sm font-bold text-violet-600">{stats?.resolutionRate ?? 0}%</span>
              </div>
              <Progress value={stats?.resolutionRate ?? 0} className="h-3 rounded-full" />
              <p className="text-xs text-muted-foreground mt-2">
                {stats?.resolvedComplaints ?? 0} of {stats?.totalComplaints ?? 0} complaints resolved
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Recent Audit Logs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-blue-500" /> Recent Audit Activity
                  </CardTitle>
                  <CardDescription>Latest system actions</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/audit">Full Log <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {auditLogs.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
                    <FileCheck className="h-10 w-10 opacity-20" />
                    <p className="text-sm">No audit logs yet</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {auditLogs.map((log) => (
                      <li key={log.id} className="flex items-start justify-between rounded-lg border border-border/50 px-3 py-2.5 hover:bg-muted/30 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{log.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.userEmail ?? "System"} · {new Date(log.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={`text-xs ml-2 shrink-0 ${actionColor(log.action)}`}>
                          {log.entityType ?? "System"}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Bills Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-500" /> Bills Overview
                  </CardTitle>
                  <CardDescription>Recent financial transactions</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/bills">View all <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentBills.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
                    <FileText className="h-10 w-10 opacity-20" />
                    <p className="text-sm">No bills found</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {recentBills.map((b) => (
                      <li key={b.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2.5 hover:bg-muted/30 transition-colors">
                        <div>
                          <p className="text-sm font-medium">{b.title}</p>
                          <p className="text-xs text-muted-foreground">{b.submitterName ?? "—"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-600">₹{Number(b.amount).toLocaleString()}</p>
                          <Badge className={`text-xs ${b.status === "approved" ? "bg-emerald-500/20 text-emerald-600" : b.status === "rejected" ? "bg-red-500/20 text-red-600" : "bg-amber-500/20 text-amber-600"}`}>
                            {b.status}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* High Priority Complaints */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" /> High Priority Issues
                  </CardTitle>
                  <CardDescription>Urgent and high priority complaints</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/complaints">View all <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {urgentComplaints.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
                    <CheckCircle2 className="h-10 w-10 opacity-20" />
                    <p className="text-sm">No high priority issues</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {urgentComplaints.map((c) => (
                      <li key={c.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2.5 hover:bg-muted/30 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{c.title}</p>
                          <p className="text-xs text-muted-foreground">{c.category}</p>
                        </div>
                        <Badge className={`text-xs ml-2 shrink-0 ${c.priority === "urgent" ? "bg-red-500/20 text-red-600" : "bg-orange-500/20 text-orange-600"}`}>
                          {c.priority}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                <CardDescription>Common auditor tasks</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {[
                  { label: "View Audit Trail", icon: FileCheck, href: "/audit", color: "from-blue-500 to-cyan-600" },
                  { label: "Review Bills", icon: FileText, href: "/bills/approvals", color: "from-emerald-500 to-green-600" },
                  { label: "Analytics Report", icon: BarChart3, href: "/reports", color: "from-violet-500 to-purple-600" },
                  { label: "View Complaints", icon: Eye, href: "/complaints", color: "from-amber-500 to-orange-600" },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.label} href={action.href}>
                      <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-2 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-xs font-medium text-center">{action.label}</span>
                      </Button>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
