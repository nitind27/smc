"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, AlertCircle, CheckCircle2, Circle, XCircle } from "lucide-react";
import { PageHero } from "@/components/public/PageHero";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/providers/language-provider";

const STATUS_MAP: Record<string, { label: string; variant: "secondary" | "default" | "destructive" | "outline" }> = {
  submitted: { label: "Pending", variant: "secondary" },
  assigned: { label: "Assigned", variant: "secondary" },
  in_progress: { label: "In Progress", variant: "default" },
  meeting_scheduled: { label: "Meeting Scheduled", variant: "secondary" },
  resolved: { label: "Completed", variant: "outline" },
  closed: { label: "Completed", variant: "outline" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export default function TrackComplaintPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
      <TrackComplaintContent />
    </Suspense>
  );
}

function TrackComplaintContent() {
  const { t } = useLanguage();
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complaint, setComplaint] = useState<{
    id: string;
    title: string;
    status: string;
    category: string;
    createdAt: string;
    updatedAt: string;
    location?: string;
  } | null>(null);

  const searchParams = useSearchParams();

  const statusRank: Record<string, number> = {
    submitted: 0,
    assigned: 1,
    in_progress: 2,
    meeting_scheduled: 3,
    resolved: 4,
    closed: 4,
    rejected: 5,
  };

  const steps = [
    { rank: 0, label: t("track.step.pending") },
    { rank: 1, label: t("track.step.assigned") },
    { rank: 2, label: t("track.step.inprogress") },
    { rank: 3, label: t("track.step.meeting") },
    { rank: 4, label: t("track.step.completed") },
    { rank: 5, label: t("track.step.rejected") },
  ] as const;

  const fetchComplaintById = useCallback(async (tid: string) => {
    if (!tid) return;
    setError(null);
    setComplaint(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/public/complaints/track?id=${encodeURIComponent(tid)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Complaint not found");
        return;
      }
      setComplaint(data);
    } catch {
      setError("Failed to fetch. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const tid = searchParams.get("id")?.trim();
    if (tid) {
      setId(tid);
      void fetchComplaintById(tid);
    }
  }, [searchParams, fetchComplaintById]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    void fetchComplaintById(id.trim());
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <PageHero title={t("track.title")} description={t("track.hero.desc")} icon={Search} />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="overflow-hidden rounded-2xl border border-border/50 shadow-lg shadow-black/5">
          <div className="h-1 w-full bg-gradient-to-r from-primary to-cyan-500" />
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Search className="h-4 w-4" />
              </span>
              {t("track.card.title")}
            </CardTitle>
            <CardDescription>{t("track.card.desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-3">
              <Input
                placeholder={t("track.placeholder")}
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="flex-1 rounded-xl border-2 focus:border-primary/50 focus:ring-primary/20"
              />
              <Button type="submit" disabled={loading} className="rounded-xl px-6">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("track.button")}
              </Button>
            </form>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-2 rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {complaint && (
                <motion.div key={complaint.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-mono text-sm font-medium text-muted-foreground">{complaint.id}</p>
                    <Badge variant={STATUS_MAP[complaint.status]?.variant ?? "secondary"} className="rounded-lg">
                      {STATUS_MAP[complaint.status]?.label ?? complaint.status}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium">{t("track.process")}</p>
                    {(() => {
                      const currentRank = statusRank[complaint.status] ?? 0;
                      const isRejectedComplaint = complaint.status === "rejected";
                      return (
                        <ol className="space-y-2">
                          {steps.map((s) => {
                            const done = s.rank < currentRank && !(isRejectedComplaint && s.rank === 4);
                            const current = s.rank === currentRank;
                            const isRejected = complaint.status === "rejected" && s.rank === 5;
                            return (
                              <li key={s.rank} className="flex items-center gap-2">
                                {done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                  : current ? (isRejected ? <XCircle className="h-4 w-4 text-destructive" /> : <Circle className="h-4 w-4 text-primary" />)
                                  : <Circle className="h-4 w-4 text-muted-foreground/60" />}
                                <span className={`text-sm ${current ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                                  {s.label}
                                </span>
                              </li>
                            );
                          })}
                        </ol>
                      );
                    })()}
                  </div>

                  <p className="font-semibold text-foreground">{complaint.title}</p>
                  {complaint.location && (
                    <p className="text-sm text-muted-foreground">{t("track.location")}: {complaint.location}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t("track.category")}: {complaint.category} · {t("track.submitted")}{" "}
                    {new Date(complaint.createdAt).toLocaleDateString()} · {t("track.updated")}{" "}
                    {complaint.updatedAt ? new Date(complaint.updatedAt).toLocaleDateString() : ""}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
