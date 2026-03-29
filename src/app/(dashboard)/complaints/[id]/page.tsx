"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import {
  ArrowLeft, Calendar, Loader2, MessageSquareWarning, MapPin,
  User, Building2, Tag, Clock, CheckCircle2, AlertCircle,
  Send, Paperclip, Eye, RefreshCw, UserCheck, ChevronRight,
  FileText, TrendingUp, XCircle, RotateCcw,
} from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { useAuth } from "@/providers/auth-provider";
import { motion, AnimatePresence } from "framer-motion";

type ComplaintDetail = {
  id: string; title: string; description: string; category: string;
  status: string; priority: string; submittedBy: string;
  assignedTo: string | null; assigneeName: string | null;
  departmentId: string | null; departmentName: string | null;
  location: string | null; attachments: string[];
  createdAt: string; updatedAt: string;
};

const STATUS_FLOW = [
  { key: "submitted", label: "Submitted", icon: FileText, color: "text-blue-600", bg: "bg-blue-500/20" },
  { key: "assigned", label: "Assigned", icon: UserCheck, color: "text-purple-600", bg: "bg-purple-500/20" },
  { key: "in_progress", label: "In Progress", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-500/20" },
  { key: "resolved", label: "Resolved", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/20" },
  { key: "closed", label: "Closed", icon: XCircle, color: "text-gray-600", bg: "bg-gray-500/20" },
];

const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: "Low", color: "text-gray-600", bg: "bg-gray-500/20" },
  medium: { label: "Medium", color: "text-amber-600", bg: "bg-amber-500/20" },
  high: { label: "High", color: "text-orange-600", bg: "bg-orange-500/20" },
  urgent: { label: "Urgent", color: "text-red-600", bg: "bg-red-500/20" },
};

export default function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const { data: complaint, isLoading, error, refetch } = useFetch<ComplaintDetail>(
    id ? `/api/complaints/${id}` : null
  );
  const { data: staffData } = useFetch<Array<{ id: string; name: string; role: string }>>("/api/staff");
  const { data: departmentsData } = useFetch<Array<{ id: string; name: string }>>("/api/departments");

  const [updating, setUpdating] = useState(false);
  const [comment, setComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("09:00");
  const [meetingBusy, setMeetingBusy] = useState(false);
  const [meetingSuccess, setMeetingSuccess] = useState(false);
  const [meetingError, setMeetingError] = useState("");
  const [actionError, setActionError] = useState("");

  const isAdmin = user?.role === "admin";
  const isDeptHead = user?.role === "department_head";
  const isStaff = user?.role === "staff";
  const canManage = isAdmin || isDeptHead;

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    setActionError("");
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) { refetch(); }
      else { const d = await res.json(); setActionError(d.error ?? "Update failed"); }
    } catch { setActionError("Network error"); }
    finally { setUpdating(false); }
  };

  const handleAssign = async () => {
    if (!selectedAssignee && !selectedDept) return;
    setUpdating(true);
    setActionError("");
    try {
      const body: Record<string, string> = { status: "assigned" };
      if (selectedAssignee) body.assignedTo = selectedAssignee;
      if (selectedDept) body.departmentId = selectedDept;
      const res = await fetch(`/api/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { refetch(); setAssignOpen(false); setSelectedAssignee(""); setSelectedDept(""); }
      else { const d = await res.json(); setActionError(d.error ?? "Assignment failed"); }
    } catch { setActionError("Network error"); }
    finally { setUpdating(false); }
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setMeetingError("");
    if (!meetingTitle.trim()) { setMeetingError("Title is required."); return; }
    if (!meetingDate) { setMeetingError("Date is required."); return; }
    setMeetingBusy(true);
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: meetingTitle.trim(),
          meetingDate,
          meetingTime: meetingTime || "09:00",
          complaintId: id,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMeetingError(data.error ?? "Failed"); return; }
      setMeetingSuccess(true);
    } catch { setMeetingError("Network error"); }
    finally { setMeetingBusy(false); }
  };

  const currentStatusIndex = STATUS_FLOW.findIndex(s => s.key === complaint?.status);
  const priorityConf = PRIORITY_CONFIG[complaint?.priority ?? "medium"] ?? PRIORITY_CONFIG.medium;
  const staff = staffData ?? [];
  const departments = departmentsData ?? [];
  const canScheduleMeeting = complaint && ["submitted", "assigned", "in_progress"].includes(complaint.status);

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  if (error || !complaint) return (
    <div className="flex flex-col items-center py-20 gap-4 text-muted-foreground">
      <AlertCircle className="h-12 w-12 opacity-30" />
      <p>Complaint not found or failed to load.</p>
      <Button variant="outline" asChild><Link href="/complaints">Back to Complaints</Link></Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/complaints"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold truncate">{complaint.title}</h1>
                <Badge className={`${priorityConf.bg} ${priorityConf.color} border-0 shrink-0`}>
                  {priorityConf.label}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm font-mono">ID: {complaint.id}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1 shrink-0">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>
        </motion.div>

        {/* Status Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between overflow-x-auto gap-1 pb-2">
                {STATUS_FLOW.map((step, i) => {
                  const Icon = step.icon;
                  const isActive = step.key === complaint.status;
                  const isPast = i < currentStatusIndex;
                  const isFuture = i > currentStatusIndex;
                  return (
                    <div key={step.key} className="flex items-center gap-1 shrink-0">
                      <div className={`flex flex-col items-center gap-1.5 ${isFuture ? "opacity-30" : ""}`}>
                        <div className={`p-2 rounded-full transition-all ${isActive ? `${step.bg} ring-2 ring-offset-2 ring-current ${step.color}` : isPast ? "bg-emerald-500/20" : "bg-muted"}`}>
                          {isPast ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Icon className={`h-4 w-4 ${isActive ? step.color : "text-muted-foreground"}`} />}
                        </div>
                        <span className={`text-xs font-medium whitespace-nowrap ${isActive ? step.color : "text-muted-foreground"}`}>
                          {step.label}
                        </span>
                      </div>
                      {i < STATUS_FLOW.length - 1 && (
                        <ChevronRight className={`h-4 w-4 mx-1 shrink-0 ${i < currentStatusIndex ? "text-emerald-500" : "text-muted-foreground/30"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2 space-y-6">

            {/* Description */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Complaint Description</CardTitle>
                <CardDescription>
                  Submitted on {new Date(complaint.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed">{complaint.description || "No description provided."}</p>
                {complaint.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{complaint.location}</span>
                  </div>
                )}
                {complaint.attachments?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Attachments ({complaint.attachments.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {complaint.attachments.map((url, i) => {
                        const isImage = /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(url);
                        return isImage ? (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                            className="group relative overflow-hidden rounded-xl border border-border/50 aspect-square block">
                            <img src={url} alt={`attachment-${i + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </a>
                        ) : (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary rounded-xl px-3 py-2 hover:bg-primary/20 transition-colors">
                            <Paperclip className="h-3 w-3" /> File {i + 1}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admin Actions */}
            {canManage && (
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-primary" /> Management Actions
                  </CardTitle>
                  <CardDescription>Update status, assign staff, or schedule a meeting</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {actionError && (
                    <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{actionError}</div>
                  )}

                  {/* Status Actions */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                      {complaint.status === "submitted" && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusUpdate("in_progress")} disabled={updating} className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50">
                          <TrendingUp className="h-3.5 w-3.5" /> Mark In Progress
                        </Button>
                      )}
                      {["submitted", "assigned", "in_progress"].includes(complaint.status) && (
                        <Button size="sm" onClick={() => handleStatusUpdate("resolved")} disabled={updating} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
                        </Button>
                      )}
                      {complaint.status === "resolved" && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusUpdate("closed")} disabled={updating} className="gap-1.5">
                          <XCircle className="h-3.5 w-3.5" /> Close Complaint
                        </Button>
                      )}
                      {["resolved", "closed"].includes(complaint.status) && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusUpdate("in_progress")} disabled={updating} className="gap-1.5 text-muted-foreground">
                          <RotateCcw className="h-3.5 w-3.5" /> Reopen
                        </Button>
                      )}
                      {complaint.status !== "rejected" && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusUpdate("rejected")} disabled={updating} className="gap-1.5 border-red-300 text-red-600 hover:bg-red-50">
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </Button>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Assign */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Assignment</p>
                    <Button size="sm" variant="outline" onClick={() => setAssignOpen(true)} className="gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      {complaint.assigneeName ? `Reassign (${complaint.assigneeName})` : "Assign to Staff"}
                    </Button>
                  </div>

                  <Separator />

                  {/* Meeting */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Meeting</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setMeetingTitle(""); setMeetingDate(""); setMeetingTime("09:00"); setMeetingSuccess(false); setMeetingError(""); setMeetingOpen(true); }}
                      disabled={!canScheduleMeeting}
                      className="gap-1.5 border-violet-300 text-violet-700 hover:bg-violet-50"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      {canScheduleMeeting ? "Schedule Meeting" : "Meeting not available"}
                    </Button>
                    {!canScheduleMeeting && (
                      <p className="text-xs text-muted-foreground mt-1">Meetings can only be scheduled for open complaints.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Staff can update status too */}
            {isStaff && ["assigned", "in_progress"].includes(complaint.status) && (
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Update Progress</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                  {complaint.status === "assigned" && (
                    <Button size="sm" onClick={() => handleStatusUpdate("in_progress")} disabled={updating} className="gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5" /> Start Working
                    </Button>
                  )}
                  {complaint.status === "in_progress" && (
                    <Button size="sm" onClick={() => handleStatusUpdate("resolved")} disabled={updating} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Sidebar Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">

            {/* Meta Info */}
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="font-medium">{complaint.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Priority</p>
                    <Badge className={`${priorityConf.bg} ${priorityConf.color} border-0 text-xs`}>{priorityConf.label}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Submitted By</p>
                    <p className="font-medium truncate">{complaint.submittedBy}</p>
                  </div>
                </div>
                {complaint.assigneeName && (
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Assigned To</p>
                      <p className="font-medium">{complaint.assigneeName}</p>
                    </div>
                  </div>
                )}
                {complaint.departmentName && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="font-medium">{complaint.departmentName}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{new Date(complaint.updatedAt).toLocaleDateString("en-IN")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="border-0 shadow-md bg-white/60 dark:bg-gray-900/60">
              <CardContent className="pt-4 pb-4 space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2" asChild>
                  <Link href="/complaints"><Eye className="h-4 w-4" /> All Complaints</Link>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2" asChild>
                  <Link href="/schedule"><Calendar className="h-4 w-4" /> Meetings</Link>
                </Button>
                {canManage && (
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2" asChild>
                    <Link href="/staff"><User className="h-4 w-4" /> Staff</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Assign Dialog */}
        <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Complaint</DialogTitle>
              <DialogDescription>Assign to a staff member and/or route to a department.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Assign to Staff Member</Label>
                <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                  <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— No specific staff —</SelectItem>
                    {staff.filter(s => ["staff", "department_head"].includes(s.role)).map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({s.role})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Route to Department</Label>
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— No department —</SelectItem>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {actionError && <p className="text-sm text-destructive">{actionError}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
              <Button onClick={handleAssign} disabled={updating || (!selectedAssignee && !selectedDept)} className="gap-2">
                {updating && <Loader2 className="h-4 w-4 animate-spin" />} Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Meeting Dialog */}
        <Dialog open={meetingOpen} onOpenChange={(o) => { if (!o) { setMeetingOpen(false); setMeetingSuccess(false); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquareWarning className="h-5 w-5 text-amber-600" /> Schedule Meeting
              </DialogTitle>
              <DialogDescription>
                Link a meeting to complaint <span className="font-mono font-medium">{id}</span>
              </DialogDescription>
            </DialogHeader>
            {meetingSuccess ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> Meeting scheduled successfully.
                </div>
                <DialogFooter>
                  <Button variant="outline" asChild><Link href="/schedule">View Meetings</Link></Button>
                  <Button onClick={() => { setMeetingOpen(false); setMeetingSuccess(false); }}>Done</Button>
                </DialogFooter>
              </div>
            ) : (
              <form onSubmit={handleScheduleMeeting} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Meeting Title *</Label>
                  <Input placeholder="e.g. Complaint review" value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Date *</Label>
                    <Input type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Time</Label>
                    <Input type="time" value={meetingTime} onChange={e => setMeetingTime(e.target.value)} />
                  </div>
                </div>
                {meetingError && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{meetingError}</p>}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setMeetingOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={meetingBusy} className="gap-2">
                    {meetingBusy && <Loader2 className="h-4 w-4 animate-spin" />} Schedule
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
