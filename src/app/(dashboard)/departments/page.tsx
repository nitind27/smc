"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Building2, Users, Plus, Loader2, AlertCircle, MessageSquareWarning,
  Briefcase, ChevronLeft, UserCheck, Pencil, X,
} from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { useAuth } from "@/providers/auth-provider";
import { motion } from "framer-motion";

type Dept = { id: string; name: string; headId: string | null; headName: string | null; staffCount: number; complaintCount: number; projectCount: number; };
type StaffMember = { id: string; name: string; email: string; role: string; departmentId?: string | null; departmentName?: string | null; };

export default function DepartmentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data: deptsData, isLoading, error, refetch } = useFetch<Dept[]>("/api/departments");
  const { data: allStaff } = useFetch<StaffMember[]>("/api/staff");
  const depts = deptsData ?? [];
  const staff = allStaff ?? [];

  const [activeDept, setActiveDept] = useState<Dept | null>(null);
  const [addDeptOpen, setAddDeptOpen] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignStaffId, setAssignStaffId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");

  const [setHeadOpen, setSetHeadOpen] = useState(false);
  const [headStaffId, setHeadStaffId] = useState("");
  const [settingHead, setSettingHead] = useState(false);

  const deptStaff = activeDept ? staff.filter(s => s.departmentId === activeDept.id) : [];
  const unassignedStaff = staff.filter(s => !s.departmentId);

  const createDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) { setCreateError("Name is required"); return; }
    setCreateError(""); setCreating(true);
    try {
      const res = await fetch("/api/departments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: deptName.trim() }),
      });
      if (!res.ok) { const d = await res.json(); setCreateError(d.error ?? "Failed"); return; }
      refetch(); setAddDeptOpen(false); setDeptName("");
    } catch { setCreateError("Network error"); }
    finally { setCreating(false); }
  };

  const assignStaff = async () => {
    if (!assignStaffId || !activeDept) return;
    setAssignError(""); setAssigning(true);
    try {
      const res = await fetch(`/api/staff/${assignStaffId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ departmentId: activeDept.id }),
      });
      if (!res.ok) { const d = await res.json(); setAssignError(d.error ?? "Failed"); return; }
      refetch(); setAssignOpen(false); setAssignStaffId("");
      // Refresh active dept
      const updated = await fetch("/api/departments").then(r => r.json());
      const found = updated.find((d: Dept) => d.id === activeDept.id);
      if (found) setActiveDept(found);
    } catch { setAssignError("Network error"); }
    finally { setAssigning(false); }
  };

  const removeFromDept = async (staffId: string) => {
    try {
      await fetch(`/api/staff/${staffId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ departmentId: null }),
      });
      refetch();
    } catch {}
  };

  const setDeptHead = async () => {
    if (!headStaffId || !activeDept) return;
    setSettingHead(true);
    try {
      await fetch(`/api/departments/${activeDept.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headId: headStaffId }),
      });
      refetch(); setSetHeadOpen(false); setHeadStaffId("");
      const updated = await fetch("/api/departments").then(r => r.json());
      const found = updated.find((d: Dept) => d.id === activeDept.id);
      if (found) setActiveDept(found);
    } catch {}
    finally { setSettingHead(false); }
  };

  // ── Department Detail View ──
  if (activeDept) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setActiveDept(null)} className="gap-1.5">
            <ChevronLeft className="h-4 w-4" /> All Departments
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{activeDept.name}</h1>
            <p className="text-muted-foreground text-sm">Head: {activeDept.headName ?? "Not assigned"}</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setSetHeadOpen(true)} className="gap-1.5">
                <UserCheck className="h-4 w-4" /> Set Head
              </Button>
              <Button size="sm" onClick={() => setAssignOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4" /> Add Staff
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Staff Members", value: activeDept.staffCount, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Complaints", value: activeDept.complaintCount, icon: MessageSquareWarning, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Projects", value: activeDept.projectCount, icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map(s => { const Icon = s.icon; return (
            <Card key={s.label} className="border-0 shadow-md text-center">
              <CardContent className="pt-4 pb-4">
                <div className={`p-2 rounded-xl ${s.bg} w-fit mx-auto mb-2`}><Icon className={`h-5 w-5 ${s.color}`} /></div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ); })}
        </div>

        {/* Staff Table */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-base">Staff Members ({deptStaff.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {deptStaff.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-muted-foreground gap-2">
                <Users className="h-10 w-10 opacity-20" />
                <p className="text-sm">No staff assigned to this department</p>
                {isAdmin && <Button size="sm" onClick={() => setAssignOpen(true)} className="gap-1.5 mt-2"><Plus className="h-4 w-4" />Add Staff</Button>}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    {isAdmin && <TableHead className="w-[80px]">Action</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deptStaff.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{s.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                          <span className="font-medium text-sm">{s.name}</span>
                          {s.id === activeDept.headId && <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">Head</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{s.email}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize text-xs">{s.role.replace(/_/g, " ")}</Badge></TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => removeFromDept(s.id)} className="text-destructive hover:text-destructive gap-1 h-7">
                            <X className="h-3.5 w-3.5" /> Remove
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Assign Staff Dialog */}
        <Dialog open={assignOpen} onOpenChange={o => { if (!o) { setAssignOpen(false); setAssignError(""); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Add Staff to {activeDept.name}</DialogTitle><DialogDescription>Select a staff member to assign to this department.</DialogDescription></DialogHeader>
            <div className="space-y-3">
              <Select value={assignStaffId} onValueChange={setAssignStaffId}>
                <SelectTrigger className="border-2"><SelectValue placeholder="Select staff member" /></SelectTrigger>
                <SelectContent>
                  {unassignedStaff.length === 0 ? <SelectItem value="none" disabled>No unassigned staff</SelectItem> :
                    unassignedStaff.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.role})</SelectItem>)}
                </SelectContent>
              </Select>
              {assignError && <p className="text-sm text-destructive">{assignError}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
              <Button onClick={assignStaff} disabled={!assignStaffId || assigning} className="gap-2">
                {assigning && <Loader2 className="h-4 w-4 animate-spin" />} Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Set Head Dialog */}
        <Dialog open={setHeadOpen} onOpenChange={o => { if (!o) setSetHeadOpen(false); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Set Department Head</DialogTitle></DialogHeader>
            <Select value={headStaffId} onValueChange={setHeadStaffId}>
              <SelectTrigger className="border-2"><SelectValue placeholder="Select department head" /></SelectTrigger>
              <SelectContent>
                {deptStaff.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSetHeadOpen(false)}>Cancel</Button>
              <Button onClick={setDeptHead} disabled={!headStaffId || settingHead} className="gap-2">
                {settingHead && <Loader2 className="h-4 w-4 animate-spin" />} Set as Head
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ── Department List ──
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" /> Departments
          </h1>
          <p className="text-muted-foreground text-sm">Manage departments and their staff</p>
        </div>
        {isAdmin && <Button onClick={() => setAddDeptOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Add Department</Button>}
      </div>

      {error && <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3"><AlertCircle className="h-4 w-4 text-destructive" /><p className="text-sm text-destructive">Failed to load departments.</p></div>}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : depts.length === 0 ? (
        <Card className="border-0 shadow-md"><CardContent className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
          <Building2 className="h-12 w-12 opacity-20" /><p>No departments yet.</p>
          {isAdmin && <Button size="sm" onClick={() => setAddDeptOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Create First Department</Button>}
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {depts.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer group" onClick={() => setActiveDept(d)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">{d.staffCount} staff</Badge>
                  </div>
                  <CardTitle className="text-lg mt-3 group-hover:text-primary transition-colors">{d.name}</CardTitle>
                  <CardDescription>Head: {d.headName ?? "Not assigned"}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1"><MessageSquareWarning className="h-3.5 w-3.5" />{d.complaintCount} complaints</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{d.projectCount} projects</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-white transition-colors">
                    Manage Department
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Department Dialog */}
      <Dialog open={addDeptOpen} onOpenChange={o => { if (!o) { setAddDeptOpen(false); setCreateError(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Department</DialogTitle></DialogHeader>
          <form onSubmit={createDept} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Department Name *</Label>
              <Input placeholder="e.g. Water Supply Department" value={deptName} onChange={e => setDeptName(e.target.value)} className="border-2" />
            </div>
            {createError && <p className="text-sm text-destructive">{createError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddDeptOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creating} className="gap-2">
                {creating && <Loader2 className="h-4 w-4 animate-spin" />} Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
