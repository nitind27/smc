"use client";

import { useFetch } from "@/hooks/use-fetch";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase, Search, MapPin, Calendar, IndianRupee,
  CheckCircle2, Clock, AlertCircle, X,
  Building2, Droplets, Zap, Trash2, Trees,
} from "lucide-react";

type Project = {
  id: string;
  name: string;
  status: string;
  progress: number;
  departmentName?: string;
  createdAt: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  active:    { label: "In Progress", color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200",    icon: Clock },
  completed: { label: "Completed",   color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 },
  on_hold:   { label: "On Hold",     color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   icon: AlertCircle },
  cancelled: { label: "Cancelled",   color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200",     icon: X },
};

const DEPT_ICONS: Record<string, React.ElementType> = {
  roads: Building2, water: Droplets, sanitation: Trash2,
  lighting: Zap, parks: Trees,
};

const getDeptIcon = (name?: string): React.ElementType => {
  if (!name) return Building2;
  const lower = name.toLowerCase();
  const key = Object.keys(DEPT_ICONS).find(k => lower.includes(k));
  return key ? DEPT_ICONS[key] : Building2;
};

const MOCK_EXTRA = [
  { ward: "Ward 1-5",   budget: "₹2.4 Cr", startDate: "Jan 2026", endDate: "Jun 2026", contractor: "ABC Infra Pvt Ltd" },
  { ward: "Ward 6-10",  budget: "₹1.8 Cr", startDate: "Feb 2026", endDate: "Aug 2026", contractor: "XYZ Constructions" },
  { ward: "Ward 11-15", budget: "₹3.1 Cr", startDate: "Dec 2025", endDate: "May 2026", contractor: "PQR Engineers" },
  { ward: "Ward 16-20", budget: "₹0.9 Cr", startDate: "Mar 2026", endDate: "Sep 2026", contractor: "LMN Works" },
  { ward: "Ward 21-25", budget: "₹2.2 Cr", startDate: "Nov 2025", endDate: "Apr 2026", contractor: "DEF Builders" },
];

export default function PublicWorksPage() {
  const { data: projectsData, isLoading } = useFetch<Project[]>("/api/projects");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const projects = (projectsData ?? []).map((p, i) => ({
    ...p,
    ...MOCK_EXTRA[i % MOCK_EXTRA.length],
  }));

  const filtered = useMemo(() => projects.filter(p => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.departmentName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  }), [projects, search, statusFilter]);

  const stats = useMemo(() => ({
    total: projects.length,
    active: projects.filter(p => p.status === "active").length,
    completed: projects.filter(p => p.status === "completed").length,
    onHold: projects.filter(p => p.status === "on_hold").length,
  }), [projects]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a3a6b] text-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/10 rounded-xl">
              <Briefcase className="h-8 w-8 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Public Works & Projects</h1>
              <p className="text-white/70 text-sm mt-0.5">Track ongoing and completed municipal development works</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Projects", value: stats.total,     color: "text-yellow-300" },
              { label: "In Progress",    value: stats.active,    color: "text-blue-300" },
              { label: "Completed",      value: stats.completed, color: "text-emerald-300" },
              { label: "On Hold",        value: stats.onHold,    color: "text-amber-300" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-white/10 rounded-2xl p-4 border border-white/10 text-center">
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-white/60 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search projects or departments..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 border-2 border-gray-200 focus:border-[#1a3a6b] h-11 bg-white" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "active", "completed", "on_hold"] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                  statusFilter === s
                    ? "bg-[#1a3a6b] text-white border-[#1a3a6b]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#1a3a6b]/40"
                }`}>
                {s === "all" ? "All" : STATUS_CONFIG[s]?.label ?? s}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 border-4 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-gray-400">
            <Briefcase className="h-16 w-16 opacity-20" />
            <p className="text-lg font-medium">No projects found</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project, i) => {
              const conf = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.active;
              const StatusIcon = conf.icon;
              const DeptIcon = getDeptIcon(project.departmentName);
              const extra = project as typeof project & typeof MOCK_EXTRA[0];
              return (
                <motion.div key={project.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
                    <div className="h-1.5 w-full bg-gradient-to-r from-[#1a3a6b] to-blue-400" />
                    <div className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-[#1a3a6b]/10 rounded-xl">
                            <DeptIcon className="h-5 w-5 text-[#1a3a6b]" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm leading-snug">{project.name}</h3>
                            {project.departmentName && (
                              <p className="text-xs text-gray-500">{project.departmentName}</p>
                            )}
                          </div>
                        </div>
                        <Badge className={`text-xs border ${conf.bg} ${conf.color} ${conf.border} shrink-0`}>
                          <StatusIcon className="h-3 w-3 mr-1" />{conf.label}
                        </Badge>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-500 font-medium">Progress</span>
                          <span className="font-bold text-[#1a3a6b]">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2.5 rounded-full" />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          <span>{extra.ward}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <IndianRupee className="h-3.5 w-3.5 text-gray-400" />
                          <span>{extra.budget}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>{extra.startDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>End: {extra.endDate}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                        <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-600 truncate">{extra.contractor}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
