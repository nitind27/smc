"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useFetch } from "@/hooks/use-fetch";
import { Loader2, Plus, Trash2, Image as ImageIcon, Upload } from "lucide-react";

type Slide = {
  id: string;
  imageUrl: string;
  title: string | null;
  subtitle: string | null;
  linkUrl: string | null;
  order: number;
  active: boolean;
};

async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
  return data.url as string;
}

export default function HeroSliderAdminPage() {
  const { data: slidesData, isLoading, error, refetch } = useFetch<Slide[]>("/api/hero-slides?all=true");
  const slides = slidesData ?? [];

  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [title, setTitle] = React.useState("");
  const [subtitle, setSubtitle] = React.useState("");
  const [linkUrl, setLinkUrl] = React.useState("");
  const [order, setOrder] = React.useState("0");
  const [active, setActive] = React.useState(true);

  const reset = () => {
    setImageFile(null);
    setTitle("");
    setSubtitle("");
    setLinkUrl("");
    setOrder("0");
    setActive(true);
    setFormError(null);
  };

  const createSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!imageFile) {
      setFormError("Please select an image.");
      return;
    }
    setSubmitting(true);
    try {
      const imageUrl = await uploadFile(imageFile);
      const res = await fetch("/api/hero-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          title,
          subtitle,
          linkUrl,
          order: Number(order || 0),
          active,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Failed to create slide");
        return;
      }
      setOpen(false);
      reset();
      refetch();
    } catch (err: any) {
      setFormError(err?.message ?? "Failed to create slide");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (id: string, next: boolean) => {
    await fetch(`/api/hero-slides/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    refetch();
  };

  const updateOrder = async (id: string, nextOrder: number) => {
    await fetch(`/api/hero-slides/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: nextOrder }),
    });
    refetch();
  };

  const deleteSlide = async (id: string) => {
    if (!confirm("Delete this slide?")) return;
    await fetch(`/api/hero-slides/${id}`, { method: "DELETE" });
    refetch();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Homepage slider</h1>
          <p className="text-muted-foreground">Upload and manage images for the public homepage hero slider.</p>
        </div>
        <Button onClick={() => { reset(); setOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Add slide
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">Failed to load slides.</p>}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {slides.length === 0 ? (
            <p className="text-muted-foreground col-span-full">No slides yet.</p>
          ) : (
            slides
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((s) => (
                <Card key={s.id} className="glass-card overflow-hidden">
                  <div className="aspect-[16/9] bg-muted relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.imageUrl} alt={s.title ?? "Slide"} className="h-full w-full object-cover" />
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between gap-2">
                      <span className="truncate">{s.title ?? "Untitled"}</span>
                      <span className="text-xs text-muted-foreground">Order: {s.order}</span>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{s.subtitle ?? "—"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active</span>
                      <Switch checked={s.active} onCheckedChange={(v) => toggleActive(s.id, v)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground w-12">Order</Label>
                      <Input
                        value={String(s.order)}
                        onChange={(e) => updateOrder(s.id, Number(e.target.value || 0))}
                        className="h-9"
                      />
                    </div>
                    <Button variant="destructive" size="sm" className="w-full gap-2" onClick={() => deleteSlide(s.id)}>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Add slide
            </DialogTitle>
            <DialogDescription>Upload an image and optional text overlay.</DialogDescription>
          </DialogHeader>

          <form onSubmit={createSlide} className="space-y-4">
            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <div className="space-y-2">
              <Label>Image *</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <p className="text-xs text-muted-foreground">Recommended: 1600×900 or higher.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional" />
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Input value={order} onChange={(e) => setOrder(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Optional" />
            </div>

            <div className="space-y-2">
              <Label>Link URL</Label>
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="Optional (e.g. /track)" />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Only active slides show on homepage.</p>
              </div>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

