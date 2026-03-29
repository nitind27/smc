"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle, MessageSquare, Search, ChevronRight, ChevronDown,
  Send, Bot, User, Phone, Mail, Clock, CheckCircle2,
  FileText, MapPin, Droplets, Zap, Trash2, AlertCircle, X,
} from "lucide-react";

const FAQ_CATEGORIES = [
  { id: "complaints", label: "Complaints", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
  { id: "water", label: "Water Supply", icon: Droplets, color: "text-cyan-600", bg: "bg-cyan-50" },
  { id: "bills", label: "Bills & Tax", icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
  { id: "services", label: "Services", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "general", label: "General", icon: HelpCircle, color: "text-violet-600", bg: "bg-violet-50" },
];

const FAQS: Record<string, Array<{ q: string; a: string }>> = {
  complaints: [
    { q: "How do I raise a complaint?", a: "Visit the 'Raise Complaint' page, verify your identity via OTP, fill in the complaint details with location and photos, then submit. You'll receive a unique complaint ID." },
    { q: "How long does it take to resolve a complaint?", a: "Most complaints are resolved within 7-15 working days. Urgent complaints (water, electricity) are prioritized within 48 hours." },
    { q: "How can I track my complaint status?", a: "Use the 'Track Complaint' page and enter your complaint ID. You can also check via SMS if you provided your phone number." },
    { q: "Can I attach photos to my complaint?", a: "Yes, you can attach up to 5 photos or PDF documents (max 5MB each) when submitting a complaint." },
    { q: "What if my complaint is rejected?", a: "If rejected, you'll receive a reason. You can re-submit with additional information or visit the ward office for assistance." },
  ],
  water: [
    { q: "How do I report a water leakage?", a: "Call the 24/7 Water Emergency helpline at 1916 or raise a complaint online under the 'Water Supply' category." },
    { q: "How is my water bill calculated?", a: "Water bills are calculated based on consumption (KL), connection type (domestic/commercial), and applicable slab rates." },
    { q: "How do I apply for a new water connection?", a: "Download the 'Water Connection Request' form from the Services page, fill it, and submit at the Water Supply Department with required documents." },
    { q: "What are the water supply timings?", a: "Water is supplied twice daily: 6:00 AM – 9:00 AM and 5:00 PM – 8:00 PM. Timings may vary by zone." },
  ],
  bills: [
    { q: "How do I pay my property tax?", a: "Property tax can be paid at the municipal office, authorized banks, or online payment centers. Visit the Services page for bill details." },
    { q: "What is the due date for property tax?", a: "Property tax is due by March 31st each year. Late payment attracts a penalty of 2% per month." },
    { q: "How do I get a tax receipt?", a: "After payment, collect the receipt from the payment counter. Digital receipts are available at the municipal office." },
    { q: "Can I get a rebate on property tax?", a: "Yes, a 5% rebate is available for early payment (before December 31st). Senior citizens may get additional concessions." },
  ],
  services: [
    { q: "How do I apply for a birth certificate?", a: "Download the Birth Certificate Application form, fill it with required details, and submit at the Civil Registration office with supporting documents." },
    { q: "How long does certificate issuance take?", a: "Birth/Death certificates: 7 working days. Marriage certificates: 15 working days. Trade licenses: 30 working days." },
    { q: "How do I verify a certificate?", a: "Use the 'Verify Certificate' option in the Services page. Enter the certificate number (starts with SMC-) to verify authenticity." },
    { q: "What documents are needed for trade license?", a: "Aadhaar/PAN, address proof, property documents/rent agreement, 2 passport photos, and NOC from Fire Department if applicable." },
  ],
  general: [
    { q: "What are the municipal office hours?", a: "Monday to Friday: 10:00 AM – 5:00 PM. Saturday: 10:00 AM – 2:00 PM. Closed on Sundays and public holidays." },
    { q: "How do I contact my ward officer?", a: "Visit the City Map page to find your ward officer's contact details including phone number and email." },
    { q: "What is RTI and how do I file it?", a: "RTI (Right to Information) allows citizens to request government information. Visit the RTI page to file an application online." },
    { q: "How do I subscribe to notifications?", a: "Enter your email on the homepage notification section to receive updates about complaints, notices, and city events." },
  ],
};

// ── AI Chatbot ────────────────────────────────────────────────────────────────
type Message = { role: "user" | "bot"; text: string; time: string };

const BOT_RESPONSES: Record<string, string> = {
  complaint: "To raise a complaint, go to the 'Raise Complaint' page. You'll need to verify your identity via OTP, then fill in details about the issue with location and photos.",
  track: "You can track your complaint using the 'Track Complaint' page. Enter your complaint ID (e.g., ABCDE12345) to see the current status.",
  water: "For water supply issues, call our 24/7 helpline at 1916 or raise a complaint online under 'Water Supply' category.",
  bill: "Water and utility bills can be viewed on the Services page. For payment, visit the municipal office or authorized payment centers.",
  certificate: "For certificates (birth, death, marriage), download the form from Services page and submit at the Civil Registration office.",
  officer: "Find your ward officer's contact on the City Map page. Select your ward to see officer name, phone, and email.",
  emergency: "For emergencies: Police 100, Fire 101, Ambulance 108, National Emergency 112. Visit the Emergency page for all helplines.",
  rti: "To file an RTI application, visit the RTI page. You'll need to provide your details and specify the information you're seeking.",
  hours: "Municipal office hours: Mon-Fri 10AM-5PM, Saturday 10AM-2PM. Closed on Sundays and holidays.",
  default: "I can help you with complaints, water supply, bills, certificates, ward officer info, and more. Please ask a specific question or browse the FAQ section below.",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("complaint") || lower.includes("issue") || lower.includes("problem")) return BOT_RESPONSES.complaint;
  if (lower.includes("track") || lower.includes("status") || lower.includes("check")) return BOT_RESPONSES.track;
  if (lower.includes("water") || lower.includes("supply") || lower.includes("leakage")) return BOT_RESPONSES.water;
  if (lower.includes("bill") || lower.includes("tax") || lower.includes("payment")) return BOT_RESPONSES.bill;
  if (lower.includes("certificate") || lower.includes("birth") || lower.includes("death") || lower.includes("marriage")) return BOT_RESPONSES.certificate;
  if (lower.includes("officer") || lower.includes("ward") || lower.includes("contact")) return BOT_RESPONSES.officer;
  if (lower.includes("emergency") || lower.includes("police") || lower.includes("fire") || lower.includes("ambulance")) return BOT_RESPONSES.emergency;
  if (lower.includes("rti") || lower.includes("information") || lower.includes("right")) return BOT_RESPONSES.rti;
  if (lower.includes("hour") || lower.includes("time") || lower.includes("open") || lower.includes("close")) return BOT_RESPONSES.hours;
  return BOT_RESPONSES.default;
}

function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hello! I'm the SMC Assistant. How can I help you today? You can ask me about complaints, water supply, bills, certificates, or any municipal service.", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));
    const botMsg: Message = { role: "bot", text: getResponse(userMsg.text), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, botMsg]);
    setTyping(false);
  };

  const QUICK = ["How to raise complaint?", "Track my complaint", "Water supply issue", "Office hours"];

  return (
    <div className="bg-white rounded-2xl border-2 border-[#1a3a6b]/20 shadow-xl overflow-hidden flex flex-col h-[500px]">
      <div className="bg-[#1a3a6b] px-4 py-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-yellow-400 flex items-center justify-center">
          <Bot className="h-5 w-5 text-[#1a3a6b]" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">SMC Assistant</p>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-white/60 text-xs">Online</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === "bot" ? "bg-[#1a3a6b]" : "bg-gray-300"}`}>
              {msg.role === "bot" ? <Bot className="h-4 w-4 text-white" /> : <User className="h-4 w-4 text-gray-600" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === "bot" ? "bg-white border border-gray-100 text-gray-800 rounded-tl-none" : "bg-[#1a3a6b] text-white rounded-tr-none"}`}>
              <p>{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.role === "bot" ? "text-gray-400" : "text-white/50"}`}>{msg.time}</p>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2">
            <div className="h-7 w-7 rounded-full bg-[#1a3a6b] flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
              {[0, 1, 2].map(i => <div key={i} className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-gray-100 bg-white space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {QUICK.map(q => (
            <button key={q} onClick={() => { setInput(q); }}
              className="text-xs bg-[#1a3a6b]/10 text-[#1a3a6b] px-2.5 py-1 rounded-full hover:bg-[#1a3a6b]/20 transition-colors font-medium">
              {q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Type your question..." className="border-2 focus:border-[#1a3a6b] text-sm" />
          <Button onClick={sendMessage} disabled={!input.trim()} className="bg-[#1a3a6b] hover:bg-[#1a3a6b]/90 shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState("complaints");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const currentFaqs = FAQS[activeCategory] ?? [];
  const filteredFaqs = search
    ? Object.values(FAQS).flat().filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
    : currentFaqs;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1a3a6b] text-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl"><HelpCircle className="h-8 w-8 text-yellow-300" /></div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Help Center & FAQ</h1>
              <p className="text-white/70 text-sm mt-0.5">Get answers to common questions and chat with our assistant</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-2">

          {/* FAQ Section */}
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-[#1a3a6b] mb-4">Frequently Asked Questions</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)}
                  className="pl-9 border-2 border-gray-200 focus:border-[#1a3a6b] h-11 bg-white" />
                {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X className="h-4 w-4" /></button>}
              </div>
            </div>

            {!search && (
              <div className="flex flex-wrap gap-2">
                {FAQ_CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setOpenFaq(null); }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                        activeCategory === cat.id ? `${cat.bg} ${cat.color} border-current` : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}>
                      <Icon className="h-4 w-4" />{cat.label}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="space-y-2">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <HelpCircle className="h-10 w-10 opacity-30 mx-auto mb-2" />
                  <p>No results found</p>
                </div>
              ) : filteredFaqs.map((faq, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-[#1a3a6b]/20 transition-colors">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left">
                      <span className="text-sm font-semibold text-gray-900 pr-4">{faq.q}</span>
                      <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden">
                          <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Contact Support */}
            <div className="bg-[#1a3a6b] rounded-2xl p-5 text-white space-y-3">
              <h3 className="font-bold">Still need help?</h3>
              <p className="text-white/70 text-sm">Contact our support team directly</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <a href="tel:1800XXXXXXXX" className="flex items-center gap-2 bg-white/10 rounded-xl p-3 hover:bg-white/20 transition-colors">
                  <Phone className="h-4 w-4 text-yellow-300" />
                  <div>
                    <p className="text-xs text-white/60">Helpline</p>
                    <p className="text-sm font-bold">1800-XXX-XXXX</p>
                  </div>
                </a>
                <a href="mailto:help@smc.gov.in" className="flex items-center gap-2 bg-white/10 rounded-xl p-3 hover:bg-white/20 transition-colors">
                  <Mail className="h-4 w-4 text-yellow-300" />
                  <div>
                    <p className="text-xs text-white/60">Email</p>
                    <p className="text-sm font-bold">help@smc.gov.in</p>
                  </div>
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Clock className="h-3.5 w-3.5" /> Mon–Sat: 9AM–6PM
              </div>
            </div>
          </div>

          {/* Chatbot */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[#1a3a6b] mb-1">AI Assistant</h2>
              <p className="text-sm text-gray-500">Ask anything about municipal services</p>
            </div>
            <Chatbot />
            <p className="text-xs text-gray-400 text-center">
              This is an automated assistant. For complex issues, please contact the helpline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
