"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone, AlertTriangle, Flame, Droplets, Zap, Shield,
  Ambulance, Building2, MapPin, Clock, ChevronRight,
  PhoneCall, MessageSquare, Info,
} from "lucide-react";

const EMERGENCY_CONTACTS = [
  {
    category: "Emergency Services",
    color: "#dc2626",
    bg: "bg-red-50",
    border: "border-red-200",
    contacts: [
      { name: "Police Control Room", number: "100", desc: "Law & order emergency", available: "24/7", icon: Shield },
      { name: "Fire Brigade", number: "101", desc: "Fire & rescue operations", available: "24/7", icon: Flame },
      { name: "Ambulance", number: "108", desc: "Medical emergency", available: "24/7", icon: Ambulance },
      { name: "Disaster Management", number: "1077", desc: "Natural disasters & floods", available: "24/7", icon: AlertTriangle },
    ],
  },
  {
    category: "Municipal Services",
    color: "#1a3a6b",
    bg: "bg-blue-50",
    border: "border-blue-200",
    contacts: [
      { name: "Water Supply Emergency", number: "1916", desc: "Water leakage, no supply", available: "24/7", icon: Droplets },
      { name: "Electricity Complaint", number: "1912", desc: "Power outage, wire issues", available: "24/7", icon: Zap },
      { name: "SMC Control Room", number: "1800-XXX-XXXX", desc: "General municipal complaints", available: "8AM-8PM", icon: Building2 },
      { name: "Road Emergency", number: "1800-XXX-YYYY", desc: "Pothole, road damage", available: "9AM-6PM", icon: MapPin },
    ],
  },
  {
    category: "Health & Safety",
    color: "#059669",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    contacts: [
      { name: "COVID Helpline", number: "1075", desc: "Health emergency helpline", available: "24/7", icon: Phone },
      { name: "Women Helpline", number: "1091", desc: "Women safety & support", available: "24/7", icon: Shield },
      { name: "Child Helpline", number: "1098", desc: "Child welfare & safety", available: "24/7", icon: Phone },
      { name: "Senior Citizen", number: "14567", desc: "Elder care helpline", available: "24/7", icon: Phone },
    ],
  },
];

const QUICK_TIPS = [
  { tip: "Stay calm and provide your exact location", icon: MapPin },
  { tip: "Keep emergency numbers saved in your phone", icon: Phone },
  { tip: "Do not block emergency helpline numbers", icon: AlertTriangle },
  { tip: "For non-urgent issues, use the complaint portal", icon: MessageSquare },
];

export default function EmergencyPage() {
  const [calling, setCalling] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-700 text-white">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl animate-pulse">
              <AlertTriangle className="h-8 w-8 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Emergency Helplines</h1>
              <p className="text-red-200 text-sm mt-0.5">24/7 emergency contacts for citizens</p>
            </div>
          </div>

          {/* SOS Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-5 flex flex-col sm:flex-row items-center gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center shadow-lg">
                <Phone className="h-7 w-7 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-red-200 font-medium uppercase tracking-wide">National Emergency</p>
                <p className="text-4xl font-black tracking-widest">112</p>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm text-red-100">Single emergency number for Police, Fire & Ambulance</p>
              <p className="text-xs text-red-200 mt-1">Available 24/7 · Free from any phone</p>
            </div>
            <a href="tel:112">
              <Button className="bg-white text-red-700 hover:bg-red-50 font-bold gap-2 shadow-lg">
                <PhoneCall className="h-4 w-4" /> Call 112
              </Button>
            </a>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">

        {/* Contact Categories */}
        {EMERGENCY_CONTACTS.map((cat, ci) => (
          <motion.div key={cat.category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.1 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-1 w-6 rounded-full" style={{ backgroundColor: cat.color }} />
              <h2 className="text-lg font-bold text-gray-900">{cat.category}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {cat.contacts.map((contact, i) => {
                const Icon = contact.icon;
                return (
                  <motion.div key={contact.name} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ci * 0.1 + i * 0.05 }}>
                    <div className={`bg-white rounded-2xl border-2 ${cat.border} shadow-sm hover:shadow-md transition-all overflow-hidden`}>
                      <div className="flex items-center gap-4 p-4">
                        <div className={`p-3 rounded-xl ${cat.bg} shrink-0`}>
                          <Icon className="h-6 w-6" style={{ color: cat.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm">{contact.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{contact.desc}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xl font-black tracking-wide" style={{ color: cat.color }}>{contact.number}</span>
                            <Badge className="text-xs bg-emerald-100 text-emerald-700 border-0">
                              <Clock className="h-2.5 w-2.5 mr-1" />{contact.available}
                            </Badge>
                          </div>
                        </div>
                        <a href={`tel:${contact.number.replace(/[^0-9]/g, "")}`} className="shrink-0">
                          <Button size="sm" className="rounded-xl gap-1.5 font-semibold" style={{ backgroundColor: cat.color }}>
                            <PhoneCall className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Call</span>
                          </Button>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* Quick Tips */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="bg-amber-50 rounded-2xl border-2 border-amber-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-amber-600" />
              <h3 className="font-bold text-amber-800">Emergency Tips</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {QUICK_TIPS.map((tip, i) => {
                const Icon = tip.icon;
                return (
                  <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-amber-100">
                    <div className="p-1.5 bg-amber-100 rounded-lg shrink-0">
                      <Icon className="h-4 w-4 text-amber-600" />
                    </div>
                    <p className="text-sm text-amber-800">{tip.tip}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Non-emergency redirect */}
        <div className="bg-[#1a3a6b]/5 rounded-2xl border-2 border-[#1a3a6b]/20 p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-[#1a3a6b]" />
            <div>
              <p className="font-bold text-[#1a3a6b]">Non-Emergency Complaints</p>
              <p className="text-sm text-gray-600">For civic issues like potholes, garbage, water supply</p>
            </div>
          </div>
          <a href="/raise-complaint" className="shrink-0">
            <Button className="bg-[#1a3a6b] hover:bg-[#1a3a6b]/90 gap-2">
              Raise Complaint <ChevronRight className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
