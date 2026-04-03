"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bell, CheckCheck, Loader2, MessageSquareWarning, Calendar,
  FileText, Info, AlertCircle, UserCheck, Briefcase, Megaphone,
  Search, Filter, RefreshCw, X, Send, Plus,
} from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { useAuth } from "@/providers/auth-provider";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Notif = {
  id: string;
  userId: string;
  title: string;
  body: string | null;
  type: string;
  readAt: string | null;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
  userName?: string;
};

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; border: string; label: string }> = {
  complaint:  { icon: MessageSquareWarning, color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200",   label: "Complaint" },
  meeting:    { icon: Calendar,             color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200", label: "Meeting" },
  bill:       { icon: FileText,             color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200",  label: "Bill" },
  task:       { icon: Briefcase,            color: "text-emerald-700",bg: "bg-emerald-50",border: "border-emerald-200",label: "Task" },
  assignment: { icon: UserCheck,            color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200", label: "Assignment" },
  notice:     { icon: Megaphone,            color: "text-rose-700",   bg: "bg-rose-50",   border: "border-rose-200",   label: "Notice" },
  alert:      { icon: AlertCircle,          color: "text-red-700",    bg: "bg-red-50",    border: "border-red-200",    label: "Alert" },
  info:       { icon: Info,                 color: "text-gray-700",   bg: "bg-gray-50",   border: "border-gray-200",   label: "Info" },
};

const getConf = (type: string) => TYPE_CONFIG[type?.toLowerCase()] ?? TYPE_CONFIG.info;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [typeFilter, setTypeFilter] = useState("all");
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">("all");
  const [search, setSearch] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  // Send notification (admin only)
  const [sendOpen, setSendOpen] = useState(false);
  const [sendTitle, setSendTitle] = useState("");
  const [sendBody, setSendBody] = useState("");
  const [sendType, setSendType] = useState("info");
  const [sendUserId, setSendUserId] = useState("all");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const { data: staffData } = useFetch<Array<{ id: string; name: string; role: string }>>(isAdmin ? "/api/staff" : null);
  const apiUrl = isAdmin
    ? "/api/notifications?all=true&limit=100"
    : `/api/notifications?userId=${user?.id ?? ""}&limit=100`;

  const { data: notificationsData, isLoading, error, refetch } = useFetch<Notif[]>(apiUrl);
  const [localNotifs, setLocalNotifs] = useState<Notif[] | null>(null);

  const notifications = localNotifs ?? notificationsData ?? [];

  // Sync local state when data loads
  if (notificationsData && !localNotifs) {
    setLocalNotifs(notificationsData);
  }

  const types = useMemo(() => {
    const set = new Set(notifications.map(n => n.type?.toLowerCase()).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [notifications]);

  const filtered = useMemo(() => {
    return notifications.filter(n => {
      const matchType = typeFilter === "all" || n.type?.toLowerCase() === typeFilter;
      const matchRead = readFilter === "all" || (readFilter === "unread" ? !n.readAt : !!n.readAt);
      const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) ||
        (n.body ?? "").toLowerCase().includes(search.toLowerCase());
      return matchType && matchRead && matchSearch;
    });
  }, [notifications, typeFilter, readFilter, search]);

  const unreadCount = notifications.filter(n => !n.readAt).length;

  const markAsRead = useCallback(async (id: string) => {
    setLocalNotifs(prev => (prev ?? []).map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
  }, []);

  const markAllRead = async () => {
    setMarkingAll(true);
    const now = new Date().toISOString();
    setLocalNotifs(prev => (prev ?? []).map(n => ({ ...n, readAt: n.readAt ?? now })));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?.id, markAll: true }),
    });
    setMarkingAll(false);
  };

  const handleRefresh = async () => {
    setLocalNotifs(null);
    await refetch();
  };

  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendTitle.trim()) { setSendError("Title is required"); return; }
    setSendError(""); setSending(true);
    try {
      const targets = sendUserId === "all"
        ? (staffData ?? []).map(s => s.id)
        : [sendUserId];
      for (const uid of targets) {
        await fetch("/api/notifications", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: uid, title: sendTitle.trim(), body: sendBody.trim() || undefined, type: sendType }),
        });
      }
      setSendOpen(false); setSendTitle(""); setSendBody(""); setSendType("info"); setSendUserId("all");
      setLocalNotifs(null); refetch();
    } catch { setSendError("Network error"); }
    finally { setSending(false); }
  };

  const getEntityLink = (n: Notif) => {
    if (n.entityType === "complaint" && n.entityId) return `/complaints/${n.entityId}`;
    if (n.entityType === "meeting") return "/schedule";
    if (n.entityType === "bill") return "/bills";
    if (n.entityType === "task") return "/tasks";
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#1a3a6b] to-blue-600 rounded-xl shadow-lg">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0 ? (
                    <span className="text-blue-600 font-medium">{unreadCount} unread</span>
                  ) : "All caught up"} · {notifications.length} total
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </Button>
              {unreadCount > 0 && (
                <Button size="sm" onClick={markAllRead} disabled={markingAll}
                  className="gap-1.5 bg-[#1a3a6b] hover:bg-[#1a3a6b]/90">
                  {markingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
                  Mark all read
                </Button>
              )}
              {isAdmin && (
                <Button size="sm" onClick={() => setSendOpen(true)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                  <Send className="h-3.5 w-3.5" /> Send Notification
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total", value: notifications.length, color: "text-gray-700", bg: "bg-gray-100" },
              { label: "Unread", value: unreadCount, color: "text-blue-700", bg: "bg-blue-100" },
              { label: "Read", value: notifications.length - unreadCount, color: "text-emerald-700", bg: "bg-emerald-100" },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl ${s.bg} px-4 py-3 text-center`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-0 shadow-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardContent className="pt-4 pb-4 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search notifications..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="pl-9 border-2 border-gray-200 focus:border-[#1a3a6b] h-10" />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Read filter */}
              <div className="flex gap-2">
                {(["all", "unread", "read"] as const).map(f => (
                  <button key={f} onClick={() => setReadFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all capitalize ${
                      readFilter === f ? "bg-[#1a3a6b] text-white border-[#1a3a6b]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1a3a6b]/40"
                    }`}>
                    {f}
                  </button>
                ))}
              </div>

              {/* Type filter */}
              <div className="flex flex-wrap gap-2">
                {types.map(t => {
                  const conf = t === "all" ? null : getConf(t);
                  return (
                    <button key={t} onClick={() => setTypeFilter(t)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border-2 transition-all capitalize ${
                        typeFilter === t
                          ? "bg-[#1a3a6b] text-white border-[#1a3a6b]"
                          : `bg-white text-gray-600 border-gray-200 hover:border-[#1a3a6b]/40`
                      }`}>
                      {t === "all" ? `All (${notifications.length})` : `${conf?.label ?? t} (${notifications.filter(n => n.type?.toLowerCase() === t).length})`}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-0 pt-4 px-5">
              <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
                {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
                {(typeFilter !== "all" || readFilter !== "all" || search) && " (filtered)"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-3">
              {error && (
                <div className="px-5 py-4 text-sm text-red-600 bg-red-50">Failed to load notifications.</div>
              )}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="h-8 w-8 border-3 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-400">Loading notifications...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <Bell className="h-10 w-10 opacity-30" />
                  </div>
                  <p className="font-medium">No notifications found</p>
                  <p className="text-xs">Try changing your filters</p>
                </div>
              ) : (
                <AnimatePresence>
                  <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {filtered.map((n, i) => {
                      const conf = getConf(n.type);
                      const Icon = conf.icon;
                      const isUnread = !n.readAt;
                      const link = getEntityLink(n);

                      return (
                        <motion.div key={n.id}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className={`flex items-start gap-4 px-5 py-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 ${isUnread ? "bg-blue-50/40 dark:bg-blue-950/10" : ""}`}>

                          {/* Icon */}
                          <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 border ${conf.bg} ${conf.border}`}>
                            <Icon className={`h-5 w-5 ${conf.color}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm leading-snug ${isUnread ? "font-semibold text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>
                                {n.title}
                              </p>
                              <div className="flex items-center gap-2 shrink-0">
                                {isUnread && (
                                  <button onClick={() => markAsRead(n.id)}
                                    className="text-xs text-blue-600 hover:underline font-medium whitespace-nowrap">
                                    Mark read
                                  </button>
                                )}
                              </div>
                            </div>

                            {n.body && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                            )}

                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className="text-xs text-gray-400" title={formatFullDate(n.createdAt)}>
                                {timeAgo(n.createdAt)}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${conf.bg} ${conf.color} ${conf.border}`}>
                                {conf.label}
                              </span>
                              {isAdmin && n.userName && (
                                <span className="text-xs text-gray-400">→ {n.userName}</span>
                              )}
                              {link && (
                                <Link href={link}
                                  className="text-xs text-[#1a3a6b] dark:text-blue-400 font-medium hover:underline">
                                  View →
                                </Link>
                              )}
                            </div>
                          </div>

                          {/* Unread indicator */}
                          {isUnread && (
                            <div className="h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0 mt-2 shadow-sm shadow-blue-500/50" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Send Notification Dialog (Admin only) */}
      {isAdmin && (
        <Dialog open={sendOpen} onOpenChange={o => { if (!o) { setSendOpen(false); setSendError(""); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-emerald-600" /> Send Notification
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={sendNotification} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Send To</Label>
                <Select value={sendUserId} onValueChange={setSendUserId}>
                  <SelectTrigger className="border-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Staff Members</SelectItem>
                    {(staffData ?? []).map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({s.role.replace(/_/g, " ")})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={sendType} onValueChange={setSendType}>
                  <SelectTrigger className="border-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["info", "alert", "complaint", "meeting", "bill", "task", "notice"].map(t => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Title *</Label>
                <Input placeholder="Notification title" value={sendTitle}
                  onChange={e => setSendTitle(e.target.value)} className="border-2" />
              </div>
              <div className="space-y-1.5">
                <Label>Message (optional)</Label>
                <textarea placeholder="Additional details..."
                  value={sendBody} onChange={e => setSendBody(e.target.value)}
                  className="w-full min-h-[80px] rounded-xl border-2 border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              {sendError && <p className="text-sm text-destructive">{sendError}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSendOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={sending} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sending ? "Sending..." : "Send"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
