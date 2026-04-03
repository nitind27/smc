"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileCheck, Search, Loader2, Download, RefreshCw, Eye,
  CheckCircle2, Shield, User, Clock, Activity, X, Copy,
  ChevronLeft, ChevronRight, AlertTriangle, TrendingUp,
  Database, Filter, Calendar, Info,
} from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { motion, AnimatePresence } from "framer-motion";

type AuditLog = {
  id: string; action: string; userId: string | null;
  userEmail: string | null; entityType: string | null;
  entityId: string | null; metadata: unknown; createdAt: string;
};
type AuditResponse = {
  logs: AuditLog[]; total: number; page: number;
  totalPages: number; stats: { totalToday: number; totalWeek: number; totalAll: number };
};

function getSev(action: string): "critical" | "warning" | "success" | "info" {
  const a = action.toUpperCase();
  if (a.includes("DELETE") || a.includes("REJECT") || a.includes("BAN")) return "critical";
  if (a.includes("UPDATE") || a.includes("ASSIGN") || a.includes("FORWARD")) return "warning";
  if (a.includes("RESOLVE") || a.includes("APPROVE") || a.includes("COMPLETE") || a.includes("LOGIN")) return "success";
  return "info";
}
const SEV = {
  critical: { badge: "bg-red-100 text-red-700 border-red-200",       dot: "bg-red-500",     label: "Critical" },
  warning:  { badge: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500",   label: "Modified" },
  success:  { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Success" },
  info:     { badge: "bg-blue-100 text-blue-700 border-blue-200",    dot: "bg-blue-500",    label: "Info" },
};
const ENTITY_COLORS: Record<string, string> = {
  complaint: "bg-orange-100 text-orange-700", bill: "bg-emerald-100 text-emerald-700",
  user: "bg-blue-100 text-blue-700", meeting: "bg-violet-100 text-violet-700",
  project: "bg-cyan-100 text-cyan-700", task: "bg-indigo-100 text-indigo-700",
  notice: "bg-amber-100 text-amber-700", payment: "bg-rose-100 text-rose-700",
};
const ec = (t: string | null) => ENTITY_COLORS[t?.toLowerCase() ?? ""] ?? "bg-gray-100 text-gray-700";

function fmtAction(a: string) {
  const [v, ...r] = a.split(":");
  return { verb: v.trim().replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()), detail: r.join(" · ").trim() };
}
function ago(iso: string) {
  const d = Date.now() - new Date(iso).getTime(), m = Math.floor(d / 60000), h = Math.floor(d / 3600000);
  if (m < 1) return "just now"; if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function exportCSV(logs: AuditLog[]) {
  const rows = logs.map(l => `"${l.id}","${l.action}","${l.userEmail ?? "System"}","${l.entityType ?? ""}","${l.entityId ?? ""}","${l.createdAt}"`);
  const blob = new Blob(["ID,Action,User,Entity,EntityID,Time\n" + rows.join("\n")], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = `audit-${Date.now()}.csv`; a.click();
}

function DetailModal({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  const s = SEV[getSev(log.action)];
  const { verb, detail } = fmtAction(log.action);
  const [copied, setCopied] = useState(false);
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><FileCheck className="h-5 w-5 text-primary" />Audit Log Detail</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className={`rounded-xl border p-4 ${s.badge}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
              <Badge className={`${s.badge} border text-xs font-bold`}>{s.label}</Badge>
            </div>
            <p className="font-bold text-gray-900">{verb}</p>
            {detail && <p className="text-sm text-gray-600 mt-0.5">{detail}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Log ID</p>
              <div className="flex items-center gap-1.5">
                <p className="font-mono text-xs truncate">{log.id.slice(0, 16)}…</p>
                <button onClick={() => { navigator.clipboard.writeText(log.id); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Timestamp</p>
              <p className="text-xs">{new Date(log.createdAt).toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Performed By</p>
              <div className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-muted-foreground" /><p className="text-xs">{log.userEmail ?? log.userId ?? "System"}</p></div>
            </div>
            {log.entityType && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Entity</p>
                <div className="flex items-center gap-1.5">
                  <Badge className={`${ec(log.entityType)} border-0 text-xs capitalize`}>{log.entityType ?? ""}</Badge>
                  {log.entityId && <p className="font-mono text-xs text-muted-foreground">{log.entityId.slice(0, 10)}</p>}
                </div>
              </div>
            )}
          </div>
          {!!log.metadata && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Metadata</p>
              <pre className="bg-muted/50 rounded-xl p-3 text-xs font-mono overflow-auto max-h-40">{String(JSON.stringify(log.metadata, null, 2))}</pre>
            </div>
          )}
          <Button variant="outline" onClick={onClose} className="w-full">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AuditPage() {
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const url = useMemo(() => {
    const p = new URLSearchParams({ page: String(page), limit: "25" });
    if (search) p.set("q", search);
    if (entityType !== "all") p.set("entityType", entityType);
    if (actionFilter !== "all") p.set("action", actionFilter);
    if (dateFrom) p.set("dateFrom", dateFrom);
    if (dateTo) p.set("dateTo", dateTo);
    return `/api/audit?${p}`;
  }, [search, entityType, actionFilter, dateFrom, dateTo, page]);

  const { data, isLoading, error, refetch } = useFetch<AuditResponse>(url);
  const logs = data?.logs ?? [];
  const stats = data?.stats;
  const totalPages = data?.totalPages ?? 1;
  const hasFilters = !!(search || entityType !== "all" || actionFilter !== "all" || dateFrom || dateTo);

  const breakdown = useMemo(() => {
    const c = { critical: 0, warning: 0, success: 0, info: 0 };
    logs.forEach(l => c[getSev(l.action)]++);
    return c;
  }, [logs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#1a3a6b] to-blue-700 rounded-xl shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Audit Trail</h1>
              <p className="text-muted-foreground text-sm">System action logs for compliance monitoring</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5"><RefreshCw className="h-3.5 w-3.5" />Refresh</Button>
            <Button variant="outline" size="sm" onClick={() => exportCSV(logs)} disabled={!logs.length} className="gap-1.5"><Download className="h-3.5 w-3.5" />Export CSV</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {[
            { label: "Total", value: stats?.totalAll ?? 0, icon: Database, color: "text-[#1a3a6b]", bg: "bg-[#1a3a6b]/10" },
            { label: "Today", value: stats?.totalToday ?? 0, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "This Week", value: stats?.totalWeek ?? 0, icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
            { label: "Critical", value: breakdown.critical, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
            { label: "Modified", value: breakdown.warning, icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Success", value: breakdown.success, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Info", value: breakdown.info, icon: Info, color: "text-blue-600", bg: "bg-blue-50" },
          ].map((s, i) => { const Icon = s.icon; return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="border-0 shadow-md text-center">
                <CardContent className="pt-4 pb-3">
                  <div className={`p-2 rounded-xl ${s.bg} w-fit mx-auto mb-2`}><Icon className={`h-4 w-4 ${s.color}`} /></div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ); })}
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md">
          <CardContent className="pt-4 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Filters</span>
                {hasFilters && <Badge className="bg-[#1a3a6b] text-white border-0 text-xs">Active</Badge>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowFilters(f => !f)} className="text-xs text-muted-foreground hover:text-foreground">{showFilters ? "Hide" : "Advanced"}</button>
                {hasFilters && <button onClick={() => { setSearch(""); setEntityType("all"); setActionFilter("all"); setDateFrom(""); setDateTo(""); setPage(1); }} className="text-xs text-destructive hover:underline flex items-center gap-1"><X className="h-3 w-3" />Clear</button>}
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search action, user email, entity ID..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 h-10 border-2 hover:border-[#1a3a6b]/40 focus:border-[#1a3a6b]" />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="h-4 w-4" /></button>}
            </div>
            {showFilters && (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Entity Type</label>
                  <Select value={entityType} onValueChange={v => { setEntityType(v); setPage(1); }}>
                    <SelectTrigger className="h-9 border-2 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Entities</SelectItem>
                      {["complaint","bill","user","meeting","project","task","notice","payment"].map(e => (
                        <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Action Type</label>
                  <Select value={actionFilter} onValueChange={v => { setActionFilter(v); setPage(1); }}>
                    <SelectTrigger className="h-9 border-2 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {["CREATE","UPDATE","DELETE","APPROVE","REJECT","ASSIGN","RESOLVE","LOGIN"].map(a => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">From Date</label>
                  <Input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="h-9 border-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">To Date</label>
                  <Input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="h-9 border-2 text-sm" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-[#1a3a6b]" />Audit Logs
                {data?.total !== undefined && <Badge variant="secondary" className="text-xs">{data.total.toLocaleString()} total</Badge>}
              </CardTitle>
              <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
            </div>
          </CardHeader>
          <CardContent>
            {error && <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 mb-4"><AlertTriangle className="h-4 w-4 text-destructive shrink-0" /><p className="text-sm text-destructive">Failed to load audit logs.</p></div>}
            {isLoading ? (
              <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-12 bg-muted/40 rounded-xl animate-pulse" />)}</div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
                <FileCheck className="h-14 w-14 opacity-20" />
                <p className="text-lg font-medium">No audit logs found</p>
                <p className="text-sm">Perform actions in the system to generate audit logs</p>
                {hasFilters && <Button variant="outline" size="sm" onClick={() => { setSearch(""); setEntityType("all"); setActionFilter("all"); setDateFrom(""); setDateTo(""); }}>Clear Filters</Button>}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold w-[100px]">Severity</TableHead>
                      <TableHead className="font-semibold">Action</TableHead>
                      <TableHead className="font-semibold">Entity</TableHead>
                      <TableHead className="font-semibold">Performed By</TableHead>
                      <TableHead className="font-semibold">Time</TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log, i) => {
                      const s = SEV[getSev(log.action)];
                      const { verb, detail } = fmtAction(log.action);
                      return (
                        <motion.tr key={log.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                          className="group cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setSelected(log)}>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <div className={`h-2 w-2 rounded-full ${s.dot} shrink-0`} />
                              <Badge className={`${s.badge} border text-xs font-semibold`}>{s.label}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-semibold text-sm">{verb}</p>
                            {detail && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{detail}</p>}
                          </TableCell>
                          <TableCell>
                            {log.entityType ? (
                              <div className="flex items-center gap-1.5">
                                <Badge className={`${ec(log.entityType)} border-0 text-xs capitalize`}>{log.entityType}</Badge>
                                {log.entityId && <span className="font-mono text-xs text-muted-foreground">{log.entityId.slice(0, 8)}</span>}
                              </div>
                            ) : <span className="text-muted-foreground text-xs">—</span>}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-sm truncate max-w-[140px]">{log.userEmail ?? log.userId ?? "System"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 shrink-0" />
                              <span className="text-xs whitespace-nowrap">{ago(log.createdAt)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-[#1a3a6b]/10">
                              <Eye className="h-3.5 w-3.5 text-[#1a3a6b]" />
                            </button>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">Showing {((page-1)*25)+1}–{Math.min(page*25, data?.total ?? 0)} of {data?.total ?? 0}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="gap-1"><ChevronLeft className="h-4 w-4" />Prev</Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => { const p = page <= 3 ? i+1 : page-2+i; if (p < 1 || p > totalPages) return null; return (
                    <button key={p} onClick={() => setPage(p)} className={`h-8 w-8 rounded-lg text-xs font-semibold ${p === page ? "bg-[#1a3a6b] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#1a3a6b]/40"}`}>{p}</button>
                  ); })}
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="gap-1">Next<ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* What is Audit Trail */}
        <Card className="border-0 shadow-md bg-[#1a3a6b]/5">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-[#1a3a6b]/10 rounded-xl shrink-0"><Shield className="h-5 w-5 text-[#1a3a6b]" /></div>
              <div className="space-y-2">
                <h3 className="font-bold text-[#1a3a6b]">What is an Audit Trail?</h3>
                <p className="text-sm text-gray-600">An <strong>Audit Trail</strong> is a chronological record of all system activities — who did what, when, and on which record. It is essential for <strong>compliance, accountability, and security</strong> in government systems.</p>
                <div className="grid sm:grid-cols-4 gap-3 mt-3">
                  {[
                    { icon: Shield, title: "Compliance", desc: "Meets RTI & govt audit requirements" },
                    { icon: User, title: "Accountability", desc: "Every action tied to a user" },
                    { icon: Activity, title: "Monitoring", desc: "Detect unauthorized changes" },
                    { icon: FileCheck, title: "Evidence", desc: "Legal proof of system actions" },
                  ].map(item => { const Icon = item.icon; return (
                    <div key={item.title} className="flex items-start gap-2.5 bg-white rounded-xl p-3 border border-[#1a3a6b]/10">
                      <div className="p-1.5 bg-[#1a3a6b]/10 rounded-lg shrink-0"><Icon className="h-4 w-4 text-[#1a3a6b]" /></div>
                      <div><p className="text-xs font-bold text-[#1a3a6b]">{item.title}</p><p className="text-xs text-gray-500">{item.desc}</p></div>
                    </div>
                  ); })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {selected && <DetailModal log={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
