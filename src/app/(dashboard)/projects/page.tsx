"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Briefcase, Users, CheckSquare, TrendingUp,
  Plus, Loader2, Building2, Calendar, ListTodo,
  CircleDot, CircleCheck, PauseCircle, UserPlus, Pencil,
} from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";

// ─── Types ────────────────────────────────────────────────────────────────────
type Project = {
  id: string;
  name: string;
  departmentId: string | null;
  departmentName: string | null;
  status: string;
  progress: number;
  taskCount: number;
  createdAt: string;
};

type Staff = {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId: string | null;
  departmentName: string | null;
  avatar?: string;
};

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  assigneeId: string | null;
  assigneeName: string | null;
  projectId: string | null;
  projectName: string | null;
  dueDate: string | null;
};

type Department = { id: string; name: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active:    { label: "Active",    color: "bg-blue-500/10 text-blue-600 border-blue-200",   icon: CircleDot },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-600 border-green-200", icon: CircleCheck },
  on_hold:   { label: "On Hold",   color: "bg-amber-500/10 text-amber-600 border-amber-200", icon: PauseCircle },
};

const PRIORITY_COLOR: Record<string, string> = {
  low:    "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-700",
  high:   "bg-red-100 text-red-700",
};

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const { data: projectsData, isLoading: projLoading, error: projError, refetch: refetchProjects } =
    useFetch<Project[]>("/api/projects");
  const { data: staffData, refetch: refetchStaff } = useFetch<Staff[]>("/api/staff");
  const { data: tasksData, refetch: refetchTasks } = useFetch<Task[]>("/api/tasks");
  const { data: deptData } = useFetch<Department[]>("/api/departments");

  const projects = projectsData ?? [];
  const staff = staffData ?? [];
  const tasks = tasksData ?? [];
  const departments = deptData ?? [];

  // ── Filters ──────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = React.useState("all");
  const filtered = statusFilter === "all" ? projects : projects.filter((p) => p.status === statusFilter);

  // ── New Project dialog ────────────────────────────────────────────────────
  const [projOpen, setProjOpen] = React.useState(false);
  const [projName, setProjName] = React.useState("");
  const [projDept, setProjDept] = React.useState("");
  const [projStatus, setProjStatus] = React.useState("active");
  const [projProgress, setProjProgress] = React.useState("0");
  const [projBusy, setProjBusy] = React.useState(false);
  const [projErr, setProjErr] = React.useState("");

  const resetProjForm = () => {
    setProjName(""); setProjDept(""); setProjStatus("active");
    setProjProgress("0"); setProjErr("");
  };

  const submitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjErr("");
    if (!projName.trim()) { setProjErr("Name is required."); return; }
    setProjBusy(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projName.trim(),
          departmentId: projDept || undefined,
          status: projStatus,
          progress: Number(projProgress),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setProjErr(data.error ?? "Failed to create project"); return; }
      refetchProjects();
      setProjOpen(false);
      resetProjForm();
    } catch { setProjErr("Network error."); }
    finally { setProjBusy(false); }
  };

  // ── New Task dialog ───────────────────────────────────────────────────────
  const [taskOpen, setTaskOpen] = React.useState(false);
  const [taskTitle, setTaskTitle] = React.useState("");
  const [taskProject, setTaskProject] = React.useState("");
  const [taskAssignee, setTaskAssignee] = React.useState("");
  const [taskPriority, setTaskPriority] = React.useState("medium");
  const [taskDue, setTaskDue] = React.useState("");
  const [taskBusy, setTaskBusy] = React.useState(false);
  const [taskErr, setTaskErr] = React.useState("");

  const resetTaskForm = () => {
    setTaskTitle(""); setTaskProject(""); setTaskAssignee("");
    setTaskPriority("medium"); setTaskDue(""); setTaskErr("");
  };

  const submitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaskErr("");
    if (!taskTitle.trim()) { setTaskErr("Title is required."); return; }
    setTaskBusy(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle.trim(),
          projectId: taskProject || undefined,
          assigneeId: taskAssignee || undefined,
          priority: taskPriority,
          dueDate: taskDue || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setTaskErr(data.error ?? "Failed to create task"); return; }
      refetchTasks();
      setTaskOpen(false);
      resetTaskForm();
    } catch { setTaskErr("Network error."); }
    finally { setTaskBusy(false); }
  };

  // ── New Worker dialog ─────────────────────────────────────────────────────
  const [workerOpen, setWorkerOpen] = React.useState(false);
  const [wName, setWName] = React.useState("");
  const [wEmail, setWEmail] = React.useState("");
  const [wRole, setWRole] = React.useState("staff");
  const [wDept, setWDept] = React.useState("");
  const [wPassword, setWPassword] = React.useState("");
  const [wBusy, setWBusy] = React.useState(false);
  const [wErr, setWErr] = React.useState("");

  // Edit worker
  const [editWorkerOpen, setEditWorkerOpen] = React.useState(false);
  const [editingWorker, setEditingWorker] = React.useState<Staff | null>(null);
  const [ewName, setEwName] = React.useState("");
  const [ewEmail, setEwEmail] = React.useState("");
  const [ewRole, setEwRole] = React.useState("staff");
  const [ewDept, setEwDept] = React.useState("");
  const [ewBusy, setEwBusy] = React.useState(false);
  const [ewErr, setEwErr] = React.useState("");

  const resetWorkerForm = () => {
    setWName(""); setWEmail(""); setWRole("staff"); setWDept(""); setWPassword(""); setWErr("");
  };

  const openEditWorker = (w: Staff) => {
    setEditingWorker(w);
    setEwName(w.name); setEwEmail(w.email);
    setEwRole(w.role); setEwDept(w.departmentId ?? ""); setEwErr("");
    setEditWorkerOpen(true);
  };

  const submitWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setWErr("");
    if (!wName.trim()) { setWErr("Name is required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wEmail.trim())) { setWErr("Valid email is required."); return; }
    setWBusy(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: wName.trim(), email: wEmail.trim(),
          role: wRole, departmentId: wDept || undefined,
          password: wPassword.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setWErr(data.error ?? "Failed to add worker"); return; }
      refetchStaff();
      setWorkerOpen(false);
      resetWorkerForm();
    } catch { setWErr("Network error."); }
    finally { setWBusy(false); }
  };

  const submitEditWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;
    setEwErr("");
    if (!ewName.trim()) { setEwErr("Name is required."); return; }
    setEwBusy(true);
    try {
      const res = await fetch(`/api/staff/${editingWorker.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ewName.trim(), email: ewEmail.trim(),
          role: ewRole, departmentId: ewDept || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setEwErr(data.error ?? "Failed to update worker"); return; }
      refetchStaff();
      setEditWorkerOpen(false);
      setEditingWorker(null);
    } catch { setEwErr("Network error."); }
    finally { setEwBusy(false); }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const avgProgress = totalProjects
    ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / totalProjects)
    : 0;

  const statCards = [
    { label: "Total Projects", value: totalProjects, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-500/10" },
    { label: "Active",         value: activeProjects, icon: CircleDot, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { label: "Completed",      value: completedProjects, icon: CircleCheck, color: "text-violet-600", bg: "bg-violet-500/10" },
    { label: "Avg. Progress",  value: `${avgProgress}%`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Work & Projects
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track SMC projects, worker assignments, and task progress.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => { resetTaskForm(); setTaskOpen(true); }}>
            <ListTodo className="h-4 w-4" /> Add Task
          </Button>
          <Button size="sm" className="gap-2" onClick={() => { resetProjForm(); setProjOpen(true); }}>
            <Plus className="h-4 w-4" /> New Project
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="glass-card">
              <CardContent className="flex items-center gap-4 pt-5">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", "active", "completed", "on_hold"].map((f) => (
          <Button
            key={f}
            size="sm"
            variant={statusFilter === f ? "default" : "outline"}
            onClick={() => setStatusFilter(f)}
            className="capitalize"
          >
            {f === "all" ? "All" : STATUS_CONFIG[f]?.label ?? f}
          </Button>
        ))}
      </div>

      {/* Projects grid */}
      {projError && <p className="text-sm text-destructive">Failed to load projects.</p>}
      {projLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-16 text-center text-muted-foreground">
            No projects found. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.active;
            const StatusIcon = cfg.icon;
            const projectTasks = tasks.filter((t) => t.projectId === p.id);
            const doneTasks = projectTasks.filter((t) => t.status === "done").length;
            const assignedWorkers = staff.filter((s) =>
              projectTasks.some((t) => t.assigneeId === s.id)
            );

            return (
              <Card key={p.id} className="glass-card hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
                {/* Top accent */}
                <div className={`h-1 w-full rounded-t-lg ${
                  p.status === "active" ? "bg-gradient-to-r from-blue-500 to-cyan-400" :
                  p.status === "completed" ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                  "bg-gradient-to-r from-amber-500 to-orange-400"
                }`} />

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">{p.name}</CardTitle>
                    <Badge variant="outline" className={`shrink-0 text-xs font-semibold ${cfg.color}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {cfg.label}
                    </Badge>
                  </div>
                  {p.departmentName && (
                    <CardDescription className="flex items-center gap-1.5 mt-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {p.departmentName}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span className="font-semibold text-foreground">{p.progress}%</span>
                    </div>
                    <Progress value={p.progress} className="h-2" />
                  </div>

                  {/* Task count */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <CheckSquare className="h-4 w-4" />
                      Tasks
                    </span>
                    <span className="font-medium">
                      {doneTasks}/{projectTasks.length > 0 ? projectTasks.length : p.taskCount}
                      <span className="text-muted-foreground text-xs ml-1">done</span>
                    </span>
                  </div>

                  {/* Assigned workers */}
                  {assignedWorkers.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> Assigned workers
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {assignedWorkers.slice(0, 5).map((w) => (
                          <div key={w.id} className="flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                                {initials(w.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{w.name.split(" ")[0]}</span>
                          </div>
                        ))}
                        {assignedWorkers.length > 5 && (
                          <span className="text-xs text-muted-foreground self-center">
                            +{assignedWorkers.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recent tasks */}
                  {projectTasks.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Recent tasks</p>
                      {projectTasks.slice(0, 3).map((t) => (
                        <div key={t.id} className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-2.5 py-1.5">
                          <span className="text-xs truncate">{t.title}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${PRIORITY_COLOR[t.priority]}`}>
                            {t.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Created {new Date(p.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Workers section */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-primary" />
                Workers
              </CardTitle>
              <CardDescription>SMC staff and their active task load</CardDescription>
            </div>
            <Button size="sm" className="gap-2" onClick={() => { resetWorkerForm(); setWorkerOpen(true); }}>
              <UserPlus className="h-4 w-4" /> Add Worker
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
              <Users className="h-10 w-10 opacity-30" />
              <p className="text-sm">No workers yet. Add one to get started.</p>
              <Button size="sm" variant="outline" className="gap-2" onClick={() => { resetWorkerForm(); setWorkerOpen(true); }}>
                <UserPlus className="h-4 w-4" /> Add Worker
              </Button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {staff.map((w) => {
                const workerTasks = tasks.filter((t) => t.assigneeId === w.id);
                const activeTasks = workerTasks.filter((t) => t.status !== "done").length;
                const doneTasks = workerTasks.filter((t) => t.status === "done").length;
                return (
                  <div
                    key={w.id}
                    className="group flex items-start gap-3 rounded-xl border border-border/50 bg-card p-3 hover:border-primary/20 hover:shadow-sm transition-all"
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {initials(w.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-semibold truncate">{w.name}</p>
                        <button
                          onClick={() => openEditWorker(w)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-foreground"
                          aria-label="Edit worker"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground capitalize truncate">
                        {w.role.replace(/_/g, " ")}
                        {w.departmentName ? ` · ${w.departmentName}` : ""}
                      </p>
                      <div className="flex gap-2 mt-1.5">
                        <span className="text-[11px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                          {activeTasks} active
                        </span>
                        <span className="text-[11px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded-full font-medium">
                          {doneTasks} done
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── New Project Dialog ── */}
      <Dialog open={projOpen} onOpenChange={(o) => { if (!o) { setProjOpen(false); resetProjForm(); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
            <DialogDescription>Add a new SMC work project.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitProject} className="space-y-4">
            {projErr && <p className="text-sm text-destructive">{projErr}</p>}
            <div className="space-y-1.5">
              <Label htmlFor="proj-name">Project Name *</Label>
              <Input id="proj-name" value={projName} onChange={(e) => setProjName(e.target.value)} placeholder="e.g. Road Repair — Zone 4" />
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select value={projDept} onValueChange={setProjDept}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={projStatus} onValueChange={setProjStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="proj-progress">Progress (%)</Label>
                <Input
                  id="proj-progress"
                  type="number"
                  min={0} max={100}
                  value={projProgress}
                  onChange={(e) => setProjProgress(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setProjOpen(false); resetProjForm(); }}>Cancel</Button>
              <Button type="submit" disabled={projBusy}>
                {projBusy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── New Task Dialog ── */}
      <Dialog open={taskOpen} onOpenChange={(o) => { if (!o) { setTaskOpen(false); resetTaskForm(); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>Assign a task to a project and worker.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitTask} className="space-y-4">
            {taskErr && <p className="text-sm text-destructive">{taskErr}</p>}
            <div className="space-y-1.5">
              <Label htmlFor="task-title">Task Title *</Label>
              <Input id="task-title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="e.g. Inspect drainage pipes" />
            </div>
            <div className="space-y-1.5">
              <Label>Project</Label>
              <Select value={taskProject} onValueChange={setTaskProject}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assign to</Label>
              <Select value={taskAssignee} onValueChange={setTaskAssignee}>
                <SelectTrigger><SelectValue placeholder="Select worker" /></SelectTrigger>
                <SelectContent>
                  {staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={taskPriority} onValueChange={setTaskPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-due">Due Date</Label>
                <Input id="task-due" type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setTaskOpen(false); resetTaskForm(); }}>Cancel</Button>
              <Button type="submit" disabled={taskBusy}>
                {taskBusy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Add Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Add Worker Dialog ── */}
      <Dialog open={workerOpen} onOpenChange={(o) => { if (!o) { setWorkerOpen(false); resetWorkerForm(); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Worker</DialogTitle>
            <DialogDescription>Add a new SMC staff member. Default password is <code>password123</code> if left blank.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitWorker} className="space-y-4">
            {wErr && <p className="text-sm text-destructive">{wErr}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="w-name">Full Name *</Label>
                <Input id="w-name" value={wName} onChange={(e) => setWName(e.target.value)} placeholder="e.g. Ravi Kumar" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="w-email">Email *</Label>
                <Input id="w-email" type="email" value={wEmail} onChange={(e) => setWEmail(e.target.value)} placeholder="ravi@municipal.gov" />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={wRole} onValueChange={setWRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="department_head">Dept. Head</SelectItem>
                    <SelectItem value="auditor">Auditor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select value={wDept} onValueChange={setWDept}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="w-password">Password <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input id="w-password" type="password" value={wPassword} onChange={(e) => setWPassword(e.target.value)} placeholder="Leave blank for default" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setWorkerOpen(false); resetWorkerForm(); }}>Cancel</Button>
              <Button type="submit" disabled={wBusy} className="gap-2">
                {wBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                Add Worker
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Worker Dialog ── */}
      <Dialog open={editWorkerOpen} onOpenChange={(o) => { if (!o) { setEditWorkerOpen(false); setEditingWorker(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Worker</DialogTitle>
            <DialogDescription>Update this worker's details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitEditWorker} className="space-y-4">
            {ewErr && <p className="text-sm text-destructive">{ewErr}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="ew-name">Full Name *</Label>
                <Input id="ew-name" value={ewName} onChange={(e) => setEwName(e.target.value)} />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="ew-email">Email</Label>
                <Input id="ew-email" type="email" value={ewEmail} onChange={(e) => setEwEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={ewRole} onValueChange={setEwRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="department_head">Dept. Head</SelectItem>
                    <SelectItem value="auditor">Auditor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select value={ewDept} onValueChange={setEwDept}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setEditWorkerOpen(false); setEditingWorker(null); }}>Cancel</Button>
              <Button type="submit" disabled={ewBusy} className="gap-2">
                {ewBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
