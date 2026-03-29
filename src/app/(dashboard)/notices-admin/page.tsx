"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useFetch } from "@/hooks/use-fetch";
import { Loader2, Plus, Megaphone, FileText } from "lucide-react";

type Notice = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  publishedAt: string;
  pdfUrl: string | null;
};

const NOTICE_TYPES = [
  { value: "announcement", label: "Announcement" },
  { value: "update", label: "Update" },
  { value: "event", label: "Event" },
  { value: "other", label: "Other" },
];

export default function NoticesAdminPage() {
  const { data: noticesData, isLoading, error, refetch } = useFetch<Notice[]>("/api/notices");
  const notices = noticesData ?? [];

  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [type, setType] = React.useState("announcement");
  const [pdfFile, setPdfFile] = React.useState<File | null>(null);

  const resetForm = () => {
    setTitle("");
    setBody("");
    setType("announcement");
    setPdfFile(null);
    setFormError(null);

    const fileInput = document.getElementById("notice-pdf") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const createNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Title is required.");
      return;
    }

    if (!pdfFile) {
      setFormError("PDF file is required.");
      return;
    }

    if (pdfFile.type !== "application/pdf") {
      setFormError("Only PDF files are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("body", body.trim()); // ✅ Added body
    formData.append("type", type);
    formData.append("pdf", pdfFile);

    setSubmitting(true);
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFormError(data.error ?? "Failed to upload notice PDF");
        return;
      }

      resetForm();
      refetch();
    } catch (error) {
      console.error("Create notice error:", error);
      setFormError("Failed to upload notice PDF.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Manage Notices
          </h1>
          <p className="text-muted-foreground">
            Upload notice PDFs that will appear for users under <code>Notices</code>.
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Upload a new notice PDF</CardTitle>
          <CardDescription>
            Citizens will see this on the public notices page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createNotice} className="space-y-4">
            {formError ? (
              <p className="text-sm text-destructive">{formError}</p>
            ) : null}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="notice-title">Title *</Label>
              <Input
                id="notice-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notice title"
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="notice-type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="notice-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTICE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Body / Summary */}
            <div className="space-y-2">
              <Label htmlFor="notice-body">Short Description (optional)</Label>
              <textarea
                id="notice-body"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Write a short summary of this notice..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            {/* PDF Upload */}
            <div className="space-y-2">
              <Label htmlFor="notice-pdf">Upload PDF *</Label>
              <Input
                id="notice-pdf"
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">
                Only PDF files are allowed.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Upload PDF
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Notices */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Existing Notices</CardTitle>
          <CardDescription>Latest notices are shown first.</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-destructive">Failed to load notices.</p>
          ) : null}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : notices.length === 0 ? (
            <p className="text-muted-foreground">No notices yet.</p>
          ) : (
            <div className="space-y-4">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="rounded-xl border border-border/50 p-4 bg-card"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{n.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(n.publishedAt).toLocaleString()}
                      </p>
                    </div>

                    <Badge variant="outline" className="shrink-0 capitalize">
                      {n.type}
                    </Badge>
                  </div>

                  {/* Optional Description */}
                  {n.body ? (
                    <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {n.body}
                    </p>
                  ) : null}

                  {/* PDF Link */}
                  {n.pdfUrl ? (
                    <a
                      href={n.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      View PDF
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}