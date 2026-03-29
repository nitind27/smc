"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageSquareWarning, FileText, Bell, ArrowUpRight, Plus,
  CheckCircle2, Clock, TrendingUp, Megaphone, Search, MapPin,
} from "lucide-react";
import Link from "next/link";
import { useFetch } from "@/hooks/use-fetch";
import { useAuth } from "@/providers/auth-provider";
import { motion } from "framer-motion";

export function DashboardPublic() {
  const { user } = useAuth();

  const { data: stats } = useFetch<{
    myComplaints: number;
    resolvedComplaints: number;
    pendingComplaints: number;
  }>(`/api/dashboard/stats?role=public&userId=${user?.id ?? ""}`);

  const { data: complaintsData } = useFetch<Array<{
    id: string; title: string; status: string; priority: string; createdAt: string; category: string; submittedBy: string;
  }>>("/api/complaints");

  const { data: noticesData } = useFetch<Array<{
    id: string; title: string; type: string; publishedAt: string;
  }>>("/api/notices");

  const { data: publicStats } = useFetch<{
    totalComplaints: number;
    resolvedComplaints: number;
    activeProjects: number;
  }>("/api/public/stats");

  const myComplaints = (complaintsData ?? []).filter(c => c.submittedBy === user?.id).slice(0, 5);
  const recentNotices = (noticesData ?? []).slice(0, 3);

  const statusColor = (s: string) => {
    if (s === "resolved") return "bg-emerald-500/20 text-emerald-600";
    if (s === "in_progress") return "bg-blue-500/20 text-blue-600";
    if (s === "assigned") return "bg-violet-500/20 text-violet-600";
    return "bg-amber-500/20 text-amber-600";
  };

  const statusLabel = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* Welcome Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/70 p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="relative">
              <h1 className="text-3xl font-bold mb-2">
                Namaste, {user?.name?.split(" ")[0] ?? "Citizen"} 🙏
              </h1>
              <p className="text-white/80 mb-6">Welcome to SMC Citizen Portal. How can we help you today?</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg">
                  <Link href="/complaints/submit">
                    <Plus className="h-4 w-4 mr-2" /> Submit Complaint
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white/50 text-white hover:bg-white/10">
                  <Link href="/track">
                    <Search className="h-4 w-4 mr-2" /> Track Complaint
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* My Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {[
            { label: "My Complaints", value: stats?.myComplaints ?? 0, icon: MessageSquareWarning, color: "from-blue-500 to-cyan-600", bg: "bg-blue-500/10" },
            { label: "Resolved", value: stats?.resolvedComplaints ?? 0, icon: CheckCircle2, color: "from-emerald-500 to-green-600", bg: "bg-emerald-500/10" },
            { label: "Pending", value: stats?.pendingComplaints ?? 0, icon: Clock, color: "from-amber-500 to-orange-600", bg: "bg-amber-500/10" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold">{s.value}</p>
                        <p className="text-sm text-muted-foreground">{s.label}</p>
                      </div>
                      <div className={`p-3 rounded-xl ${s.bg}`}>
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Public Stats Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-md bg-gradient-to-r from-emerald-500/5 via-green-500/10 to-emerald-500/5">
            <CardContent className="pt-5 pb-5">
              <p className="text-sm font-semibold text-center text-muted-foreground mb-4">SMC Performance Overview</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{publicStats?.totalComplaints ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Total Complaints</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{publicStats?.resolvedComplaints ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{publicStats?.activeProjects ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Active Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* My Complaints */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">My Complaints</CardTitle>
                  <CardDescription>Track your submitted issues</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/complaints">View all <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {myComplaints.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-muted-foreground gap-3">
                    <MessageSquareWarning className="h-12 w-12 opacity-20" />
                    <p className="text-sm">No complaints submitted yet</p>
                    <Button size="sm" asChild>
                      <Link href="/complaints/submit"><Plus className="h-4 w-4 mr-1" /> Submit First Complaint</Link>
                    </Button>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {myComplaints.map((c) => (
                      <li key={c.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2.5 hover:bg-muted/30 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{c.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground font-mono">#{c.id.slice(0, 8)}</span>
                            <span className="text-xs text-muted-foreground">{c.category}</span>
                          </div>
                        </div>
                        <Badge className={`text-xs ml-2 shrink-0 ${statusColor(c.status)}`}>
                          {statusLabel(c.status)}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Notices */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-amber-500" /> Latest Notices
                  </CardTitle>
                  <CardDescription>Official announcements</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/notices">All notices <ArrowUpRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentNotices.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
                    <Megaphone className="h-10 w-10 opacity-20" />
                    <p className="text-sm">No notices published yet</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {recentNotices.map((n) => (
                      <li key={n.id} className="flex items-start gap-3 rounded-lg border border-border/50 px-3 py-2.5 hover:bg-muted/30 transition-colors">
                        <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{n.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(n.publishedAt).toLocaleDateString("en-IN")} · {n.type}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                <CardDescription>Common citizen services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Submit Complaint", icon: MessageSquareWarning, href: "/complaints/submit", color: "from-blue-500 to-cyan-600" },
                    { label: "Track Status", icon: Search, href: "/track", color: "from-emerald-500 to-green-600" },
                    { label: "View Notices", icon: Megaphone, href: "/notices", color: "from-amber-500 to-orange-600" },
                    { label: "Public Portal", icon: MapPin, href: "/", color: "from-violet-500 to-purple-600" },
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
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
