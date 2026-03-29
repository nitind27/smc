"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search, Bell, Moon, Sun, Menu, LogOut, Globe, ChevronDown,
  Check, CheckCheck, MessageSquareWarning, Calendar, FileText,
  Info, AlertCircle, UserCheck, Briefcase, Megaphone, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/providers/theme-provider";
import { useAuth } from "@/providers/auth-provider";
import { DEMO_USERS } from "@/providers/auth-provider";
import type { UserRole } from "@/types";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { UserCircle } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { triggerGoogleTranslate } from "@/components/public/GoogleTranslate";

// ── Types ─────────────────────────────────────────────────────────────────────
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
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  complaint:  { icon: MessageSquareWarning, color: "text-blue-600",   bg: "bg-blue-50",   label: "Complaint" },
  meeting:    { icon: Calendar,             color: "text-violet-600", bg: "bg-violet-50", label: "Meeting" },
  bill:       { icon: FileText,             color: "text-amber-600",  bg: "bg-amber-50",  label: "Bill" },
  task:       { icon: Briefcase,            color: "text-emerald-600",bg: "bg-emerald-50",label: "Task" },
  assignment: { icon: UserCheck,            color: "text-indigo-600", bg: "bg-indigo-50", label: "Assignment" },
  notice:     { icon: Megaphone,            color: "text-rose-600",   bg: "bg-rose-50",   label: "Notice" },
  alert:      { icon: AlertCircle,          color: "text-red-600",    bg: "bg-red-50",    label: "Alert" },
  info:       { icon: Info,                 color: "text-gray-600",   bg: "bg-gray-50",   label: "Info" },
};

const getTypeConf = (type: string) => TYPE_CONFIG[type.toLowerCase()] ?? TYPE_CONFIG.info;

// ── Notification Bell Component ───────────────────────────────────────────────
function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notif[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [markingAll, setMarkingAll] = React.useState(false);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const unread = notifications.filter(n => !n.readAt);
  const unreadCount = unread.length;

  const fetchNotifs = React.useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/notifications?userId=${userId}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch { /* silent */ }
  }, [userId]);

  // Initial fetch + polling every 30s
  React.useEffect(() => {
    setLoading(true);
    fetchNotifs().finally(() => setLoading(false));
    intervalRef.current = setInterval(fetchNotifs, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchNotifs]);

  // Fetch when dropdown opens
  React.useEffect(() => {
    if (open) fetchNotifs();
  }, [open, fetchNotifs]);

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    setNotifications(prev => prev.map(n => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, markAll: true }),
    });
    setMarkingAll(false);
  };

  const handleNotifClick = async (n: Notif) => {
    if (!n.readAt) await markAsRead(n.id);
    // Navigate to entity
    if (n.entityType === "complaint" && n.entityId) router.push(`/complaints/${n.entityId}`);
    else if (n.entityType === "meeting") router.push("/schedule");
    else if (n.entityType === "bill") router.push("/bills");
    else if (n.entityType === "task") router.push("/tasks");
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className={cn("h-5 w-5 transition-all", unreadCount > 0 && "text-primary")} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[380px] p-0 shadow-2xl border-0 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#1a3a6b] to-[#1a3a6b]/80 text-white">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-yellow-300" />
            <span className="font-bold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button onClick={markAllRead} disabled={markingAll}
                className="flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10">
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
            <button onClick={() => { router.push("/notifications"); setOpen(false); }}
              className="text-xs text-white/70 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10">
              View all
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[420px] overflow-y-auto bg-white dark:bg-gray-900">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <div className="h-6 w-6 border-2 border-[#1a3a6b] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-400">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
              <div className="p-3 bg-gray-100 rounded-full">
                <Bell className="h-8 w-8 opacity-30" />
              </div>
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {notifications.map((n) => {
                const conf = getTypeConf(n.type);
                const Icon = conf.icon;
                const isUnread = !n.readAt;
                return (
                  <button key={n.id} onClick={() => handleNotifClick(n)}
                    className={cn(
                      "w-full flex items-start gap-3 px-4 py-3 text-left transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50",
                      isUnread && "bg-blue-50/50 dark:bg-blue-950/20"
                    )}>
                    {/* Icon */}
                    <div className={cn("p-2 rounded-xl shrink-0 mt-0.5", conf.bg)}>
                      <Icon className={cn("h-4 w-4", conf.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm leading-snug", isUnread ? "font-semibold text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400")}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.body}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{timeAgo(n.createdAt)}</span>
                        <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium", conf.bg, conf.color)}>
                          {conf.label}
                        </span>
                      </div>
                    </div>

                    {/* Unread dot */}
                    {isUnread && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50">
            <button onClick={() => { router.push("/notifications"); setOpen(false); }}
              className="w-full text-xs text-center text-[#1a3a6b] dark:text-blue-400 font-semibold hover:underline">
              View all notifications →
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Main CommandBar ───────────────────────────────────────────────────────────
export function CommandBar() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const { user, setUser, logout } = useAuth();
  const { lang, setLang, t, languages } = useLanguage();

  const handleLangChange = (code: string) => {
    setLang(code as Parameters<typeof setLang>[0]);
    triggerGoogleTranslate(code);
  };

  const [searchOpen, setSearchOpen] = React.useState(false);

  const switchRole = (role: UserRole) => setUser(DEMO_USERS[role]);
  const handleLogout = () => { logout(); router.replace("/login"); };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar embedded />
        </SheetContent>
      </Sheet>

      {/* Search */}
      <div className="flex flex-1 items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("dash.search")}
            className="pl-9 bg-muted/50 focus-visible:ring-2"
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
          />
          {searchOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border bg-popover p-2 shadow-lg animate-in fade-in slide-in-from-top-2">
              <p className="px-2 py-1 text-xs text-muted-foreground">
                Type to search across complaints, tasks, and meetings
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Language */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 px-2 text-muted-foreground hover:text-foreground">
              <Globe className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase">{lang === "en" ? "EN" : lang.toUpperCase()}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 max-h-72 overflow-y-auto">
            {languages.map((l) => (
              <DropdownMenuItem key={l.code} onClick={() => handleLangChange(l.code)}
                className={`gap-2 cursor-pointer ${lang === l.code ? "text-primary font-medium" : ""}`}>
                <Globe className="h-3.5 w-3.5" />
                <span>{l.label}</span>
                {lang === l.code && <span className="ml-auto text-primary text-xs">✓</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme */}
        <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
          {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Notification Bell — live data */}
        {user?.id && <NotificationBell userId={user.id} />}

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {user?.name?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <p className="text-xs text-primary font-medium capitalize">{user?.role?.replace("_", " ")}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")} className="gap-2">
              <UserCircle className="h-4 w-4" />
              {t("dash.myprofile")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">{t("dash.switchrole")}</DropdownMenuLabel>
            {(["admin", "department_head", "staff", "auditor", "public"] as const).map((r) => (
              <DropdownMenuItem key={r} onClick={() => switchRole(r)}>
                {DEMO_USERS[r].name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-muted-foreground">
              <LogOut className="mr-2 h-4 w-4" />
              {t("dash.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
