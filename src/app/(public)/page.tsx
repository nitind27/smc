"use client";

import { useFetch } from "@/hooks/use-fetch";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import {
  Search, FilePlus, LayoutDashboard, MessageSquareWarning,
  CheckCircle2, Clock, Eye, ArrowRight, Bell, IndianRupee,
  BookOpen, MapPin, Phone, FileText, Briefcase, Megaphone,
  HelpCircle, Image, Building2, Droplets, Zap, Trash2,
  ChevronRight, Star, Play, X, ExternalLink, TrendingUp,
  Users, Calendar, Shield, Globe, Accessibility,
} from "lucide-react";
import { AnimatedNumber } from "@/components/public/AnimatedNumber";
import { HeroSlider } from "@/components/public/HeroSlider";
import { Badge } from "@/components/ui/badge";

// ── Services Data ─────────────────────────────────────────────────────────────
const SERVICES = [
  { title: "Raise Complaint", desc: "Report civic issues", href: "/raise-complaint", icon: FilePlus, color: "text-red-600", bg: "bg-red-50", border: "border-red-100", hot: true },
  { title: "Track Complaint", desc: "Check complaint status", href: "/track", icon: Search, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", hot: false },
  { title: "Water Bill", desc: "View & download bill", href: "/services#water", icon: Droplets, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-100", hot: false },
  { title: "Utility Bills", desc: "Electricity & tax", href: "/services#utility", icon: Zap, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", hot: false },
  { title: "Download Forms", desc: "Official PDF forms", href: "/services#forms", icon: FileText, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100", hot: false },
  { title: "Notices", desc: "Official announcements", href: "/notices", icon: Megaphone, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", hot: false },
  { title: "Public Works", desc: "Ongoing projects", href: "/public-works", icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", hot: false },
  { title: "Budget", desc: "Municipal expenditure", href: "/budget", icon: IndianRupee, color: "text-green-600", bg: "bg-green-50", border: "border-green-100", hot: false },
  { title: "RTI Application", desc: "Right to Information", href: "/rti", icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", hot: false },
  { title: "City Map", desc: "Wards & zones", href: "/city-map", icon: MapPin, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", hot: false },
  { title: "Help & FAQ", desc: "Get assistance", href: "/help", icon: HelpCircle, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100", hot: false },
  { title: "Emergency", desc: "Helpline numbers", href: "/emergency", icon: Phone, color: "text-red-700", bg: "bg-red-50", border: "border-red-100", hot: true },
  { title: "Gallery", desc: "City development", href: "/gallery", icon: Image, color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-100", hot: false },
  { title: "Schemes", desc: "Govt welfare schemes", href: "/schemes", icon: Star, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-100", hot: false },
  { title: "Feedback", desc: "Rate our services", href: "/feedback", icon: MessageSquareWarning, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", hot: false },
  { title: "Transparency", desc: "Open data portal", href: "/transparency", icon: Eye, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100", hot: false },
];

const NEWS = [
  { title: "New Water Pipeline Project Launched in Ward 5-8", date: "Mar 28, 2026", type: "Project", color: "bg-blue-100 text-blue-700" },
  { title: "Road Repair Work Completed on Main Highway", date: "Mar 25, 2026", type: "Update", color: "bg-emerald-100 text-emerald-700" },
  { title: "Smart City Initiative: 500 New LED Street Lights", date: "Mar 22, 2026", type: "News", color: "bg-violet-100 text-violet-700" },
  { title: "Municipal Budget 2026-27 Approved by Council", date: "Mar 20, 2026", type: "Notice", color: "bg-amber-100 text-amber-700" },
  { title: "Cleanliness Drive: 3000 Households Covered", date: "Mar 18, 2026", type: "Event", color: "bg-teal-100 text-teal-700" },
];

const GALLERY_ITEMS = [
  { title: "New Flyover Construction", tag: "Infrastructure", gradient: "from-blue-600 to-cyan-500" },
  { title: "Smart Park Development", tag: "Parks", gradient: "from-emerald-600 to-green-400" },
  { title: "Solar Street Lighting", tag: "Energy", gradient: "from-amber-500 to-yellow-400" },
  { title: "Water Treatment Plant", tag: "Water", gradient: "from-cyan-600 to-blue-400" },
  { title: "Community Center", tag: "Social", gradient: "from-violet-600 to-purple-400" },
  { title: "Waste Management Unit", tag: "Sanitation", gradient: "from-green-600 to-emerald-400" },
];

// ── Search Bar Component ──────────────────────────────────────────────────────
function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof SERVICES>([]);
  const [open, setOpen] = useState(false);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    const filtered = SERVICES.filter(s =>
      s.title.toLowerCase().includes(q.toLowerCase()) ||
      s.desc.toLowerCase().includes(q.toLowerCase())
    );
    setResults(filtered);
    setOpen(true);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-white/50 shadow-2xl px-4 py-3">
        <Search className="h-5 w-5 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search services, complaints, notices, forms..."
          value={query}
          onChange={e => handleSearch(e.target.value)}
          className="flex-1 bg-transparent text-gray-800 placeholder:text-gray-400 outline-none text-sm font-medium"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); setOpen(false); }}>
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {results.map(r => {
            const Icon = r.icon;
            return (
              <Link key={r.href} href={r.href} onClick={() => { setQuery(""); setOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                <div className={`p-2 rounded-lg ${r.bg}`}><Icon className={`h-4 w-4 ${r.color}`} /></div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{r.title}</p>
                  <p className="text-xs text-gray-500">{r.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 ml-auto" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="h-10 w-10 bg-gray-200 rounded-xl mb-3" />
      <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-32 bg-gray-100 rounded" />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PublicHomePage() {
  const { data: stats, isLoading } = useFetch<{
    totalComplaints: number; completedWorks: number;
    pendingIssues: number; resolutionRate: number;
    activeProjects: number;
  }>("/api/public/stats");

  const [activeNewsTab, setActiveNewsTab] = useState<"all" | "project" | "notice" | "event">("all");
  const filteredNews = activeNewsTab === "all" ? NEWS : NEWS.filter(n => n.type.toLowerCase() === activeNewsTab);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero Section ── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-black">
        <div className="absolute inset-0">
          <HeroSlider mode="background" className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-black/80" />
        </div>
        <div className="relative z-10 container mx-auto px-4 max-w-5xl text-center space-y-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              <Shield className="h-3.5 w-3.5 text-yellow-300" />
              Government of India — Smart Municipal Corporation
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Smart Municipal<br />
            <span className="bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
              Citizen Services Portal
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-white/75 text-lg max-w-xl mx-auto">
            Access all municipal services, track complaints, view budgets and stay informed — all in one place.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlobalSearch />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold gap-2 rounded-xl shadow-lg">
              <Link href="/raise-complaint"><FilePlus className="h-5 w-5" /> Raise Complaint</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2 rounded-xl backdrop-blur-sm">
              <Link href="/track"><Search className="h-5 w-5" /> Track Status</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2 rounded-xl backdrop-blur-sm">
              <Link href="/services"><Building2 className="h-5 w-5" /> All Services</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── Live Stats Bar ── */}
      <section className="bg-[#1a3a6b] text-white py-6">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-8 w-16 bg-white/20 rounded mx-auto mb-1" />
                  <div className="h-3 w-20 bg-white/10 rounded mx-auto" />
                </div>
              ))
            ) : (
              [
                { label: "Complaints Filed", value: stats?.totalComplaints ?? 0, icon: MessageSquareWarning, color: "text-yellow-300" },
                { label: "Issues Resolved", value: stats?.completedWorks ?? 0, icon: CheckCircle2, color: "text-emerald-300" },
                { label: "Pending Issues", value: stats?.pendingIssues ?? 0, icon: Clock, color: "text-amber-300" },
                { label: "Active Projects", value: stats?.activeProjects ?? 0, icon: Briefcase, color: "text-blue-300" },
                { label: "Resolution Rate", value: stats?.resolutionRate ?? 0, suffix: "%", icon: TrendingUp, color: "text-violet-300" },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Icon className={`h-5 w-5 ${s.color} mx-auto mb-1`} />
                    <p className={`text-2xl font-bold ${s.color}`}>
                      <AnimatedNumber value={s.value} suffix={s.suffix ?? ""} />
                    </p>
                    <p className="text-xs text-white/60">{s.label}</p>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ── Services Grid ── */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#1a3a6b]/60 mb-2">Citizen Services</p>
            <h2 className="text-3xl font-bold text-[#1a3a6b]">All Municipal Services</h2>
            <p className="text-gray-500 text-sm mt-2">Quick access to all government services in one place</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {SERVICES.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div key={service.href} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                  <Link href={service.href}
                    className={`group flex flex-col items-center gap-2 p-4 rounded-2xl border-2 ${service.border} ${service.bg} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center relative`}>
                    {service.hot && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">HOT</span>
                    )}
                    <div className={`p-2.5 rounded-xl bg-white shadow-sm group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-5 w-5 ${service.color}`} />
                    </div>
                    <p className="text-xs font-bold text-gray-800 leading-tight">{service.title}</p>
                    <p className="text-[10px] text-gray-500 leading-tight hidden sm:block">{service.desc}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── News & Events + Gallery ── */}
      <section className="py-14 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-3">

            {/* News & Events */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#1a3a6b]/60 mb-1">Latest Updates</p>
                  <h2 className="text-2xl font-bold text-[#1a3a6b]">City News & Events</h2>
                </div>
                <Link href="/notices" className="text-sm font-semibold text-[#1a3a6b] hover:underline flex items-center gap-1">
                  View all <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="flex gap-2 flex-wrap">
                {(["all", "project", "notice", "event"] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveNewsTab(tab)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                      activeNewsTab === tab ? "bg-[#1a3a6b] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#1a3a6b]/40"
                    }`}>
                    {tab === "all" ? "All" : tab + "s"}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                {filteredNews.map((news, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 flex items-start gap-4 group cursor-pointer">
                    <div className="h-2 w-2 rounded-full bg-[#1a3a6b] mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm group-hover:text-[#1a3a6b] transition-colors">{news.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${news.color}`}>{news.type}</span>
                        <span className="text-xs text-gray-400">{news.date}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#1a3a6b] transition-colors shrink-0 mt-1" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Links Sidebar */}
            <div className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#1a3a6b]/60 mb-1">Quick Access</p>
                <h2 className="text-2xl font-bold text-[#1a3a6b]">Important Links</h2>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Water Bill Payment", href: "/services#water", icon: Droplets, color: "text-cyan-600", bg: "bg-cyan-50" },
                  { label: "Download Forms", href: "/services#forms", icon: FileText, color: "text-violet-600", bg: "bg-violet-50" },
                  { label: "Ward Officer Info", href: "/city-map", icon: MapPin, color: "text-rose-600", bg: "bg-rose-50" },
                  { label: "Emergency Contacts", href: "/emergency", icon: Phone, color: "text-red-600", bg: "bg-red-50" },
                  { label: "Govt Schemes", href: "/schemes", icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
                  { label: "Open Data Portal", href: "/transparency", icon: Globe, color: "text-slate-600", bg: "bg-slate-50" },
                  { label: "Accessibility Help", href: "/help#accessibility", icon: Accessibility, color: "text-teal-600", bg: "bg-teal-50" },
                ].map(link => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.href} href={link.href}
                      className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 hover:border-[#1a3a6b]/30 hover:shadow-sm transition-all group">
                      <div className={`p-2 rounded-lg ${link.bg}`}><Icon className={`h-4 w-4 ${link.color}`} /></div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-[#1a3a6b] transition-colors flex-1">{link.label}</span>
                      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#1a3a6b] transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Gallery Section ── */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#1a3a6b]/60 mb-1">Development</p>
              <h2 className="text-2xl font-bold text-[#1a3a6b]">City Development Gallery</h2>
            </div>
            <Link href="/gallery" className="text-sm font-semibold text-[#1a3a6b] hover:underline flex items-center gap-1">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GALLERY_ITEMS.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <Link href="/gallery"
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.gradient} aspect-video flex items-end p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 block`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="relative z-10">
                    <Badge className="bg-white/20 text-white border-0 text-xs mb-1">{item.tag}</Badge>
                    <p className="text-white font-bold text-sm">{item.title}</p>
                  </div>
                  <div className="absolute top-3 right-3 p-2 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-3.5 w-3.5 text-white" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Notification Subscribe Banner ── */}
      <section className="py-12 bg-gradient-to-r from-[#1a3a6b] to-[#0f2347] text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-5">
          <Bell className="h-10 w-10 text-yellow-300 mx-auto" />
          <h2 className="text-2xl font-bold">Stay Updated with City Alerts</h2>
          <p className="text-white/70 text-sm">Subscribe to receive notifications about complaints, notices, and city updates via email or SMS.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email address"
              className="flex-1 h-11 rounded-xl border-2 border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/50 outline-none focus:border-yellow-300 transition-colors" />
            <Button className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl gap-2 shrink-0">
              <Bell className="h-4 w-4" /> Subscribe
            </Button>
          </div>
          <p className="text-xs text-white/40">Preview only — actual notifications require account setup</p>
        </div>
      </section>

      {/* ── Accessibility Bar ── */}
      <AccessibilityBar />
    </div>
  );
}

// ── Accessibility Floating Bar ────────────────────────────────────────────────
function AccessibilityBar() {
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);

  const applyFontSize = (size: number) => {
    setFontSize(size);
    document.documentElement.style.fontSize = `${size}%`;
  };

  const toggleContrast = () => {
    setHighContrast(c => {
      const next = !c;
      document.documentElement.classList.toggle("high-contrast", next);
      return next;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {open && (
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl border-2 border-[#1a3a6b]/20 p-4 space-y-3 w-52">
          <p className="text-xs font-bold text-[#1a3a6b] uppercase tracking-wide">Accessibility</p>
          <div>
            <p className="text-xs text-gray-500 mb-2">Font Size: {fontSize}%</p>
            <div className="flex gap-2">
              <button onClick={() => applyFontSize(Math.max(80, fontSize - 10))}
                className="flex-1 py-1.5 rounded-lg border border-gray-200 text-sm font-bold hover:bg-gray-50">A-</button>
              <button onClick={() => applyFontSize(100)}
                className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs hover:bg-gray-50">Reset</button>
              <button onClick={() => applyFontSize(Math.min(130, fontSize + 10))}
                className="flex-1 py-1.5 rounded-lg border border-gray-200 text-sm font-bold hover:bg-gray-50">A+</button>
            </div>
          </div>
          <button onClick={toggleContrast}
            className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${highContrast ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
            {highContrast ? "✓ High Contrast ON" : "High Contrast"}
          </button>
        </motion.div>
      )}
      <button onClick={() => setOpen(o => !o)}
        className="h-12 w-12 rounded-full bg-[#1a3a6b] text-white shadow-xl hover:bg-[#1a3a6b]/90 transition-all flex items-center justify-center hover:scale-110">
        <Accessibility className="h-5 w-5" />
      </button>
    </div>
  );
}
