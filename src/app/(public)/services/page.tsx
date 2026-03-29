"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Droplets, Zap, FileText, Building2, Download, ExternalLink,
  CheckCircle2, Clock, IndianRupee, Eye, Search, ChevronRight,
  Home, Car, Briefcase, Users, Shield, BookOpen, AlertCircle,
} from "lucide-react";

const WATER_BILLS = [
  { id: "WB-2026-001", name: "Sector A - Zone 1", period: "Feb 2026", amount: 450, status: "paid", units: 12 },
  { id: "WB-2026-002", name: "Sector B - Zone 2", period: "Feb 2026", amount: 680, status: "pending", units: 18 },
  { id: "WB-2026-003", name: "Sector C - Zone 3", period: "Jan 2026", amount: 320, status: "paid", units: 9 },
  { id: "WB-2026-004", name: "Sector D - Zone 4", period: "Feb 2026", amount: 890, status: "overdue", units: 24 },
];

const FORMS = [
  { title: "Birth Certificate Application", dept: "Civil Registration", size: "245 KB", category: "Certificate" },
  { title: "Death Certificate Application", dept: "Civil Registration", size: "198 KB", category: "Certificate" },
  { title: "Property Tax Assessment Form", dept: "Finance", size: "312 KB", category: "Tax" },
  { title: "Trade License Application", dept: "Licensing", size: "428 KB", category: "License" },
  { title: "Building Plan Approval", dept: "Town Planning", size: "567 KB", category: "Planning" },
  { title: "Water Connection Request", dept: "Water Supply", size: "189 KB", category: "Utility" },
  { title: "Drainage Connection Form", dept: "Sanitation", size: "201 KB", category: "Utility" },
  { title: "Marriage Registration", dept: "Civil Registration", size: "156 KB", category: "Certificate" },
  { title: "Shop & Establishment License", dept: "Licensing", size: "334 KB", category: "License" },
  { title: "Encroachment Removal Request", dept: "Enforcement", size: "178 KB", category: "Complaint" },
  { title: "Street Vendor License", dept: "Licensing", size: "223 KB", category: "License" },
  { title: "Hoarding Permission Form", dept: "Advertisement", size: "289 KB", category: "Permission" },
];

const SERVICES_LIST = [
  {
    id: "water", title: "Water Bill", icon: Droplets, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200",
    desc: "View your water consumption and bill details (read-only)",
    tag: "View Only",
  },
  {
    id: "utility", title: "Utility Bills", icon: Zap, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200",
    desc: "Property tax, electricity and other utility bill status",
    tag: "View Only",
  },
  {
    id: "forms", title: "Download Forms", icon: FileText, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200",
    desc: "Official government forms and applications in PDF format",
    tag: "Free Download",
  },
  {
    id: "certificates", title: "Verify Certificate", icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200",
    desc: "Verify authenticity of digital certificates issued by SMC",
    tag: "Online",
  },
  {
    id: "booking", title: "Hall Booking", icon: Home, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200",
    desc: "Preview availability of community halls and venues",
    tag: "Preview",
  },
  {
    id: "license", title: "Trade License", icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200",
    desc: "Check trade license status and renewal information",
    tag: "View Only",
  },
];

const UTILITY_BILLS = [
  { type: "Property Tax", id: "PT-2026-4521", period: "2025-26", amount: 3200, status: "paid", dueDate: "Mar 31, 2026" },
  { type: "Solid Waste", id: "SW-2026-1234", period: "Q4 2025", amount: 480, status: "pending", dueDate: "Apr 15, 2026" },
  { type: "Drainage Cess", id: "DC-2026-8876", period: "2025-26", amount: 1100, status: "paid", dueDate: "Mar 31, 2026" },
];

const HALL_BOOKINGS = [
  { name: "Town Hall - Main", capacity: 500, available: true, rate: "₹8,000/day" },
  { name: "Community Center A", capacity: 200, available: false, rate: "₹3,500/day" },
  { name: "Mini Auditorium", capacity: 150, available: true, rate: "₹2,500/day" },
  { name: "Open Ground - Zone 2", capacity: 2000, available: true, rate: "₹5,000/day" },
];

const FORM_CATEGORIES = ["All", "Certificate", "Tax", "License", "Utility", "Planning", "Permission", "Complaint"];

export default function ServicesPage() {
  const [activeSection, setActiveSection] = useState("water");
  const [formCategory, setFormCategory] = useState("All");
  const [certInput, setCertInput] = useState("");
  const [certResult, setCertResult] = useState<null | "valid" | "invalid">(null);
  const [searchForm, setSearchForm] = useState("");

  const filteredForms = FORMS.filter(f => {
    const matchCat = formCategory === "All" || f.category === formCategory;
    const matchSearch = !searchForm || f.title.toLowerCase().includes(searchForm.toLowerCase());
    return matchCat && matchSearch;
  });

  const verifyCert = () => {
    if (!certInput.trim()) return;
    setCertResult(certInput.startsWith("SMC-") ? "valid" : "invalid");
  };

  const statusBadge = (status: string) => {
    if (status === "paid") return "bg-emerald-100 text-emerald-700";
    if (status === "pending") return "bg-amber-100 text-amber-700";
    if (status === "overdue") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a3a6b] text-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl"><Building2 className="h-8 w-8 text-yellow-300" /></div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Citizen Services Hub</h1>
              <p className="text-white/70 text-sm mt-0.5">All municipal services in one place</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-4">

          {/* Sidebar */}
          <div className="space-y-2">
            {SERVICES_LIST.map(s => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                    activeSection === s.id ? `${s.border} ${s.bg} shadow-md` : "border-gray-100 bg-white hover:border-gray-200"
                  }`}>
                  <div className={`p-2 rounded-lg ${s.bg}`}><Icon className={`h-5 w-5 ${s.color}`} /></div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${activeSection === s.id ? s.color : "text-gray-800"}`}>{s.title}</p>
                    <Badge className="text-[10px] bg-gray-100 text-gray-500 border-0 mt-0.5">{s.tag}</Badge>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="lg:col-span-3">

            {/* Water Bill */}
            {activeSection === "water" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="bg-white rounded-2xl border-2 border-cyan-100 shadow-md overflow-hidden">
                  <div className="bg-cyan-600 px-5 py-4 flex items-center gap-3">
                    <Droplets className="h-6 w-6 text-white" />
                    <div>
                      <h2 className="text-white font-bold text-lg">Water Bill — View Only</h2>
                      <p className="text-cyan-100 text-xs">Consumption and billing information</p>
                    </div>
                    <Badge className="ml-auto bg-white/20 text-white border-0">Read Only</Badge>
                  </div>
                  <div className="p-5 space-y-3">
                    {WATER_BILLS.map(bill => (
                      <div key={bill.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{bill.name}</p>
                          <p className="text-xs text-gray-500">{bill.id} · {bill.period} · {bill.units} KL</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{bill.amount}</p>
                          <Badge className={`text-xs ${statusBadge(bill.status)}`}>{bill.status}</Badge>
                        </div>
                      </div>
                    ))}
                    <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 text-xs text-cyan-800 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      This is a view-only display. For actual payment, visit the municipal office or authorized payment center.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Utility Bills */}
            {activeSection === "utility" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="bg-white rounded-2xl border-2 border-amber-100 shadow-md overflow-hidden">
                  <div className="bg-amber-500 px-5 py-4 flex items-center gap-3">
                    <Zap className="h-6 w-6 text-white" />
                    <div>
                      <h2 className="text-white font-bold text-lg">Utility Bills — View Only</h2>
                      <p className="text-amber-100 text-xs">Property tax, waste, drainage charges</p>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    {UTILITY_BILLS.map(bill => (
                      <div key={bill.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{bill.type}</p>
                          <p className="text-xs text-gray-500">{bill.id} · {bill.period} · Due: {bill.dueDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{bill.amount.toLocaleString()}</p>
                          <Badge className={`text-xs ${statusBadge(bill.status)}`}>{bill.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Forms Download */}
            {activeSection === "forms" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="bg-white rounded-2xl border-2 border-violet-100 shadow-md overflow-hidden">
                  <div className="bg-violet-600 px-5 py-4 flex items-center gap-3">
                    <FileText className="h-6 w-6 text-white" />
                    <h2 className="text-white font-bold text-lg">Download Official Forms</h2>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input placeholder="Search forms..." value={searchForm} onChange={e => setSearchForm(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-violet-400 transition-colors" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {FORM_CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setFormCategory(cat)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${formCategory === cat ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                    <div className="grid gap-2">
                      {filteredForms.map((form, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3 hover:bg-violet-50 hover:border-violet-200 transition-all group">
                          <div className="p-2 bg-violet-100 rounded-lg shrink-0">
                            <FileText className="h-4 w-4 text-violet-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{form.title}</p>
                            <p className="text-xs text-gray-500">{form.dept} · PDF · {form.size}</p>
                          </div>
                          <Badge className="text-xs bg-violet-100 text-violet-700 border-0 shrink-0">{form.category}</Badge>
                          <button className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-800 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Download className="h-3.5 w-3.5" /> Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Certificate Verification */}
            {activeSection === "certificates" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="bg-white rounded-2xl border-2 border-emerald-100 shadow-md overflow-hidden">
                  <div className="bg-emerald-600 px-5 py-4 flex items-center gap-3">
                    <Shield className="h-6 w-6 text-white" />
                    <h2 className="text-white font-bold text-lg">Digital Certificate Verification</h2>
                  </div>
                  <div className="p-6 space-y-5">
                    <p className="text-sm text-gray-600">Enter the certificate number to verify its authenticity. All SMC-issued certificates start with <strong>SMC-</strong></p>
                    <div className="flex gap-3">
                      <input placeholder="e.g. SMC-2026-BC-001234" value={certInput} onChange={e => { setCertInput(e.target.value); setCertResult(null); }}
                        className="flex-1 h-11 rounded-xl border-2 border-gray-200 px-4 text-sm focus:outline-none focus:border-emerald-400 transition-colors font-mono" />
                      <Button onClick={verifyCert} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                        <Shield className="h-4 w-4" /> Verify
                      </Button>
                    </div>
                    {certResult === "valid" && (
                      <div className="flex items-center gap-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 shrink-0" />
                        <div>
                          <p className="font-bold text-emerald-700">Certificate Verified ✓</p>
                          <p className="text-sm text-emerald-600">This certificate is authentic and issued by SMC.</p>
                        </div>
                      </div>
                    )}
                    {certResult === "invalid" && (
                      <div className="flex items-center gap-3 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                        <AlertCircle className="h-8 w-8 text-red-500 shrink-0" />
                        <div>
                          <p className="font-bold text-red-700">Certificate Not Found</p>
                          <p className="text-sm text-red-600">This certificate number is not in our records. Please check and try again.</p>
                        </div>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Certificate Types</p>
                      {["Birth Certificate (SMC-YYYY-BC-XXXXXX)", "Death Certificate (SMC-YYYY-DC-XXXXXX)", "Marriage Certificate (SMC-YYYY-MC-XXXXXX)", "Trade License (SMC-YYYY-TL-XXXXXX)"].map(t => (
                        <p key={t} className="text-xs text-gray-500 flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" />{t}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Hall Booking Preview */}
            {activeSection === "booking" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="bg-white rounded-2xl border-2 border-rose-100 shadow-md overflow-hidden">
                  <div className="bg-rose-600 px-5 py-4 flex items-center gap-3">
                    <Home className="h-6 w-6 text-white" />
                    <div>
                      <h2 className="text-white font-bold text-lg">Hall & Venue Booking</h2>
                      <p className="text-rose-100 text-xs">Preview availability — booking at municipal office</p>
                    </div>
                    <Badge className="ml-auto bg-white/20 text-white border-0">Preview Only</Badge>
                  </div>
                  <div className="p-5 space-y-3">
                    {HALL_BOOKINGS.map((hall, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`h-3 w-3 rounded-full ${hall.available ? "bg-emerald-500" : "bg-red-400"}`} />
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{hall.name}</p>
                            <p className="text-xs text-gray-500">Capacity: {hall.capacity.toLocaleString()} persons</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-sm">{hall.rate}</p>
                          <Badge className={`text-xs ${hall.available ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                            {hall.available ? "Available" : "Booked"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      To book a venue, visit the Municipal Office with required documents and fees.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Trade License */}
            {activeSection === "license" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="bg-white rounded-2xl border-2 border-indigo-100 shadow-md overflow-hidden">
                  <div className="bg-indigo-600 px-5 py-4 flex items-center gap-3">
                    <Briefcase className="h-6 w-6 text-white" />
                    <h2 className="text-white font-bold text-lg">Trade License Information</h2>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { label: "New License", desc: "Apply for new trade license", icon: Briefcase },
                        { label: "Renewal", desc: "Renew existing license", icon: Clock },
                        { label: "Status Check", desc: "Check application status", icon: Search },
                        { label: "Download License", desc: "Download issued license", icon: Download },
                      ].map(item => {
                        const Icon = item.icon;
                        return (
                          <div key={item.label} className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                            <div className="p-2 bg-white rounded-lg"><Icon className="h-5 w-5 text-indigo-600" /></div>
                            <div>
                              <p className="font-bold text-sm text-indigo-800">{item.label}</p>
                              <p className="text-xs text-indigo-600">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800">
                      <p className="font-bold mb-2">Required Documents:</p>
                      <ul className="space-y-1 text-xs">
                        {["Aadhaar Card / PAN Card", "Address Proof", "Property Documents / Rent Agreement", "Passport Size Photos (2)", "NOC from Fire Department (if applicable)"].map(d => (
                          <li key={d} className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-indigo-500" />{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
