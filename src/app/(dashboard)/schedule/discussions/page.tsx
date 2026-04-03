"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MessageSquare, Plus, Send, User, ChevronLeft, AlertCircle } from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { useAuth } from "@/providers/auth-provider";
import { motion } from "framer-motion";

type Discussion = { id: string; meetingId: string; meetingTitle: string; topic: string; status: string; postCount: number; };
type Post = { id: string; content: string; userId: string; userName: string; userRole: string; createdAt: string; };
type ThreadData = { discussion: { id: string; topic: string; status: string; meetingTitle: string } | null; posts: Post[]; };

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime(), m = Math.floor(d / 60000);
  if (m < 1) return "just now"; if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const ROLE_COLOR: Record<string, string> = {
  admin: "bg-red-100 text-red-700", department_head: "bg-emerald-100 text-emerald-700",
  staff: "bg-blue-100 text-blue-700", auditor: "bg-violet-100 text-violet-700",
  po: "bg-orange-100 text-orange-700", collector: "bg-indigo-100 text-indigo-700",
  dc: "bg-slate-100 text-slate-700",
};

export default function DiscussionsPage() {
  const { user } = useAuth();
  const { data: discussionsData, isLoading, error, refetch } = useFetch<Discussion[]>("/api/discussions");
  const discussions = discussionsData ?? [];

  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [threadData, setThreadData] = useState<ThreadData | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // New discussion
  const [newOpen, setNewOpen] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newMeetingId, setNewMeetingId] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const { data: meetingsData } = useFetch<Array<{ id: string; title: string }>>("/api/meetings");
  const meetings = meetingsData ?? [];

  const canCreate = ["admin", "department_head", "staff"].includes(user?.role ?? "");

  const openThread = async (id: string) => {
    setActiveThread(id); setThreadLoading(true); setSendError("");
    try {
      const res = await fetch(`/api/discussions/${id}`);
      const data = await res.json();
      setThreadData(data);
    } catch { setThreadData(null); }
    finally { setThreadLoading(false); }
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [threadData?.posts]);

  const sendMessage = async () => {
    if (!message.trim() || !activeThread || !user) return;
    setSendError(""); setSending(true);
    try {
      const res = await fetch(`/api/discussions/${activeThread}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, content: message.trim() }),
      });
      if (!res.ok) { const d = await res.json(); setSendError(d.error ?? "Failed"); return; }
      const post = await res.json();
      setThreadData(prev => prev ? { ...prev, posts: [...prev.posts, post] } : prev);
      setMessage(""); refetch();
    } catch { setSendError("Network error"); }
    finally { setSending(false); }
  };

  const createDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim() || !newMeetingId) { setCreateError("Topic and meeting are required"); return; }
    setCreateError(""); setCreating(true);
    try {
      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId: newMeetingId, topic: newTopic.trim() }),
      });
      if (!res.ok) { const d = await res.json(); setCreateError(d.error ?? "Failed"); return; }
      refetch(); setNewOpen(false); setNewTopic(""); setNewMeetingId("");
    } catch { setCreateError("Network error"); }
    finally { setCreating(false); }
  };

  if (activeThread) {
    const disc = threadData?.discussion;
    const posts = threadData?.posts ?? [];
    return (
      <div className="space-y-4 h-full flex flex-col max-h-[calc(100vh-120px)]">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => { setActiveThread(null); setThreadData(null); }} className="gap-1.5">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          {disc && (
            <div>
              <h2 className="font-bold text-lg">{disc.topic}</h2>
              <p className="text-sm text-muted-foreground">Meeting: {disc.meetingTitle}</p>
            </div>
          )}
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-xl">
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950">
            {threadLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-muted-foreground gap-2">
                <MessageSquare className="h-10 w-10 opacity-20" />
                <p className="text-sm">No messages yet. Start the discussion!</p>
              </div>
            ) : posts.map((post, i) => {
              const isMe = post.userId === user?.id;
              return (
                <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                  className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
                  <div className="h-8 w-8 rounded-full bg-[#1a3a6b]/10 flex items-center justify-center shrink-0 text-xs font-bold text-[#1a3a6b]">
                    {post.userName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className={`max-w-[75%] space-y-1 ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700">{isMe ? "You" : post.userName}</span>
                      <Badge className={`${ROLE_COLOR[post.userRole] ?? "bg-gray-100 text-gray-600"} border-0 text-[10px] capitalize`}>{post.userRole.replace(/_/g, " ")}</Badge>
                      <span className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</span>
                    </div>
                    <div className={`rounded-2xl px-4 py-2.5 text-sm ${isMe ? "bg-[#1a3a6b] text-white rounded-tr-none" : "bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm"}`}>
                      {post.content}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <div className="p-3 border-t bg-white dark:bg-gray-900 space-y-2">
            {sendError && <p className="text-xs text-destructive">{sendError}</p>}
            <div className="flex gap-2">
              <Input value={message} onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Type a message..." className="border-2 focus:border-[#1a3a6b]" />
              <Button onClick={sendMessage} disabled={!message.trim() || sending} className="bg-[#1a3a6b] hover:bg-[#1a3a6b]/90 shrink-0">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" /> Discussions
          </h1>
          <p className="text-muted-foreground text-sm">Meeting discussion threads</p>
        </div>
        {canCreate && (
          <Button onClick={() => setNewOpen(true)} className="gap-2"><Plus className="h-4 w-4" />New Discussion</Button>
        )}
      </div>

      {error && <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3"><AlertCircle className="h-4 w-4 text-destructive" /><p className="text-sm text-destructive">Failed to load discussions.</p></div>}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : discussions.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
            <MessageSquare className="h-12 w-12 opacity-20" />
            <p className="text-lg font-medium">No discussions yet</p>
            {canCreate && <Button size="sm" onClick={() => setNewOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Start a Discussion</Button>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {discussions.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer group" onClick={() => openThread(d.id)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base group-hover:text-primary transition-colors">{d.topic}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">Meeting: {d.meetingTitle}</p>
                    </div>
                    <Badge className={d.status === "open" ? "bg-emerald-100 text-emerald-700 border-0" : "bg-gray-100 text-gray-600 border-0"}>{d.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <MessageSquare className="h-4 w-4" />
                    <span>{d.postCount} {d.postCount === 1 ? "message" : "messages"}</span>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5 group-hover:bg-primary group-hover:text-white transition-colors">
                    Open Thread
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* New Discussion Dialog */}
      <Dialog open={newOpen} onOpenChange={o => { if (!o) { setNewOpen(false); setCreateError(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Start New Discussion</DialogTitle></DialogHeader>
          <form onSubmit={createDiscussion} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Meeting *</Label>
              <Select value={newMeetingId} onValueChange={setNewMeetingId}>
                <SelectTrigger className="border-2"><SelectValue placeholder="Select a meeting" /></SelectTrigger>
                <SelectContent>
                  {meetings.length === 0 ? <SelectItem value="none" disabled>No meetings available</SelectItem> :
                    meetings.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Discussion Topic *</Label>
              <Input placeholder="e.g. Action items from Zone review" value={newTopic} onChange={e => setNewTopic(e.target.value)} className="border-2" />
            </div>
            {createError && <p className="text-sm text-destructive">{createError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creating} className="gap-2">
                {creating && <Loader2 className="h-4 w-4 animate-spin" />} Create Discussion
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
