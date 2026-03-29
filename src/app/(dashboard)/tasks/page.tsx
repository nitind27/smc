"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { GripVertical, Loader2 } from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";

const COLUMNS = [
  { id: "todo", title: "To Do", color: "bg-muted" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-500/10 border-blue-500/30" },
  { id: "review", title: "Review", color: "bg-amber-500/10 border-amber-500/30" },
  { id: "done", title: "Done", color: "bg-green-500/10 border-green-500/30" },
];

export default function TasksPage() {
  const { data: tasksData, isLoading, error } = useFetch<Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
  }>>("/api/tasks");
  const tasks = tasksData ?? [];

  const getTasksByStatus = (status: string) => tasks.filter((t) => t.status === status);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Task board</h1>
        <p className="text-muted-foreground">Kanban-style task progress</p>
      </div>

      {error && (
        <p className="text-sm text-destructive">Failed to load tasks. Check database connection.</p>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-4 min-w-max">
            {COLUMNS.map((col) => (
              <Card
                key={col.id}
                className={cn(
                  "w-[280px] shrink-0 border-2 flex flex-col glass-card",
                  col.color
                )}
              >
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    {col.title}
                    <Badge variant="secondary">{getTasksByStatus(col.id).length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-2 pt-0">
                  {getTasksByStatus(col.id).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-2 rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{task.title}</p>
                        <Badge variant="outline" className="mt-1.5 text-xs">{task.priority}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
}
