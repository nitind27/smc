"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { useFetch } from "@/hooks/use-fetch";
import { 
  Loader2, 
  Plus, 
  IndianRupee, 
  Users, 
  TrendingUp, 
  Calendar,
  Download,
  Filter,
  X,
  UserCircle,
  Briefcase,
  Clock,
  ChevronRight,
  Wallet,
  Award,
  BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SalaryRecord = {
  id: string;
  workerId: string;
  workerName: string;
  workerRole: string;
  amount: number;
  month: string;
  note: string | null;
  paidAt: string;
};

type Worker = {
  id: string;
  name: string;
  role: string;
  departmentName: string | null;
};

function formatMonth(m: string) {
  const [y, mo] = m.split("-");
  return new Date(Number(y), Number(mo) - 1).toLocaleString("default", { month: "long", year: "numeric" });
}

function roleBadge(role: string) {
  const map: Record<string, string> = {
    admin: "bg-gradient-to-r from-red-500 to-red-600 text-white",
    department_head: "bg-gradient-to-r from-violet-500 to-purple-600 text-white",
    staff: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
    auditor: "bg-gradient-to-r from-amber-500 to-orange-600 text-white",
  };
  return map[role] ?? "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
}

function getRoleIcon(role: string) {
  const icons: Record<string, any> = {
    admin: Award,
    department_head: Briefcase,
    staff: UserCircle,
    auditor: TrendingUp,
  };
  return icons[role] || UserCircle;
}

export default function SalaryPage() {
  const { data: salaries, isLoading, error, refetch } = useFetch<SalaryRecord[]>("/api/salary");
  const { data: workersData } = useFetch<Worker[]>("/api/staff");

  const records = salaries ?? [];
  const workers = workersData ?? [];

  // Filters
  const [filterWorker, setFilterWorker] = React.useState("all");
  const [filterMonth, setFilterMonth] = React.useState("");
  const [showFilters, setShowFilters] = React.useState(false);

  const filtered = records.filter((r) => {
    if (filterWorker !== "all" && r.workerId !== filterWorker) return false;
    if (filterMonth && r.month !== filterMonth) return false;
    return true;
  });

  // Stats
  const totalPaid = filtered.reduce((s, r) => s + r.amount, 0);
  const uniqueWorkers = new Set(filtered.map((r) => r.workerId)).size;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthTotal = records
    .filter((r) => r.month === currentMonth)
    .reduce((s, r) => s + r.amount, 0);
  
  const averageSalary = uniqueWorkers > 0 ? totalPaid / uniqueWorkers : 0;
  const highestSalary = filtered.length > 0 ? Math.max(...filtered.map(r => r.amount)) : 0;

  // Add Salary dialog
  const [open, setOpen] = React.useState(false);
  const [selWorker, setSelWorker] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [month, setMonth] = React.useState(currentMonth);
  const [note, setNote] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");

  const resetForm = () => {
    setSelWorker(""); setAmount(""); setMonth(currentMonth); setNote(""); setErr("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!selWorker) { setErr("Please select a worker."); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setErr("Enter a valid amount."); return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/salary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId: selWorker,
          amount: Number(amount),
          month,
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Failed to add salary"); return; }
      refetch();
      setOpen(false);
      resetForm();
    } catch { setErr("Network error."); }
    finally { setBusy(false); }
  };

  const handleExport = () => {
    const csv = [
      ["Worker Name", "Role", "Month", "Amount", "Note", "Paid On"],
      ...filtered.map(r => [
        r.workerName,
        r.workerRole,
        formatMonth(r.month),
        r.amount.toString(),
        r.note || "",
        new Date(r.paidAt).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `salary_records_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statsCards = [
    {
      label: "Total Disbursed",
      value: `₹${totalPaid.toLocaleString("en-IN")}`,
      icon: Wallet,
      gradient: "from-emerald-500 to-green-600",
      bgGradient: "from-emerald-500/10 to-green-600/5",
      iconBg: "bg-emerald-500/20",
      description: "Total salary paid"
    },
    {
      label: "Workers Paid",
      value: uniqueWorkers.toString(),
      icon: Users,
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-500/10 to-cyan-600/5",
      iconBg: "bg-blue-500/20",
      description: "Unique workers this period"
    },
    {
      label: "This Month",
      value: `₹${thisMonthTotal.toLocaleString("en-IN")}`,
      icon: Calendar,
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-500/10 to-purple-600/5",
      iconBg: "bg-violet-500/20",
      description: "Current month total"
    },
    {
      label: "Average Salary",
      value: `₹${Math.round(averageSalary).toLocaleString("en-IN")}`,
      icon: TrendingUp,
      gradient: "from-orange-500 to-amber-600",
      bgGradient: "from-orange-500/10 to-amber-600/5",
      iconBg: "bg-orange-500/20",
      description: "Per worker average"
    }
  ];

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
                  <IndianRupee className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    Salary Management
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Track and manage worker salary payments with ease
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleExport}
                className="gap-2 border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button 
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => { resetForm(); setOpen(true); }}
              >
                <Plus className="h-4 w-4" />
                Add Salary
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative overflow-hidden bg-gradient-to-br ${card.bgGradient} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full blur-2xl`} />
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-xl ${card.iconBg} backdrop-blur-sm`}>
                        <Icon className={`h-6 w-6 bg-gradient-to-br ${card.gradient} bg-clip-text text-transparent`} />
                      </div>
                      <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                        {card.description}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-bold tracking-tight">{card.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Filters</h3>
                </div>
                {(filterWorker !== "all" || filterMonth) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setFilterWorker("all"); setFilterMonth(""); }}
                    className="text-muted-foreground hover:text-destructive gap-1"
                  >
                    <X className="h-3 w-3" />
                    Clear all
                  </Button>
                )}
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Filter by Worker</Label>
                  <Select value={filterWorker} onValueChange={setFilterWorker}>
                    <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-2 hover:border-primary/50 transition-colors">
                      <SelectValue placeholder="All workers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Workers</SelectItem>
                      {workers.map((w) => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Filter by Month</Label>
                  <Input
                    type="month"
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="h-11 bg-white dark:bg-gray-800 border-2 hover:border-primary/50 transition-colors"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Salary Records</CardTitle>
                  <CardDescription className="mt-1">
                    {filtered.length} record{filtered.length !== 1 ? "s" : ""} found
                  </CardDescription>
                </div>
                {filtered.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <BarChart3 className="h-3 w-3" />
                    Total: ₹{totalPaid.toLocaleString("en-IN")}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-destructive">Failed to load salary records. Please try again.</p>
                </div>
              )}
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading salary records...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                  <div className="p-4 bg-muted/30 rounded-full">
                    <IndianRupee className="h-12 w-12 opacity-30" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium">No salary records found</p>
                    <p className="text-sm mt-1">Get started by adding your first salary record</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2 mt-2"
                    onClick={() => { resetForm(); setOpen(true); }}
                  >
                    <Plus className="h-4 w-4" /> Add First Salary
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="font-semibold">Worker</TableHead>
                        <TableHead className="font-semibold">Role</TableHead>
                        <TableHead className="font-semibold">Month</TableHead>
                        <TableHead className="text-right font-semibold">Amount</TableHead>
                        <TableHead className="font-semibold">Note</TableHead>
                        <TableHead className="font-semibold">Paid On</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filtered.map((r, index) => {
                          const RoleIcon = getRoleIcon(r.workerRole);
                          return (
                            <motion.tr
                              key={r.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="group hover:bg-muted/20 transition-colors duration-200"
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                                    <UserCircle className="h-4 w-4 text-primary" />
                                  </div>
                                  <span>{r.workerName}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`text-xs capitalize ${roleBadge(r.workerRole)} shadow-sm`}
                                >
                                  <RoleIcon className="h-3 w-3 mr-1" />
                                  {r.workerRole.replace(/_/g, " ")}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                  {formatMonth(r.month)}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="font-bold text-green-600 dark:text-green-400">
                                  ₹{r.amount.toLocaleString("en-IN")}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-muted-foreground text-sm">
                                  {r.note ?? "—"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  {new Date(r.paidAt).toLocaleDateString("en-IN", {
                                    day: "2-digit", month: "short", year: "numeric",
                                  })}
                                </div>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Add Salary Dialog */}
        <Dialog open={open} onOpenChange={(o) => { if (!o) { setOpen(false); resetForm(); } }}>
          <DialogContent className="sm:max-w-md border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Add Salary</DialogTitle>
              <DialogDescription>
                Record a salary payment for a worker. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-5">
              {err && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-sm text-destructive">{err}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium">Worker <span className="text-destructive">*</span></Label>
                <Select value={selWorker} onValueChange={setSelWorker}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select worker" />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.length === 0 ? (
                      <SelectItem value="__none__" disabled>No workers found</SelectItem>
                    ) : (
                      workers.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          <div className="flex items-center gap-2">
                            <UserCircle className="h-4 w-4" />
                            <span>{w.name}</span>
                            {w.departmentName && (
                              <span className="text-xs text-muted-foreground">({w.departmentName})</span>
                            )}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sal-amount" className="text-sm font-medium">
                    Amount (₹) <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="sal-amount"
                      type="number"
                      min={1}
                      step="0.01"
                      placeholder="e.g. 25000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-9 h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sal-month" className="text-sm font-medium">
                    Month <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sal-month"
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sal-note" className="text-sm font-medium">
                  Note <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  id="sal-note"
                  placeholder="e.g., March bonus included"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="h-11"
                />
              </div>

              <DialogFooter className="gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => { setOpen(false); resetForm(); }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={busy} 
                  className="gap-2 flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                >
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Add Salary
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}