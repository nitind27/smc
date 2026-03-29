"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useFetch } from "@/hooks/use-fetch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload, Loader2, CheckCircle2, AlertCircle, MapPin, Tag,
  FileText, ArrowLeft, X, Image as ImageIcon, Info, ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { value: "Street Light", label: "Street Light", icon: "💡" },
  { value: "Sanitation", label: "Sanitation / Garbage", icon: "🗑️" },
  { value: "Water", label: "Water Supply", icon: "💧" },
  { value: "Roads", label: "Roads & Potholes", icon: "🛣️" },
  { value: "Drainage", label: "Drainage / Sewage", icon: "🚰" },
  { value: "Parks", label: "Parks & Gardens", icon: "🌳" },
  { value: "Encroachment", label: "Encroachment", icon: "🚧" },
  { value: "Noise", label: "Noise Pollution", icon: "🔊" },
  { value: "Other", label: "Other", icon: "📋" },
];

const PRIORITIES = [
  { value: "low", label: "Low", desc: "Non-urgent, can wait", color: "bg-gray-500/20 text-gray-600 border-gray-500/30" },
  { value: "medium", label: "Medium", desc: "Needs attention soon", color: "bg-amber-500/20 text-amber-600 border-amber-500/30" },
  { value: "high", label: "High", desc: "Urgent, affects daily life", color: "bg-orange-500/20 text-orange-600 border-orange-500/30" },
  { value: "urgent", label: "Urgent", desc: "Emergency, immediate action", color: "bg-red-500/20 text-red-600 border-red-500/30" },
];

const STAFF_ROLES = ["admin", "department_head", "staff", "auditor"];

export default function SubmitComplaintPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ── Guard: staff roles should not be submitting complaints ──────────────
  if (user && STAFF_ROLES.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full mx-4"
        >
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-center">
            <CardContent className="pt-10 pb-8 space-y-5">
              <div className="flex justify-center">
                <div className="p-4 bg-amber-500/10 rounded-full">
                  <ShieldAlert className="h-12 w-12 text-amber-500" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold">Access Restricted</h2>
                <p className="text-muted-foreground text-sm mt-2">
                  As a <span className="font-semibold capitalize">{user.role.replace(/_/g, " ")}</span>, your role is to
                  <span className="font-semibold text-primary"> manage and resolve</span> complaints — not submit them.
                </p>
              </div>
              <div className="bg-muted/40 rounded-xl p-4 text-sm text-left space-y-2">
                <p className="font-medium text-muted-foreground">What you can do instead:</p>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    View and manage all incoming complaints
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    Assign complaints to staff or departments
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    Update status and resolve issues
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    Schedule meetings for complex complaints
                  </li>
                </ul>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button asChild>
                  <Link href="/complaints">Manage Complaints</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const valid = selected.filter(f => f.size <= 5 * 1024 * 1024);
    if (valid.length < selected.length) setError("Some files exceed 5MB and were skipped.");
    setFiles(prev => [...prev, ...valid].slice(0, 5));
  };

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  const uploadFiles = async (): Promise<string[]> => {
    if (files.length === 0) return [];
    setUploadingFiles(true);
    const urls: string[] = [];
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          urls.push(data.url ?? data.fileUrl ?? "");
        }
      }
    } finally {
      setUploadingFiles(false);
    }
    return urls.filter(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError("Title is required."); return; }
    if (!category) { setError("Please select a category."); return; }
    if (!description.trim()) { setError("Description is required."); return; }

    setSubmitting(true);
    try {
      const attachmentUrls = await uploadFiles();
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          priority,
          submittedBy: user?.id ?? user?.email ?? "anonymous",
          location: location.trim() || undefined,
          attachmentUrls,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? "Failed to submit."); return; }
      setSuccess(data.id);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ───────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 space-y-6"
        >
          <div className="flex justify-center">
            <div className="p-4 bg-emerald-500/20 rounded-full">
              <CheckCircle2 className="h-16 w-16 text-emerald-500" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Complaint Submitted!</h2>
            <p className="text-muted-foreground mt-2">Your complaint has been registered successfully.</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 inline-block">
            <p className="text-sm text-muted-foreground">Your Complaint ID</p>
            <p className="text-2xl font-mono font-bold text-primary">{success}</p>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Save this ID to track your complaint. You will be notified when it is assigned and resolved.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild variant="outline">
              <Link href="/complaints">View My Complaints</Link>
            </Button>
            <Button asChild>
              <Link href={`/complaints/${success}`}>Track This Complaint</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Citizen submit form ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/complaints"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Submit Complaint</h1>
                <p className="text-muted-foreground text-sm">Report an issue to the municipal authority</p>
              </div>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Category */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" /> Category
                </CardTitle>
                <CardDescription>What type of issue are you reporting?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 ${
                        category === cat.value
                          ? "border-primary bg-primary/10 shadow-md"
                          : "border-border bg-white/50 dark:bg-gray-800/50"
                      }`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-xs font-medium leading-tight">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Priority */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-primary" /> Priority Level
                </CardTitle>
                <CardDescription>How urgent is this issue?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={`flex flex-col gap-1 p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                        priority === p.value
                          ? `${p.color} border-current shadow-md`
                          : "border-border bg-white/50 dark:bg-gray-800/50 hover:border-primary/30"
                      }`}
                    >
                      <span className="text-sm font-bold">{p.label}</span>
                      <span className="text-xs opacity-70">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Complaint Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Subject / Title <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    placeholder="e.g. Street light not working near Block B"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-11 border-2 hover:border-primary/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                  <textarea
                    id="description"
                    className="flex min-h-[120px] w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-primary/50 transition-colors"
                    placeholder="Describe the issue in detail — when did it start, how it affects you..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">{description.length}/1000 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Location / Landmark
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g. Near Central Park, Block B, Ward 12"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-11 border-2 hover:border-primary/50 transition-colors"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Attachments */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" /> Attachments
                  <Badge variant="secondary" className="text-xs">Optional</Badge>
                </CardTitle>
                <CardDescription>Upload photos or documents (max 5 files, 5MB each)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  className="flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed border-input p-8 bg-muted/20 hover:bg-muted/40 hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Click to upload or drag & drop</p>
                  <p className="text-xs text-muted-foreground mt-1">Images (JPG, PNG) or PDF</p>
                  <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                </div>
                <AnimatePresence>
                  {files.map((file, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 rounded-lg border border-border/50 px-3 py-2 bg-white/50 dark:bg-gray-800/50"
                    >
                      <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-start gap-3 rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-3">
              <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-400">
                <p className="font-medium">What happens next?</p>
                <p className="text-xs mt-0.5 opacity-80">
                  Your complaint will be reviewed and assigned to the relevant department within 24 hours. Track it using your complaint ID.
                </p>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || uploadingFiles}
                className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg hover:shadow-xl transition-all">
                {(submitting || uploadingFiles) ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />{uploadingFiles ? "Uploading..." : "Submitting..."}</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" />Submit Complaint</>
                )}
              </Button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
