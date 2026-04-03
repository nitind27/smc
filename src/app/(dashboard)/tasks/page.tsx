"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Plus, Loader2, CheckSquare, AlertCircle, ChevronRight } from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { useAuth } from "@/providers/auth-provider";
import { motion } from "framer-motion";

type Task = { id: string; title: string; description?: string; status: string; priority: string; assigneeName?: string; dueDate?: string; projectName?: string; };

const COLUMNS = [
  { id: "todo",        title: "To Do",       color: "bg-muted border-muted",                        badge: "bg-gray-100 text-gray-700" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-500/5 border-blue-500/30",              badge: "bg-blue-100 text-blue-700" },
  { id: "review",      title: "Review",      color: "bg-amber-500/5 border-amber-500/30",            badge: "bg-amber-100 text-amber-700" },
  { id: "done",        title: "Done",        color: "bg-emerald-500/5 border-emerald-500/30",        badge: "bg-emerald-100 text-emerald-700" },
];

const PRIORITY_COLOR: Record<string, string> = {
  low: "bg-gray-100 text-gray-600", medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
};

const STATUS_NEXT: Record<string, string> = {
  todo: "in_progress", in_progress: "review", review: "done", done: "todo",
};
const STATUS_NEXT_LABEL: Record<string, string> = {
  todo: "Start", in_progress: "Review", review: "Done", done: "Reopen",
};

export default function TasksPage() {
  const { user } = useAuth();
  const canCreate = ["admin", "department_head", "staff"].includes(user?.role ?? "");

  const { data: tasksData, isLoading, error, refetch } = useFetch<Task[]>("/api/tasks");
  const tasks = tasksData ?? [];

  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const byStatus = (s: string) => tasks.filter(t => t.status === s);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setFormError("Title is required"); return; }
    setFormError(""); setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined, priority, dueDate: dueDate || undefined }),
      });
      if (!res.ok) { const d = await res.json(); setFormError(d.error ?? "Failed"); return; }
      refetch(); setAddOpen(false); setTitle(""); setDescription(""); setPriority("medium"); setDueDate("");
    } catch { setFormError("Network error"); }
    finally { setSubmitting(false); }
  };

  const moveTask = async (taskId: string, newStatus: string) => {
    setUpdatingId(taskId);
    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      refetch();
    } finally { setUpdatingId(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" /> Task Board
          </h1>
          <p className="text-muted-foreground text-sm">Kanban-style task management</p>
        </div>
        {canCreate && (
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Task
          </Button>
        )}
      </div>

      {error && <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3"><AlertCircle className="h-4 w-4 text-destructive" /><p className="text-sm text-destructive">Failed to load tasks.</p></div>}

      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex gap-4 min-w-max">
            {COLUMNS.map(col => (
              <div key={col.id} className={cn("w-[300px] shrink-0 rounded-2xl border-2 flex flex-col", col.color)}>
                <div className="px-4 py-3 flex items-center justify-between border-b border-border/30">
                  <span className="font-semibold text-sm">{col.title}</span>
                  <Badge className={`${col.badge} border-0 text-xs`}>{byStatus(col.id).length}</Badge>
                </div>
                <div className="flex-1 p-3 space-y-2 min-h-[200px]">
                  {byStatus(col.id).length === 0 && (
                    <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">No tasks</div>
                  )}
                  {byStatus(col.id).map((task, i) => (
                    <motion.div key={task.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="bg-white dark:bg-gray-900 rounded-xl border border-border/50 p-3 shadow-sm hover:shadow-md transition-all space-y-2">
                      <p className="text-sm font-semibold leading-snug">{task.title}</p>
                      {task.description && <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge className={`${PRIORITY_COLOR[task.priority] ?? "bg-gray-100 text-gray-600"} border-0 text-xs`}>{task.priority}</Badge>
                        {task.assigneeName && <Badge variant="outline" className="text-xs">{task.assigneeName}</Badge>}
                        {task.dueDate && <span className="text-xs text-muted-foreground">{task.dueDate}</span>}
                      </div>
                      {canCreate && (
                        <Button size="sm" variant="outline" className="w-full h-7 text-xs gap-1"
                          disabled={updatingId === task.id}
                          onClick={() => moveTask(task.id, STATUS_NEXT[task.status])}>
                          {updatingId === task.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChevronRight className="h-3 w-3" />}
                          {STATUS_NEXT_LABEL[task.status]}
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      {/* Add Task Dialog */}
      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setFormError(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add New Task</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} className="border-2" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea placeholder="Optional description" value={description} onChange={e => setDescription(e.target.value)}
                className="w-full min-h-[80px] rounded-xl border-2 border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="border-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="border-2" />
              </div>
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
