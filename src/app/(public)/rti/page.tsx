"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, CheckCircle2, FileText, Upload, Loader2,
  AlertCircle, Info, ChevronRight, Clock, IndianRupee,
  User, Mail, Phone, MapPin, X, ArrowRight,
} from "lucide-react";

const RTI_DEPARTMENTS = [
  "Municipal Commissioner Office", "Roads & Infrastructure", "Water Supply Department",
  "Sanitation Department", "Town Planning", "Finance Department",
  "Health Department", "Education Department", "Parks & Gardens", "Other",
];

const RTI_INFO = [
  { title: "Response Time", value: "30 Days", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
  { title: "Application Fee", value: "₹10", icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-50" },
  { title: "BPL Applicants", value: "Free", icon: User, color: "text-violet-600", bg: "bg-violet-50" },
  { title: "Appeal Period", value: "30 Days", icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
];

const FAQ = [
  { q: "What is RTI?", a: "Right to Information Act 2005 gives every citizen the right to access information held by public authorities." },
  { q: "Who can file RTI?", a: "Any Indian citizen can file an RTI application. There is no need to give reasons for seeking information." },
  { q: "What is the fee?", a: "₹10 for general applicants. BPL (Below Poverty Line) applicants are exempt from fees." },
  { q: "How long does it take?", a: "The public authority must respond within 30 days. For life/liberty matters, within 48 hours." },
  { q: "What if I don't get a response?", a: "You can file a First Appeal with the First Appellate Authority within 30 days of the deadline." },
];

export default function RTIPage() {
  const [step, setStep] = useState<"info" | "form" | "success">("info");
  const [dept, setDept] = useState("");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isBPL, setIsBPL] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refNo, setRefNo] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dept) { setError("Please select a department"); return; }
    if (!subject.trim()) { setError("Subject is required"); return; }
    if (!details.trim()) { setError("Details are required"); return; }
    if (!name.trim()) { setError("Name is required"); return; }
    if (!email.trim()) { setError("Email is required"); return; }
    setError(null);
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    const ref = `RTI-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    setRefNo(ref);
    setSubmitting(false);
    setStep("success");
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center space-y-5">
          <div className="flex justify-center">
            <div className="p-4 bg-emerald-100 rounded-full">
              <CheckCircle2 className="h-14 w-14 text-emerald-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">RTI Filed Successfully!</h2>
          <p className="text-gray-600">Your RTI application has been submitted. You will receive a response within 30 days.</p>
          <div className="bg-[#1a3a6b]/5 rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-1">Reference Number</p>
            <p className="text-2xl font-mono font-bold text-[#1a3a6b]">{refNo}</p>
          </div>
          <p className="text-xs text-gray-500">Save this reference number to track your RTI application status.</p>
          <Button asChild className="w-full bg-[#1a3a6b]">
            <a href="/">Back to Home</a>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a3a6b] text-white">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/10 rounded-xl">
              <BookOpen className="h-8 w-8 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Right to Information (RTI)</h1>
              <p className="text-white/70 text-sm mt-0.5">File RTI applications under RTI Act 2005</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {RTI_INFO.map((info, i) => {
              const Icon = info.icon;
              return (
                <motion.div key={info.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="bg-white/10 rounded-2xl p-4 border border-white/10 text-center">
                  <Icon className="h-5 w-5 text-yellow-300 mx-auto mb-2" />
                  <p className="text-xl font-bold text-white">{info.value}</p>
                  <p className="text-xs text-white/60">{info.title}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Form */}
          <div className="lg:col-span-2">
            {step === "info" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-bold mb-1">Before you file:</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Application fee: ₹10 (BPL applicants exempt)</li>
                      <li>• Response within 30 days</li>
                      <li>• Provide specific information request</li>
                      <li>• Keep your reference number safe</li>
                    </ul>
                  </div>
                </div>
                <Button onClick={() => setStep("form")} className="w-full h-12 bg-[#1a3a6b] hover:bg-[#1a3a6b]/90 gap-2 text-base">
                  File RTI Application <ArrowRight className="h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {step === "form" && (
              <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit} className="space-y-5">

                <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-md p-6 space-y-4">
                  <h2 className="font-bold text-gray-900">Application Details</h2>
                  <div className="space-y-1.5">
                    <Label>Department <span className="text-red-500">*</span></Label>
                    <select value={dept} onChange={e => setDept(e.target.value)}
                      className="w-full h-11 rounded-xl border-2 border-gray-200 bg-white px-3 text-sm focus:outline-none focus:border-[#1a3a6b] transition-colors">
                      <option value="">Select department...</option>
                      {RTI_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Subject / Information Sought <span className="text-red-500">*</span></Label>
                    <Input placeholder="Brief subject of your RTI request" value={subject} onChange={e => setSubject(e.target.value)}
                      className="border-2 border-gray-200 focus:border-[#1a3a6b] h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Details of Information Required <span className="text-red-500">*</span></Label>
                    <textarea placeholder="Describe specifically what information you are seeking..."
                      value={details} onChange={e => setDetails(e.target.value)}
                      className="w-full min-h-[120px] rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#1a3a6b] transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Supporting Document (Optional)</Label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#1a3a6b]/50 cursor-pointer text-sm text-gray-600 hover:text-[#1a3a6b] transition-colors">
                        <Upload className="h-4 w-4" />
                        {file ? file.name.slice(0, 20) + "…" : "Upload PDF"}
                        <input type="file" accept=".pdf" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />
                      </label>
                      {file && <button type="button" onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-md p-6 space-y-4">
                  <h2 className="font-bold text-gray-900">Applicant Details</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Full Name <span className="text-red-500">*</span></Label>
                      <Input placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} className="border-2 border-gray-200 focus:border-[#1a3a6b]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email <span className="text-red-500">*</span></Label>
                      <Input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="border-2 border-gray-200 focus:border-[#1a3a6b]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone</Label>
                      <Input placeholder="Mobile number" value={phone} onChange={e => setPhone(e.target.value)} className="border-2 border-gray-200 focus:border-[#1a3a6b]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Address</Label>
                      <Input placeholder="Your address" value={address} onChange={e => setAddress(e.target.value)} className="border-2 border-gray-200 focus:border-[#1a3a6b]" />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={isBPL} onChange={e => setIsBPL(e.target.checked)} className="h-4 w-4 rounded" />
                    <span className="text-sm text-gray-700">I am a BPL (Below Poverty Line) cardholder (fee exempt)</span>
                  </label>
                  {!isBPL && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 shrink-0" />
                      Application fee of <strong>₹10</strong> will be collected at the office.
                    </div>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep("info")} className="flex-1 border-2">Back</Button>
                  <Button type="submit" disabled={submitting} className="flex-1 h-12 bg-[#1a3a6b] hover:bg-[#1a3a6b]/90 gap-2">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    {submitting ? "Submitting..." : "Submit RTI Application"}
                  </Button>
                </div>
              </motion.form>
            )}
          </div>

          {/* Sidebar: FAQ */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-md overflow-hidden">
              <div className="bg-[#1a3a6b] px-4 py-3">
                <h3 className="text-white font-bold text-sm">Frequently Asked Questions</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {FAQ.map((faq, i) => (
                  <div key={i}>
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                      <span className="text-sm font-semibold text-gray-800">{faq.q}</span>
                      <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${openFaq === i ? "rotate-90" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden">
                          <p className="px-4 pb-3 text-sm text-gray-600">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl border-2 border-amber-200 p-4 space-y-2">
              <p className="font-bold text-amber-800 text-sm">Need Help?</p>
              <p className="text-xs text-amber-700">Visit the RTI Cell at Municipal Corporation Building, Ground Floor, Room 12.</p>
              <p className="text-xs text-amber-700 font-semibold">Mon-Fri: 10AM - 5PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
