"use client";

import { useFetch } from "@/hooks/use-fetch";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Building2, Activity, LayoutDashboard } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { PageHero } from "@/components/public/PageHero";
import { useLanguage } from "@/providers/language-provider";

export default function TransparencyPage() {
  const { t, lang } = useLanguage();

  const { data: stats } = useFetch<{
    totalComplaints: number;
    completedWorks: number;
    pendingIssues: number;
    resolutionRate: number;
  }>("/api/public/stats");
  const { data: departments } = useFetch<Array<{ id: string; name: string }>>("/api/departments");
  const { data: complaints } = useFetch<Array<{ id: string; title: string; status: string; category: string; createdAt: string }>>("/api/complaints");

  const recent = (complaints ?? []).slice(0, 10);
  const byCategory = (complaints ?? []).reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] ?? 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(byCategory).map(([name, count]) => ({ name, count }));
  if (chartData.length === 0 && (departments ?? []).length > 0) {
    chartData.push(...(departments ?? []).map((d) => ({ name: d.name, count: 0 })));
  }

  const statCards = [
    { label: t("transparency.stat.total"), value: stats?.totalComplaints ?? 0, icon: BarChart3, gradient: "from-blue-500 to-blue-400" },
    { label: t("transparency.stat.completed"), value: stats?.completedWorks ?? 0, icon: Activity, gradient: "from-emerald-500 to-emerald-400" },
    { label: t("transparency.stat.pending"), value: stats?.pendingIssues ?? 0, icon: Building2, gradient: "from-amber-500 to-amber-400" },
    { label: t("transparency.stat.rate"), value: `${stats?.resolutionRate ?? 0}%`, icon: Activity, gradient: "from-violet-500 to-violet-400" },
  ];

  const statusLabel: Record<string, string> = lang === "gu" ? {
    submitted: "સબમિટ", assigned: "સોંપાયેલ", in_progress: "પ્રક્રિયામાં",
    resolved: "ઉકેલાયેલ", closed: "બંધ", rejected: "નકારાયેલ",
  } : {
    submitted: "Submitted", assigned: "Assigned", in_progress: "In Progress",
    resolved: "Resolved", closed: "Closed", rejected: "Rejected",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHero title={t("transparency.title")} description={t("transparency.hero.desc")} icon={LayoutDashboard} />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 mb-10">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group">
              <Card className="overflow-hidden rounded-2xl border border-border/50 shadow-md transition-all hover:shadow-xl hover:-translate-y-0.5">
                <div className={`h-1 w-full bg-gradient-to-r ${s.gradient}`} />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">
                    {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="overflow-hidden rounded-2xl border border-border/50 shadow-lg">
            <div className="h-1 w-full bg-gradient-to-r from-primary to-cyan-500" />
            <CardHeader>
              <CardTitle>{t("transparency.chart.title")}</CardTitle>
              <CardDescription>{t("transparency.chart.desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    {t("transparency.chart.empty")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="overflow-hidden rounded-2xl border border-border/50 shadow-lg">
            <div className="h-1 w-full bg-gradient-to-r from-primary to-cyan-500" />
            <CardHeader>
              <CardTitle>{t("transparency.recent.title")}</CardTitle>
              <CardDescription>{t("transparency.recent.desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 max-h-64 overflow-y-auto">
                {recent.length === 0 ? (
                  <li className="text-sm text-muted-foreground">{t("transparency.recent.empty")}</li>
                ) : (
                  recent.map((c) => (
                    <li key={c.id} className="flex justify-between gap-2 border-b border-border/50 pb-3 last:border-0 text-sm">
                      <span className="truncate font-medium">{c.title}</span>
                      <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
                        {statusLabel[c.status] ?? c.status.replace("_", " ")}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
