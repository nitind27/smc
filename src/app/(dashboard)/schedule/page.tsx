"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Users, Loader2, MessageSquareWarning } from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";

type Meeting = {
  id: string;
  title: string;
  agenda: string | null;
  date: string;
  time: string;
  status: string;
  participants: number;
  complaintId: string | null;
  complaintTitle: string | null;
  complaintStatus: string | null;
};

type Complaint = {
  id: string;
  title: string;
  status: string;
  category: string;
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const SCHEDULABLE_STATUSES = ["submitted", "assigned", "in_progress"];

export default function MeetingsPage() {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [agenda, setAgenda] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("09:00");
  const [departmentId, setDepartmentId] = useState("none");
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [complaintId, setComplaintId] = useState("none");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: meetingsData, isLoading, error, refetch } = useFetch<Meeting[]>("/api/meetings");
  const meetings = meetingsData ?? [];

  const { data: departmentsData } = useFetch<Array<{ id: string; name: string }>>("/api/departments");
  const departments = departmentsData ?? [];

  const { data: staffData } = useFetch<Array<{ id: string; name: string; email: string }>>("/api/staff");
  const staff = staffData ?? [];

  const { data: complaintsData } = useFetch<Complaint[]>("/api/complaints");
  const openComplaints = (complaintsData ?? []).filter((c) =>
    SCHEDULABLE_STATUSES.includes(c.status)
  );

  const resetForm = () => {
    setTitle("");
    setAgenda("");
    setMeetingDate("");
    setMeetingTime("09:00");
    setDepartmentId("none");
    setParticipantIds([]);
    setComplaintId("none");
    setFormError(null);
  };

  const handleClose = () => {
    setScheduleOpen(false);
    resetForm();
  };

  const toggleParticipant = (id: string) =>
    setParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }

    if (!meetingDate.trim()) {
      setFormError("Date is required.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        agenda: agenda.trim() || null,
        meetingDate: meetingDate.trim(),
        meetingTime: meetingTime.trim() || "09:00",
        departmentId: departmentId !== "none" ? departmentId : null,
        participantIds,
        complaintId: complaintId !== "none" ? complaintId : null,
      };

      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFormError(data?.error || `Failed to create meeting. (${res.status})`);
        return;
      }

      await refetch();
      handleClose();
    } catch (err) {
      console.error("Meeting create error:", err);
      setFormError("Failed to create meeting.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
          <p className="text-muted-foreground">Schedule and manage complaint meetings</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setScheduleOpen(true);
          }}
        >
          Schedule meeting
        </Button>
      </div>

      {/* Schedule Dialog */}
      <Dialog open={scheduleOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule meeting</DialogTitle>
            <DialogDescription>
              Link this meeting to a complaint. Only one active meeting per complaint is allowed.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Complaint selector */}
            <div className="space-y-2">
              <Label>Linked Complaint</Label>
              <Select value={complaintId} onValueChange={setComplaintId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a complaint" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="none">— No complaint (general meeting) —</SelectItem>
                  {openComplaints.length === 0 ? (
                    <SelectItem value="__empty__" disabled>
                      No open complaints
                    </SelectItem>
                  ) : (
                    openComplaints.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        [{c.id}] {c.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {complaintId !== "none" && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <MessageSquareWarning className="h-3 w-3" />
                  A new meeting for this complaint cannot be scheduled until this one is completed.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting-title">Title *</Label>
              <Input
                id="meeting-title"
                placeholder="e.g. Zone review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting-agenda">Agenda (optional)</Label>
              <textarea
                id="meeting-agenda"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Brief agenda or topics"
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meeting-date">Date *</Label>
                <Input
                  id="meeting-date"
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting-time">Time</Label>
                <Input
                  id="meeting-time"
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Department (optional)</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="none">No department</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {staff.length > 0 && (
              <div className="space-y-2">
                <Label>Participants (optional)</Label>
                <div className="max-h-32 overflow-y-auto rounded-md border border-input bg-muted/30 p-2 space-y-1.5">
                  {staff.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={participantIds.includes(s.id)}
                        onChange={() => toggleParticipant(s.id)}
                        className="rounded border-input"
                      />
                      <span>{s.name}</span>
                      <span className="text-muted-foreground text-xs">({s.email})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {formError && (
              <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
                {formError}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Meeting cards */}
      {error && <p className="text-sm text-destructive">Failed to load meetings.</p>}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : meetings.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-14 text-muted-foreground gap-3">
            <Calendar className="h-10 w-10 opacity-20" />
            <p className="text-sm">No meetings scheduled yet.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                resetForm();
                setScheduleOpen(true);
              }}
            >
              Schedule first meeting
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {meetings.map((m) => (
            <Card key={m.id} className="glass-card transition-all hover:shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{m.title}</CardTitle>
                  <Badge
                    variant="outline"
                    className={`shrink-0 text-xs capitalize ${STATUS_COLORS[m.status] ?? ""}`}
                  >
                    {m.status}
                  </Badge>
                </div>
                {m.agenda && <CardDescription className="line-clamp-2">{m.agenda}</CardDescription>}
              </CardHeader>

              <CardContent className="space-y-2 text-sm">
                {m.complaintId && (
                  <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1.5">
                    <MessageSquareWarning className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-amber-700 truncate">{m.complaintTitle}</p>
                      <p className="text-xs text-amber-600 capitalize">
                        {m.complaintStatus?.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                )}

                <p className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" /> {m.date}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" /> {m.time}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" /> {m.participants} participants
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Timeline */}
      {meetings.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>Recent meeting activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 space-y-6 border-l-2 border-primary/30">
              {meetings.slice(0, 5).map((m) => (
                <div key={m.id} className="relative flex gap-4">
                  <span className="absolute -left-6 top-1 h-3 w-3 rounded-full bg-primary" />
                  <div className="flex-1 pb-2">
                    <p className="font-medium">{m.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {m.date} · {m.time}
                    </p>
                    {m.complaintTitle && (
                      <p className="text-xs text-amber-600 mt-0.5">Re: {m.complaintTitle}</p>
                    )}
                    <Badge
                      variant="outline"
                      className={`mt-1 text-xs capitalize ${STATUS_COLORS[m.status] ?? ""}`}
                    >
                      {m.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}