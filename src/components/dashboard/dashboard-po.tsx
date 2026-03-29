"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageSquareWarning, ArrowUpRight, Loader2, Forward,
  CheckCircle2, Clock, AlertCircle, MapPin, Bell, ClipboardList,
  TrendingUp, Users, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useFetch } from "@/hooks/use-fetch";
import { useAuth } from "@/providers/auth-provider";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

export function DashboardPO() {
  const { user } = useAuth();
  const [forwarding, setForwarding] = useState<string | null>(null);

  const { data: complaintsData, refetch } = useFetch<Array<{
    id: string; title: string; status: string; priority: string;
    category: string; location: string | null; createdAt: string;
    submittedBy: string; departmentName: string | null;
  }>>("/api/complaints");

  const { data: deptData } = useFetch<Array<{ id: string; name: string }>>("/api/departments");
  const { data: notifData } = useFetch<Array<{ id: string; title: string; readAt: string | null }>>(`/api/notifications?userId=${user?.id ?? ""}`);

  const complaints = complaintsData ?? [];
  const departments = deptData ?? [];
  const unreadNotifs = (notifData ?? []).filter(n => !n.readAt).length;

  const stats = useMemo(() => ({
    total: complaints.length,
    pending: complaints.filter(c => c.status === "submitted").length,
    inProgress: complaints.filter(c => c.status === "in_progress").length,
    resolved: complaints.filter(c => c.status === "resolved").length,
    urgent: complaints.filter(c => c.priority === "urgent" || c.priority === "high").length,
  }), [complaints]);

  const newComplaints = complaints.filter(c => c.status === "submitted").slice(0, 6);

  const handleForward = async (complaintId: string, departmentId: string) => {
    setForwarding(complaintId);
    try {
      await fetch(`/api/complaints/${complaintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "assigned", departmentId }),
      });
      refetch();
    } finally {
      setForwarding(null);
    }
  };

  const priorityColor = (p: string) => {
    if (p === "urgent") return "bg-red-500/20 text-red-600";
    if (p === "high") return "bg-orange-500/20 text-orange-600";
    if (p === "medium") return "bg-amber-500/20 text-amber-600";
    return "bg-gray-500/20 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-5 w-5" />
                  <span className="text-sm font-medium opacity-80">Post Office / Ward Officer</span>
                </div>
                <h1 className="text-3xl font-bold">Ward Dashboard</h1>
                <p className="text-white/80 mt-1">Receive, review and forward ward-level complaints</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => refetch()} variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 gap-1">
                  <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
                {unreadNotifs > 0 && (
                  <Button asChild variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 gap-1">
                    <Link href="/notifications">
                      <Bell className="h-4 w-4" /> {unreadNotifs} New
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
          {[
            { label: "Total", value: stats.total, icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-500/10" },
            { label: "New / Pending", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10" },
            { label: "In Progress", value: stats.inProgress, icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-500/10" },
            { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10" },
            { label: "Urgent / High", value: stats.urgent, icon: AlertCircle, color: "text-red-600", bg: "bg-red-500/10" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="border-0 shadow-md bg-white/80 dark:bg-gray-900/80 text-center">
                  <CardContent className="pt-4 pb-4">
                    <div className={`p-2 rounded-xl ${s.bg} w-fit mx-auto mb-2`}>
                      <Icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* New Complaints — Forward to Department */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Forward className="h-5 w-5 text-orange-500" /> New Complaints — Forward to Department
                </CardTitle>
                <CardDescription>Review and route incoming complaints to the right department</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/complaints">All <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </CardHeader>
            <CardContent>
              {newComplaints.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-muted-foreground gap-2">
                  <CheckCircle2 className="h-10 w-10 opacity-20" />
                  <p className="text-sm">No new complaints pending</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {newComplaints.map((c) => (
                    <div key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-border/50 p-4 hover:bg-muted/20 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{c.title}</p>
                          <Badge className={`text-xs ${priorityColor(c.priority)}`}>{c.priority}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span className="font-mono">#{c.id}</span>
                          <span>{c.category}</span>
                          {c.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.location.slice(0, 30)}</span>}
                          <span>{new Date(c.createdAt).toLocaleDateString("en-IN")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          className="text-xs border border-input rounded-lg px-2 py-1.5 bg-background"
                          defaultValue=""
                          onChange={(e) => { if (e.target.value) handleForward(c.id, e.target.value); }}
                          disabled={forwarding === c.id}
                        >
                          <option value="" disabled>Forward to dept...</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                        {forwarding === c.id && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/complaints/${c.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* All Complaints Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">All Ward Complaints</CardTitle>
                <CardDescription>Complete complaint history</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/complaints">Manage All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {complaints.slice(0, 8).map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2.5 hover:bg-muted/20 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">#{c.id} · {c.category}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <Badge className={`text-xs ${priorityColor(c.priority)}`}>{c.priority}</Badge>
                      <Badge className={`text-xs ${c.status === "resolved" ? "bg-emerald-500/20 text-emerald-600" : c.status === "submitted" ? "bg-blue-500/20 text-blue-600" : "bg-amber-500/20 text-amber-600"}`}>
                        {c.status.replace(/_/g, " ")}
                      </Badge>
                      <Button size="sm" variant="ghost" asChild className="h-7 px-2">
                        <Link href={`/complaints/${c.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
