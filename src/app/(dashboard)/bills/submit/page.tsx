"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useFetch } from "@/hooks/use-fetch";

const ROLE_TO_USER_ID: Record<string, string> = {
  admin: "user-admin",
  department_head: "user-head-1",
  staff: "user-staff-1",
  auditor: "user-admin",
  public: "user-admin",
};

export default function SubmitBillPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: departmentsData } = useFetch<Array<{ id: string; name: string }>>("/api/departments");
  const departments = departmentsData ?? [];
  const submittedBy = user ? (ROLE_TO_USER_ID[user.role] ?? user.id) : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Untitled",
          amount: amount === "" ? 0 : Number(amount),
          submittedBy: submittedBy ? String(submittedBy).trim() : undefined,
          departmentId: departmentId && departmentId !== "__none__" ? departmentId : undefined,
          description: description || undefined,
        }),
      });
      const text = await res.text();
      let data: { error?: string } = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: "Invalid response from server." };
      }
      if (!res.ok) {
        setError(data.error ?? "Failed to create bill.");
        return;
      }
      router.push("/bills");
    } catch (err) {
      setError("Network or unexpected error. Check the console.");
      console.error("Bill submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Submit bill</h1>
        <p className="text-muted-foreground">Submit a bill for approval workflow</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Bill details</CardTitle>
          <CardDescription>Fill in the bill information for approval</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="e.g. Road repair materials" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input id="amount" type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  {departments.length === 0 ? (
                    <SelectItem value="__none__" disabled>No departments</SelectItem>
                  ) : (
                    departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Brief description and justification"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Attach supporting documents</Label>
              <div className="flex items-center justify-center w-full rounded-lg border border-dashed border-input p-6 bg-muted/30">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">Upload invoice or receipt</p>
                </div>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit for approval
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
