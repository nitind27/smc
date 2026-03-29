"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFetch } from "@/hooks/use-fetch";
import { Loader2 } from "lucide-react";

export default function DiscussionsPage() {
  const { data: discussionsData, isLoading, error } = useFetch<Array<{
    id: string;
    meetingId: string;
    meetingTitle: string;
    topic: string;
    status: string;
    postCount: number;
  }>>("/api/discussions");
  const discussions = discussionsData ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Discussions</h1>
        <p className="text-muted-foreground">Meeting discussion threads</p>
      </div>

      {error && <p className="text-sm text-destructive">Failed to load discussions.</p>}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.length === 0 ? (
            <p className="text-muted-foreground">No discussions yet.</p>
          ) : (
            discussions.map((d) => (
              <Card key={d.id} className="glass-card">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{d.topic}</CardTitle>
                    <CardDescription>Meeting {d.meetingTitle} · {d.postCount} posts</CardDescription>
                  </div>
                  <Badge variant={d.status === "open" ? "secondary" : "success"}>{d.status}</Badge>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm">View thread</Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
