"use client";

import { useFetch } from "@/hooks/use-fetch";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bell, Loader2, FileText, ExternalLink, Search, ChevronLeft,
  ChevronRight, Calendar, Tag, AlertCircle, Megaphone,
  BookOpen, Star, Info, X, Download, Eye,
} from "lucide-react";

type Notice = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  publishedAt: string;
  pdfUrl: string | null;
};

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType; accent: string }> = {
  announcement: { label: "Announcement", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: Megaphone, accent: "#1d4ed8" },
  update:       { label: "Update",       color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: Bell, accent: "#047857" },
  event:        { label: "Event",        color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200", icon: Star, accent: "#6d28d9" },
  tender:       { label: "Tender",       color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: BookOpen, accent: "#b45309" },
  circular:     { label: "Circular",     color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", icon: AlertCircle, accent: "#be123c" },
  other:        { label: "Other",        color: "text-gray-700", bg: "bg-gray-50", border: "border-gray-200", icon: Info, accent: "#374151" },
};

const getTypeConf = (type: string) => TYPE_CONFIG[type] ?? TYPE_CONFIG.other;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Marquee Ticker ───────────────────────────────────────────────────────────
function MarqueeTicker({ notices }: { notices: Notice[] }) {
  const items = notices.slice(0, 10);
  if (items.length === 0) return null;
  return (
    <div className="bg-[#1a3a6b] text-white flex items-stretch overflow-hidden rounded-xl shadow-lg">
      <div className="bg-red-600 flex items-center px-4 py-2.5 shrink-0 gap-2 font-bold text-sm tracking-wide uppercase">
        <Bell className="h-4 w-4 animate-pulse" />
        <span className="hidden sm:inline">Latest</span>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <motion.div
          className="flex gap-8 whitespace-nowrap py-2.5 px-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: items.length * 6, repeat: Infinity, ease: "linear" }}
        >
          {[...items, ...items].map((n, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-sm">
              <span className="text-yellow-300">◆</span>
              <span className="font-medium">{n.title}</span>
              <span className="text-white/50 text-xs">{formatDate(n.publishedAt)}</span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ── Featured Slider ──────────────────────────────────────────────────────────
function FeaturedSlider({ notices }: { notices: Notice[] }) {
  const [current, setCurrent] = useState(0);
  const featured = notices.slice(0, 5);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % featured.length), 4000);
  };
  useEffect(() => {
    if (featured.length < 2) return;
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [featured.length]);

  const go = (dir: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrent(c => (c + dir + featured.length) % featured.length);
    startTimer();
  };

  if (featured.length === 0) return null;
  const n = featured[current];
  const conf = getTypeConf(n.type);
  const Icon = conf.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-[#1a3a6b]/20 shadow-2xl bg-gradient-to-br from-[#1a3a6b] to-[#0f2347] text-white min-h-[220px] flex flex-col justify-between">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 right-4 w-40 h-40 rounded-full border-4 border-white" />
        <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full border-2 border-white" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 rounded-full border border-white" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={n.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="relative p-6 md:p-8 flex-1"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm shrink-0">
              <Icon className="h-7 w-7 text-yellow-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className="bg-yellow-400 text-yellow-900 border-0 text-xs font-bold uppercase tracking-wide">
                  {conf.label}
                </Badge>
                <span className="text-white/60 text-xs flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {formatDate(n.publishedAt)}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold leading-snug mb-2">{n.title}</h2>
              {n.body && (
                <p className="text-white/70 text-sm line-clamp-2 leading-relaxed">{n.body}</p>
              )}
              {n.pdfUrl && (
                <a href={n.pdfUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex">
                  <Button size="sm" className="bg-white text-[#1a3a6b] hover:bg-white/90 font-semibold gap-2 shadow-lg">
                    <FileText className="h-4 w-4" /> View PDF
                  </Button>
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      {featured.length > 1 && (
        <>
          <div className="relative flex items-center justify-between px-6 pb-4">
            <div className="flex gap-1.5">
              {featured.map((_, i) => (
                <button key={i} onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setCurrent(i); startTimer(); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-yellow-400" : "w-1.5 bg-white/30"}`} />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => go(-1)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => go(1)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── PDF Viewer Modal ─────────────────────────────────────────────────────────
function PDFModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b bg-[#1a3a6b] text-white rounded-t-2xl">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-5 w-5 text-yellow-300 shrink-0" />
            <span className="font-semibold text-sm truncate">{title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a href={url} download target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-1 h-8">
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
            </a>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <iframe src={`${url}#toolbar=0`} className="w-full h-full min-h-[70vh]" title={title} />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Notice Card ──────────────────────────────────────────────────────────────
function NoticeCard({ notice, index, onViewPDF }: { notice: Notice; index: number; onViewPDF: (n: Notice) => void }) {
  const conf = getTypeConf(notice.type);
  const Icon = conf.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group"
    >
      <div className={`relative overflow-hidden rounded-2xl border-2 ${conf.border} bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5`}>
        {/* Left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: conf.accent }} />

        <div className="pl-5 pr-4 py-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`p-2.5 rounded-xl ${conf.bg} shrink-0 mt-0.5`}>
              <Icon className={`h-5 w-5 ${conf.color}`} />
            </div>

            <div className="flex-1 min-w-0">
              {/* Top row */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-[#1a3a6b] transition-colors">
                  {notice.title}
                </h3>
                <Badge className={`${conf.bg} ${conf.color} border ${conf.border} text-xs shrink-0 capitalize font-semibold`}>
                  {conf.label}
                </Badge>
              </div>

              {/* Body */}
              {notice.body && (
                <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 mb-2">{notice.body}</p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(notice.publishedAt)}
                </span>
                {notice.pdfUrl && (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onViewPDF(notice)}
                      className={`inline-flex items-center gap-1 text-xs font-semibold ${conf.color} hover:underline`}
                    >
                      <Eye className="h-3 w-3" /> View PDF
                    </button>
                    <span className="text-gray-300">|</span>
                    <a href={notice.pdfUrl} download target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700">
                      <Download className="h-3 w-3" /> Download
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function NoticesPage() {
  const { data: notices, isLoading, error } = useFetch<Notice[]>("/api/notices");
  const list = notices ?? [];

  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [pdfModal, setPdfModal] = useState<Notice | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;

  const types = ["all", ...Array.from(new Set(list.map(n => n.type)))];

  const filtered = list.filter(n => {
    const matchType = activeType === "all" || n.type === activeType;
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) ||
      (n.body ?? "").toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const recentWithPDF = list.filter(n => n.pdfUrl).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Government Header Banner ── */}
      <div className="bg-[#1a3a6b] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Megaphone className="h-8 w-8 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Notices & Announcements
              </h1>
              <p className="text-white/70 text-sm mt-0.5">
                Official notices, circulars, tenders and announcements from SMC
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">

        {/* ── Marquee Ticker ── */}
        {!isLoading && list.length > 0 && <MarqueeTicker notices={list} />}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#1a3a6b]" />
            <p className="text-gray-500">Loading notices...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-16 gap-3 text-red-600">
            <AlertCircle className="h-12 w-12 opacity-50" />
            <p className="font-medium">Failed to load notices</p>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3 text-gray-400">
            <Bell className="h-16 w-16 opacity-20" />
            <p className="text-lg font-medium">No notices published yet</p>
          </div>
        ) : (
          <>
            {/* ── Main Layout ── */}
            <div className="grid gap-6 lg:grid-cols-3">

              {/* Left: Featured Slider + Grid */}
              <div className="lg:col-span-2 space-y-6">

                {/* Featured Slider */}
                <FeaturedSlider notices={list} />

                {/* Search + Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search notices..."
                      value={search}
                      onChange={e => { setSearch(e.target.value); setPage(1); }}
                      className="pl-9 border-2 border-gray-200 focus:border-[#1a3a6b] h-11 bg-white"
                    />
                    {search && (
                      <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Type Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  {types.map(t => {
                    const conf = t === "all" ? null : getTypeConf(t);
                    const isActive = activeType === t;
                    return (
                      <button
                        key={t}
                        onClick={() => { setActiveType(t); setPage(1); }}
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
                          isActive
                            ? "bg-[#1a3a6b] text-white border-[#1a3a6b] shadow-md"
                            : "bg-white text-gray-600 border-gray-200 hover:border-[#1a3a6b]/40"
                        }`}
                      >
                        {t === "all" ? "All Notices" : (conf?.label ?? t)}
                        <span className={`ml-1.5 text-xs ${isActive ? "text-white/70" : "text-gray-400"}`}>
                          ({t === "all" ? list.length : list.filter(n => n.type === t).length})
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Notices Grid */}
                {paginated.length === 0 ? (
                  <div className="flex flex-col items-center py-12 gap-3 text-gray-400">
                    <Search className="h-10 w-10 opacity-30" />
                    <p>No notices match your search</p>
                    <Button variant="outline" size="sm" onClick={() => { setSearch(""); setActiveType("all"); }}>
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {paginated.map((n, i) => (
                      <NoticeCard key={n.id} notice={n} index={i} onViewPDF={setPdfModal} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)}
                        className={`h-8 w-8 rounded-lg text-sm font-semibold transition-all ${
                          p === page ? "bg-[#1a3a6b] text-white shadow-md" : "bg-white border border-gray-200 text-gray-600 hover:border-[#1a3a6b]/40"
                        }`}>
                        {p}
                      </button>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="space-y-5">

                {/* Stats Box */}
                <div className="rounded-2xl border-2 border-[#1a3a6b]/20 bg-white shadow-md overflow-hidden">
                  <div className="bg-[#1a3a6b] px-4 py-3">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                      <Bell className="h-4 w-4 text-yellow-300" /> Notice Summary
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {Object.entries(TYPE_CONFIG).map(([key, conf]) => {
                      const count = list.filter(n => n.type === key).length;
                      if (count === 0) return null;
                      const Icon = conf.icon;
                      return (
                        <button key={key} onClick={() => { setActiveType(key); setPage(1); }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border ${conf.border} ${conf.bg} hover:shadow-sm transition-all`}>
                          <div className="flex items-center gap-2">
                            <Icon className={`h-4 w-4 ${conf.color}`} />
                            <span className={`text-sm font-semibold ${conf.color}`}>{conf.label}</span>
                          </div>
                          <span className={`text-sm font-bold ${conf.color}`}>{count}</span>
                        </button>
                      );
                    })}
                    <button onClick={() => { setActiveType("all"); setPage(1); }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl border border-[#1a3a6b]/20 bg-[#1a3a6b]/5 hover:bg-[#1a3a6b]/10 transition-all">
                      <span className="text-sm font-semibold text-[#1a3a6b]">Total Notices</span>
                      <span className="text-sm font-bold text-[#1a3a6b]">{list.length}</span>
                    </button>
                  </div>
                </div>

                {/* Recent PDFs */}
                {recentWithPDF.length > 0 && (
                  <div className="rounded-2xl border-2 border-amber-200 bg-white shadow-md overflow-hidden">
                    <div className="bg-amber-500 px-4 py-3">
                      <h3 className="text-white font-bold text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Recent Documents
                      </h3>
                    </div>
                    <div className="p-3 space-y-2">
                      {recentWithPDF.map(n => (
                        <div key={n.id} className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-amber-50 transition-colors group">
                          <div className="p-1.5 bg-amber-100 rounded-lg shrink-0 mt-0.5">
                            <FileText className="h-3.5 w-3.5 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{n.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{formatDate(n.publishedAt)}</p>
                          </div>
                          <div className="flex flex-col gap-1 shrink-0">
                            <button onClick={() => setPdfModal(n)}
                              className="text-xs text-amber-600 hover:underline font-medium flex items-center gap-0.5">
                              <Eye className="h-3 w-3" /> View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Important Notice Box */}
                <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                    <h3 className="font-bold text-red-700 text-sm">Important Notice</h3>
                  </div>
                  <p className="text-xs text-red-600 leading-relaxed">
                    All notices published here are official communications from the Smart Municipal Corporation.
                    For queries, contact the municipal office.
                  </p>
                </div>

                {/* Quick Links */}
                <div className="rounded-2xl border-2 border-gray-200 bg-white shadow-md overflow-hidden">
                  <div className="bg-gray-700 px-4 py-3">
                    <h3 className="text-white font-bold text-sm">Quick Links</h3>
                  </div>
                  <div className="p-3 space-y-1">
                    {[
                      { label: "Raise a Complaint", href: "/raise-complaint" },
                      { label: "Track Complaint", href: "/track" },
                      { label: "Government Schemes", href: "/schemes" },
                      { label: "Public Meetings", href: "/meetings" },
                    ].map(link => (
                      <a key={link.href} href={link.href}
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 hover:text-[#1a3a6b] font-medium transition-colors group">
                        {link.label}
                        <ChevronRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-[#1a3a6b] transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* PDF Modal */}
      <AnimatePresence>
        {pdfModal && (
          <PDFModal url={pdfModal.pdfUrl!} title={pdfModal.title} onClose={() => setPdfModal(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
