"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CreditCard, Plus, Loader2, Search, X, IndianRupee,
  CheckCircle2, Clock, AlertCircle, FileText, RefreshCw,
} from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { useAuth } from "@/providers/auth-provider";
import { motion } from "framer-motion";

type Payment = {
  id: string; billId: string; billTitle: string; billAmount: number;
  departmentName: string | null; submitterName: string | null;
  amount: number; status: string; reference: string | null; createdAt: string;
};
type Bill = { id: string; title: string; amount: number; status: string; departmentName: string | null; };

const STATUS_CONF: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pending",   color: "text-amber-700",   bg: "bg-amber-100" },
  completed: { label: "Completed", color: "text-emerald-700", bg: "bg-emerald-100" },
  failed:    { label: "Failed",    color: "text-red-700",     bg: "bg-red-100" },
};
const sc = (s: string) => STATUS_CONF[s] ?? STATUS_CONF.pending;

function fmt(n: number) { return `₹${Number(n).toLocaleString("en-IN")}`; }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }

export default function PaymentsPage() {
  const { user } = useAuth();
  const canRecord = ["admin", "department_head"].includes(user?.role ?? "");

  const { data: paymentsData, isLoading, error, refetch } = useFetch<Payment[]>("/api/payments");
  const { data: billsData } = useFetch<Bill[]>("/api/bills?status=approved");
  const payments = paymentsData ?? [];
  const approvedBills = (billsData ?? []).filter(b => b.status === "approved");

  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [billId, setBillId] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const filtered = useMemo(() => {
    if (!search) return payments;
    const q = search.toLowerCase();
    return payments.filter(p =>
      p.billTitle.toLowerCase().includes(q) ||
      (p.reference ?? "").toLowerCase().includes(q) ||
      (p.departmentName ?? "").toLowerCase().includes(q)
    );
  }, [payments, search]);

  const stats = useMemo(() => ({
    total: payments.length,
    completed: payments.filter(p => p.status === "completed").length,
    pending: payments.filter(p => p.status === "pending").length,
    totalAmount: payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0),
  }), [payments]);

  const selectedBill = approvedBills.find(b => b.id === billId);

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billId) { setFormError("Select a bill"); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { setFormError("Enter a valid amount"); return; }
    setFormError(""); setSubmitting(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billId, amount: amt, reference: reference.trim() || undefined }),
      });
      if (!res.ok) { const d = await res.json(); setFormError(d.error ?? "Failed"); return; }
      refetch(); setAddOpen(false); setBillId(""); setAmount(""); setReference("");
    } catch { setFormError("Network error"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" /> Payments
          </h1>
          <p className="text-muted-foreground text-sm">Payment history for approved bills</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          {canRecord && (
            <Button onClick={() => setAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Total Payments", value: stats.total,     icon: CreditCard,   color: "text-blue-600",    bg: "bg-blue-50" },
          { label: "Completed",      value: stats.completed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pending",        value: stats.pending,   icon: Clock,        color: "text-amber-600",   bg: "bg-amber-50" },
          { label: "Total Paid",     value: fmt(stats.totalAmount), icon: IndianRupee, color: "text-violet-600", bg: "bg-violet-50" },
        ].map((s, i) => { const Icon = s.icon; return (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-0 shadow-md">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${s.bg}`}><Icon className={`h-5 w-5 ${s.color}`} /></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ); })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by bill, reference, department..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="pl-9 border-2 hover:border-primary/50 focus:border-primary h-11" />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="h-4 w-4" /></button>}
      </div>

      {/* Table */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Payment History</CardTitle>
          <CardDescription>{filtered.length} payment{filtered.length !== 1 ? "s" : ""}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 mb-4"><AlertCircle className="h-4 w-4 text-destructive" /><p className="text-sm text-destructive">Failed to load payments.</p></div>}
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
              <CreditCard className="h-12 w-12 opacity-20" />
              <p className="font-medium">No payments found</p>
              <p className="text-sm">Payments are recorded when approved bills are paid</p>
              {canRecord && approvedBills.length > 0 && (
                <Button size="sm" onClick={() => setAddOpen(true)} className="gap-2 mt-2"><Plus className="h-4 w-4" />Record First Payment</Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold">Bill</TableHead>
                    <TableHead className="font-semibold">Department</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Reference</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p, i) => {
                    const s = sc(p.status);
                    return (
                      <motion.tr key={p.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                        className="hover:bg-muted/20 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/5 rounded-lg"><FileText className="h-3.5 w-3.5 text-primary" /></div>
                            <div>
                              <p className="font-medium text-sm">{p.billTitle}</p>
                              <p className="text-xs text-muted-foreground font-mono">{p.billId.slice(0, 8)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.departmentName ?? "—"}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold text-emerald-600">{fmt(p.amount)}</p>
                            {p.billAmount !== p.amount && <p className="text-xs text-muted-foreground">Bill: {fmt(p.billAmount)}</p>}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{p.reference ?? "—"}</TableCell>
                        <TableCell>
                          <Badge className={`${s.bg} ${s.color} border-0 text-xs`}>{s.label}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{fmtDate(p.createdAt)}</TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setFormError(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" />Record Payment</DialogTitle></DialogHeader>
          <form onSubmit={handleRecord} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Approved Bill *</Label>
              <Select value={billId} onValueChange={v => { setBillId(v); const b = approvedBills.find(x => x.id === v); if (b) setAmount(String(b.amount)); }}>
                <SelectTrigger className="border-2"><SelectValue placeholder="Select approved bill" /></SelectTrigger>
                <SelectContent>
                  {approvedBills.length === 0
                    ? <SelectItem value="none" disabled>No approved bills available</SelectItem>
                    : approvedBills.map(b => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.title} — {fmt(b.amount)}
                        </SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
              {selectedBill && (
                <p className="text-xs text-muted-foreground">
                  Department: {selectedBill.departmentName ?? "—"} · Bill amount: {fmt(selectedBill.amount)}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Payment Amount (₹) *</Label>
              <Input type="number" min="1" step="0.01" placeholder="Enter amount"
                value={amount} onChange={e => setAmount(e.target.value)} className="border-2" />
            </div>
            <div className="space-y-1.5">
              <Label>Reference / Transaction ID</Label>
              <Input placeholder="e.g. TXN123456789" value={reference}
                onChange={e => setReference(e.target.value)} className="border-2" />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Record Payment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
