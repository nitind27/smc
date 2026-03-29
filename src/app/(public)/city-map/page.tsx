"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin, Phone, Mail, Users, Search, Building2,
  Droplets, Zap, Trash2, Trees, ChevronRight, X,
  User, Clock, CheckCircle2,
} from "lucide-react";

const ZONES = [
  { id: "Z1", name: "Zone A — North", color: "bg-blue-500", light: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", wards: 8, population: "1.2L" },
  { id: "Z2", name: "Zone B — South", color: "bg-emerald-500", light: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", wards: 7, population: "98K" },
  { id: "Z3", name: "Zone C — East", color: "bg-amber-500", light: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", wards: 6, population: "87K" },
  { id: "Z4", name: "Zone D — West", color: "bg-violet-500", light: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", wards: 9, population: "1.4L" },
  { id: "Z5", name: "Zone E — Central", color: "bg-rose-500", light: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", wards: 5, population: "76K" },
];

const WARDS = [
  { id: 1, name: "Ward 1 — Shastri Nagar", zone: "Z1", officer: "Ramesh Patel", phone: "9876543201", email: "ward1@smc.gov.in", population: 14500, complaints: 12, resolved: 9, services: ["Water", "Sanitation", "Roads"] },
  { id: 2, name: "Ward 2 — Gandhi Chowk", zone: "Z1", officer: "Sunita Sharma", phone: "9876543202", email: "ward2@smc.gov.in", population: 18200, complaints: 8, resolved: 7, services: ["Water", "Lighting", "Parks"] },
  { id: 3, name: "Ward 3 — Nehru Colony", zone: "Z1", officer: "Vijay Kumar", phone: "9876543203", email: "ward3@smc.gov.in", population: 12800, complaints: 15, resolved: 11, services: ["Roads", "Drainage", "Sanitation"] },
  { id: 4, name: "Ward 4 — Ambedkar Nagar", zone: "Z2", officer: "Priya Desai", phone: "9876543204", email: "ward4@smc.gov.in", population: 16300, complaints: 6, resolved: 6, services: ["Water", "Roads", "Lighting"] },
  { id: 5, name: "Ward 5 — Subhash Marg", zone: "Z2", officer: "Anil Mehta", phone: "9876543205", email: "ward5@smc.gov.in", population: 11900, complaints: 19, resolved: 14, services: ["Sanitation", "Parks", "Roads"] },
  { id: 6, name: "Ward 6 — Patel Nagar", zone: "Z3", officer: "Kavita Singh", phone: "9876543206", email: "ward6@smc.gov.in", population: 15600, complaints: 11, resolved: 8, services: ["Water", "Drainage", "Roads"] },
  { id: 7, name: "Ward 7 — Indira Colony", zone: "Z3", officer: "Mohan Rao", phone: "9876543207", email: "ward7@smc.gov.in", population: 13400, complaints: 7, resolved: 7, services: ["Lighting", "Parks", "Sanitation"] },
  { id: 8, name: "Ward 8 — Rajiv Nagar", zone: "Z4", officer: "Deepa Joshi", phone: "9876543208", email: "ward8@smc.gov.in", population: 17800, complaints: 22, resolved: 16, services: ["Roads", "Water", "Drainage"] },
  { id: 9, name: "Ward 9 — Sardar Patel Road", zone: "Z4", officer: "Suresh Nair", phone: "9876543209", email: "ward9@smc.gov.in", population: 14200, complaints: 9, resolved: 9, services: ["Sanitation", "Roads", "Lighting"] },
  { id: 10, name: "Ward 10 — Central Market", zone: "Z5", officer: "Anita Gupta", phone: "9876543210", email: "ward10@smc.gov.in", population: 19500, complaints: 31, resolved: 24, services: ["Roads", "Sanitation", "Water", "Lighting"] },
];

const SERVICE_ICONS: Record<string, React.ElementType> = {
  Water: Droplets, Sanitation: Trash2, Roads: Building2,
  Lighting: Zap, Parks: Trees, Drainage: Droplets,
};

export default function CityMapPage() {
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [selectedWard, setSelectedWard] = useState<typeof WARDS[0] | null>(null);
  const [search, setSearch] = useState("");

  const filteredWards = WARDS.filter(w => {
    const matchZone = selectedZone === "all" || w.zone === selectedZone;
    const matchSearch = !search || w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.officer.toLowerCase().includes(search.toLowerCase());
    return matchZone && matchSearch;
  });

  const getZone = (zoneId: string) => ZONES.find(z => z.id === zoneId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a3a6b] text-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/10 rounded-xl"><MapPin className="h-8 w-8 text-yellow-300" /></div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">City Map — Wards & Zones</h1>
              <p className="text-white/70 text-sm mt-0.5">Ward-wise information with officer details and services</p>
            </div>
          </div>
          {/* Zone Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {ZONES.map(zone => (
              <button key={zone.id} onClick={() => setSelectedZone(selectedZone === zone.id ? "all" : zone.id)}
                className={`rounded-xl p-3 border-2 text-left transition-all ${
                  selectedZone === zone.id ? "border-yellow-400 bg-white/20" : "border-white/10 bg-white/10 hover:bg-white/15"
                }`}>
                <div className={`h-2 w-8 rounded-full ${zone.color} mb-2`} />
                <p className="text-xs font-bold text-white">{zone.name.split("—")[1]?.trim()}</p>
                <p className="text-xs text-white/60">{zone.wards} wards · {zone.population}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Ward List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search ward or officer name..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 border-2 border-gray-200 focus:border-[#1a3a6b] h-11 bg-white" />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X className="h-4 w-4" /></button>}
            </div>

            <p className="text-sm text-gray-500">{filteredWards.length} wards found</p>

            <div className="space-y-3">
              {filteredWards.map((ward, i) => {
                const zone = getZone(ward.zone);
                const resolutionRate = Math.round((ward.resolved / ward.complaints) * 100);
                return (
                  <motion.div key={ward.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <button onClick={() => setSelectedWard(selectedWard?.id === ward.id ? null : ward)}
                      className={`w-full text-left bg-white rounded-2xl border-2 shadow-sm hover:shadow-md transition-all p-4 ${
                        selectedWard?.id === ward.id ? "border-[#1a3a6b]" : "border-gray-100 hover:border-gray-200"
                      }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`h-8 w-8 rounded-xl ${zone?.color ?? "bg-gray-400"} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                            {ward.id}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{ward.name}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${zone?.light} ${zone?.text}`}>{zone?.name}</span>
                              <span className="text-xs text-gray-500 flex items-center gap-1"><Users className="h-3 w-3" />{ward.population.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-gray-500">{ward.resolved}/{ward.complaints} resolved</p>
                          <div className="flex items-center gap-1 justify-end mt-1">
                            <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${resolutionRate}%` }} />
                            </div>
                            <span className="text-xs font-bold text-emerald-600">{resolutionRate}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {selectedWard?.id === ward.id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                          className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                              <User className="h-4 w-4 text-[#1a3a6b] shrink-0" />
                              <div>
                                <p className="text-xs text-gray-500">Ward Officer</p>
                                <p className="text-sm font-bold text-gray-900">{ward.officer}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                              <Phone className="h-4 w-4 text-[#1a3a6b] shrink-0" />
                              <div>
                                <p className="text-xs text-gray-500">Contact</p>
                                <p className="text-sm font-bold text-gray-900">{ward.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 sm:col-span-2">
                              <Mail className="h-4 w-4 text-[#1a3a6b] shrink-0" />
                              <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-sm font-bold text-gray-900">{ward.email}</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-700 mb-2">Available Services</p>
                            <div className="flex flex-wrap gap-2">
                              {ward.services.map(s => {
                                const Icon = SERVICE_ICONS[s] ?? Building2;
                                return (
                                  <span key={s} className="flex items-center gap-1.5 bg-[#1a3a6b]/10 text-[#1a3a6b] text-xs font-semibold px-3 py-1.5 rounded-full">
                                    <Icon className="h-3 w-3" />{s}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a href={`tel:${ward.phone}`}>
                              <Button size="sm" className="bg-[#1a3a6b] hover:bg-[#1a3a6b]/90 gap-1.5">
                                <Phone className="h-3.5 w-3.5" /> Call Officer
                              </Button>
                            </a>
                            <a href="/raise-complaint">
                              <Button size="sm" variant="outline" className="border-[#1a3a6b]/30 text-[#1a3a6b] gap-1.5">
                                <MapPin className="h-3.5 w-3.5" /> Raise Complaint
                              </Button>
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Zone Summary */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-md overflow-hidden">
              <div className="bg-[#1a3a6b] px-4 py-3">
                <h3 className="text-white font-bold text-sm">Zone Summary</h3>
              </div>
              <div className="p-4 space-y-3">
                {ZONES.map(zone => (
                  <div key={zone.id} className={`flex items-center justify-between p-3 rounded-xl ${zone.light} border ${zone.border}`}>
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${zone.color}`} />
                      <span className={`text-sm font-semibold ${zone.text}`}>{zone.name}</span>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${zone.text}`}>{zone.wards} wards</p>
                      <p className="text-xs text-gray-500">{zone.population}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Office Hours */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-md p-4 space-y-3">
              <h3 className="font-bold text-[#1a3a6b] flex items-center gap-2">
                <Clock className="h-4 w-4" /> Ward Office Hours
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Monday – Friday</span><span className="font-semibold">10:00 AM – 5:00 PM</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Saturday</span><span className="font-semibold">10:00 AM – 2:00 PM</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Sunday & Holidays</span><span className="font-semibold text-red-500">Closed</span></div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-[#1a3a6b] rounded-2xl p-4 text-white space-y-3">
              <h3 className="font-bold text-sm">City Overview</h3>
              {[
                { label: "Total Wards", value: WARDS.length },
                { label: "Total Zones", value: ZONES.length },
                { label: "Total Population", value: "5.8 Lakh" },
                { label: "Ward Officers", value: WARDS.length },
              ].map(s => (
                <div key={s.label} className="flex justify-between text-sm">
                  <span className="text-white/70">{s.label}</span>
                  <span className="font-bold text-yellow-300">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
