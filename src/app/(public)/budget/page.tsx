"use client";

import { useFetch } from "@/hooks/use-fetch";
import { motion } from "framer-motion";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  IndianRupee, TrendingUp, TrendingDown, BarChart3, PieChart,
  Download, ChevronRight, Building2, Droplets, Zap, Trash2,
  Trees, Shield, BookOpen, Info,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, Legend,
} from "recharts";

const BUDGET_DATA = {
  totalBudget: 485000000,
  utilized: 312000000,
  year: "2025-26",
  departments: [
    { name: "Roads & Infrastructure", allocated: 120000000, spent: 89000000, icon: Building2, color: "#3b82f6" },
    { name: "Water Supply", allocated: 85000000, spent: 71000000, icon: Droplets, color: "#06b6d4" },
    { name: "Sanitation", allocated: 75000000, spent: 58000000, icon: Trash2, color: "#10b981" },
    { name: "Street Lighting", allocated: 45000000, spent: 38000000, icon: Zap, color: "#f59e0b" },
    { name: "Parks & Gardens", allocated: 35000000, spent: 22000000, icon: Trees, color: "#22c55e" },
    { name: "Public Safety", allocated: 55000000, spent: 19000000, icon: Shield, color: "#8b5cf6" },
    { name: "Education", allocated: 40000000, spent: 28000000, icon: BookOpen, color: "#ec4899" },
    { name: "Administration", allocated: 30000000, spent: 7000000, icon: Building2, color: "#6b7280" },
  ],
  quarterly: [
    { quarter: "Q1 Apr-Jun", allocated: 121250000, spent: 98000000 },
    { quarter: "Q2 Jul-Sep", allocated: 121250000, spent: 112000000 },
    { quarter: "Q3 Oct-Dec", allocated: 121250000, spent: 89000000 },
    { quarter: "Q4 Jan-Mar", allocated: 121250000, spent: 13000000 },
  ],
  recentTransactions: [
    { id: "TXN001", desc: "Road repair - Ward 12", dept: "Roads", amount: 2850000, date: "2026-03-15", status: "paid" },
    { id: "TXN002", desc: "Water pipeline replacement", dept: "Water", amount: 5200000, date: "2026-03-12", status: "paid" },
    { id: "TXN003", desc: "Street light installation", dept: "Lighting", amount: 1800000, date: "2026-03-10", status: "paid" },
    { id: "TXN004", desc: "Park development - Zone 3", dept: "Parks", amount: 3400000, date: "2026-03-08", status: "pending" },
    { id: "TXN005", desc: "Drainage upgrade - Block B", dept: "Sanitation", amount: 4100000, date: "2026-03-05", status: "paid" },
    { id: "TXN006", desc: "CCTV installation", dept: "Safety", amount: 2200000, date: "2026-03-01", status: "pending" },
  ],
};

const fmt = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

export default function BudgetPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "departments" | "transactions">("overview");
  const utilization = Math.round((BUDGET_DATA.utilized / BUDGET_DATA.totalBudget) * 100);
  const remaining = BUDGET_DATA.totalBudget - BUDGET_DATA.utilized;

  const pieData = BUDGET_DATA.departments.map(d => ({ name: d.name.split(" ")[0], value: d.allocated, color: d.color }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a3a6b] text-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <IndianRupee className="h-8 w-8 text-yellow-300" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Municipal Budget {BUDGET_DATA.year}</h1>
                <p className="text-white/70 text-sm mt-0.5">Public expenditure transparency dashboard</p>
              </div>
            </div>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2 w-fit">
              <Download className="h-4 w-4" /> Download Report
            </Button>
          </div>

          {/* Top KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: "Total Budget", value: fmt(BUDGET_DATA.totalBudget), icon: BarChart3, color: "text-yellow-300" },
              { label: "Utilized", value: fmt(BUDGET_DATA.utilized), icon: TrendingUp, color: "text-emerald-300" },
              { label: "Remaining", value: fmt(remaining), icon: TrendingDown, color: "text-blue-300" },
              { label: "Utilization", value: `${utilization}%`, icon: PieChart, color: "text-violet-300" },
            ].map((k, i) => {
              const Icon = k.icon;
              return (
                <motion.div key={k.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-4 w-4 ${k.color}`} />
                    <span className="text-xs text-white/60 font-medium">{k.label}</span>
                  </div>
                  <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">

        {/* Overall Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border-2 border-gray-100 shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Overall Budget Utilization</h2>
              <p className="text-sm text-gray-500">FY {BUDGET_DATA.year}</p>
            </div>
            <Badge className={`text-sm font-bold px-3 py-1 ${utilization >= 80 ? "bg-emerald-100 text-emerald-700" : utilization >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
              {utilization}% Used
            </Badge>
          </div>
          <Progress value={utilization} className="h-4 rounded-full" />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>₹0</span>
            <span className="font-semibold text-[#1a3a6b]">{fmt(BUDGET_DATA.utilized)} spent</span>
            <span>{fmt(BUDGET_DATA.totalBudget)}</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {(["overview", "departments", "transactions"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-semibold capitalize border-b-2 transition-all ${
                activeTab === tab ? "border-[#1a3a6b] text-[#1a3a6b]" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Quarterly Bar Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border-2 border-gray-100 shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quarterly Expenditure</h3>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={BUDGET_DATA.quarterly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={v => `₹${(v / 10000000).toFixed(0)}Cr`} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Bar dataKey="allocated" fill="#e0e7ff" radius={[4, 4, 0, 0]} name="Allocated" />
                    <Bar dataKey="spent" fill="#1a3a6b" radius={[4, 4, 0, 0]} name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Pie Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border-2 border-gray-100 shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4">Budget by Department</h3>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmt(v)} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === "departments" && (
          <div className="grid gap-4 md:grid-cols-2">
            {BUDGET_DATA.departments.map((dept, i) => {
              const Icon = dept.icon;
              const pct = Math.round((dept.spent / dept.allocated) * 100);
              return (
                <motion.div key={dept.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border-2 border-gray-100 shadow-md p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl" style={{ backgroundColor: dept.color + "20" }}>
                      <Icon className="h-5 w-5" style={{ color: dept.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">{dept.name}</p>
                      <p className="text-xs text-gray-500">Allocated: {fmt(dept.allocated)}</p>
                    </div>
                    <Badge className="text-xs font-bold" style={{ backgroundColor: dept.color + "20", color: dept.color }}>
                      {pct}%
                    </Badge>
                  </div>
                  <Progress value={pct} className="h-2.5 rounded-full" />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Spent: <span className="font-semibold text-gray-700">{fmt(dept.spent)}</span></span>
                    <span>Remaining: <span className="font-semibold text-gray-700">{fmt(dept.allocated - dept.spent)}</span></span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Recent Transactions</h3>
              <Badge variant="outline">{BUDGET_DATA.recentTransactions.length} records</Badge>
            </div>
            <div className="divide-y divide-gray-50">
              {BUDGET_DATA.recentTransactions.map((txn, i) => (
                <motion.div key={txn.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="p-2 bg-[#1a3a6b]/10 rounded-lg shrink-0">
                    <IndianRupee className="h-4 w-4 text-[#1a3a6b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{txn.desc}</p>
                    <p className="text-xs text-gray-500">{txn.id} · {txn.dept} · {txn.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900">{fmt(txn.amount)}</p>
                    <Badge className={`text-xs ${txn.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {txn.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-3 rounded-2xl bg-blue-50 border border-blue-200 p-4">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            This budget data is published for public transparency as per RTI Act 2005. All figures are in Indian Rupees.
            For detailed audit reports, file an RTI application.
          </p>
        </div>
      </div>
    </div>
  );
}
