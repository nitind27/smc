"use client";

import { useFetch } from "@/hooks/use-fetch";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2 } from "lucide-react";
import { PageHero } from "@/components/public/PageHero";

export default function PublicMeetingsPage() {
  const { data: meetings, isLoading } = useFetch<Array<{
    id: string;
    title: string;
    agenda: string | null;
    meetingDate: string;
    meetingTime: string;
    status: string;
    departmentName: string | null;
  }>>("/api/public/meetings");

  const list = meetings ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHero
        title="Public Meetings"
        description="Meeting summaries and work progress — read-only transparency view."
        icon={Calendar}
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : list.length === 0 ? (
        <Card className="rounded-2xl border border-border/50 shadow-md">
          <CardContent className="py-16 text-center text-muted-foreground">
            No meetings to display yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {list.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group"
            >
              <Card className="overflow-hidden rounded-2xl border border-border/50 shadow-md transition-all hover:shadow-xl hover:border-primary/20 hover:-translate-y-0.5">
                <div className="h-1 w-full bg-gradient-to-r from-primary to-cyan-500" />
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Calendar className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle className="text-lg">{m.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        {new Date(m.meetingDate).toLocaleDateString()} · {m.meetingTime}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={m.status === "completed" ? "default" : "secondary"}
                    className="rounded-lg shrink-0"
                  >
                    {m.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  {m.agenda && <p className="text-sm text-muted-foreground">{m.agenda}</p>}
                  {m.departmentName && (
                    <p className="text-xs text-muted-foreground">Department: {m.departmentName}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
