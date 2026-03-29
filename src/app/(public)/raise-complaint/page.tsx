"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2, CheckCircle2, Upload, X, FilePlus, MapPin,
  Mail, Phone, AlertCircle, Image as ImageIcon, Navigation,
  RefreshCw, Eye, ArrowRight, Shield,
} from "lucide-react";
import Link from "next/link";
import { PageHero } from "@/components/public/PageHero";

const CATEGORIES = [
  { value: "Street Light", label: "Street Light", icon: "💡" },
  { value: "Sanitation", label: "Sanitation / Garbage", icon: "🗑️" },
  { value: "Water", label: "Water Supply", icon: "💧" },
  { value: "Roads", label: "Roads & Potholes", icon: "🛣️" },
  { value: "Drainage", label: "Drainage / Sewage", icon: "🚰" },
  { value: "Parks", label: "Parks & Gardens", icon: "🌳" },
  { value: "Encroachment", label: "Encroachment", icon: "🚧" },
  { value: "Noise", label: "Noise Pollution", icon: "🔊" },
  { value: "Other", label: "Other", icon: "📋" },
];

const PRIORITIES = [
  { value: "low", label: "Low", color: "border-gray-300 text-gray-600" },
  { value: "medium", label: "Medium", color: "border-amber-400 text-amber-600" },
  { value: "high", label: "High", color: "border-orange-400 text-orange-600" },
  { value: "urgent", label: "Urgent 🚨", color: "border-red-400 text-red-600" },
];

type Step = "contact" | "otp" | "form";

export default function RaiseComplaintPage() {
  const [step, setStep] = useState<Step>("contact");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [category, setCategory] = useState("Other");
  const [priority, setPriority] = useState("medium");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitResult, setSubmitResult] = useState<{ id: string; notification?: { message: string } } | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  // ── OTP box handlers ─────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const otpValue = otpDigits.join("");

  // ── Geolocation ──────────────────────────────────────────────────────────
  const getLocation = () => {
    if (!navigator.geolocation) { setGeoError("Geolocation not supported"); return; }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLatitude(lat);
        setLongitude(lng);
        // Reverse geocode using free API
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          const addr = data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setLocation(addr.split(",").slice(0, 3).join(", "));
        } catch {
          setLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
        setGeoLoading(false);
      },
      (err) => {
        setGeoError("Could not get location. Please enter manually.");
        setGeoLoading(false);
      },
      { timeout: 10000 }
    );
  };

  // ── File handling ────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []).filter(f => f.size <= 5 * 1024 * 1024);
    const newFiles = [...files, ...selected].slice(0, 5);
    setFiles(newFiles);
    // Generate previews
    newFiles.forEach((file, i) => {
      if (previews[i]) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews(prev => { const n = [...prev]; n[i] = ev.target?.result as string; return n; });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (i: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  // ── API calls ────────────────────────────────────────────────────────────
  const sendOtp = async () => {
    const value = phoneOrEmail.trim();
    if (!value) { setError("Enter your email or phone number"); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneOrEmail: value }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to send OTP"); return; }
      setStep("otp");
      setResendTimer(60);
      if (data.devOtp) setOtpDigits(data.devOtp.split(""));
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (otpValue.length < 6) { setError("Enter all 6 digits"); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneOrEmail: phoneOrEmail.trim(), otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Invalid OTP"); return; }
      setStep("form");
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  const uploadFiles = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok && (data.url || data.fileUrl)) urls.push(data.url ?? data.fileUrl);
    }
    return urls;
  };

  const submitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    if (!description.trim()) { setError("Description is required"); return; }
    setError(null);
    setLoading(true);
    try {
      const attachmentUrls = await uploadFiles();
      const res = await fetch("/api/public/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          priority,
          submittedBy: phoneOrEmail.trim(),
          location: location.trim() || undefined,
          latitude: latitude ?? undefined,
          longitude: longitude ?? undefined,
          attachmentUrls,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to submit"); return; }
      setSubmitResult({ id: data.id, notification: data.notification });
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  // ── Success ──────────────────────────────────────────────────────────────
  if (submitResult) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="overflow-hidden rounded-2xl border-0 shadow-2xl">
            <div className="h-2 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />
            <CardContent className="pt-10 pb-10 text-center space-y-5">
              <div className="flex justify-center">
                <div className="p-4 bg-emerald-500/10 rounded-full">
                  <CheckCircle2 className="h-14 w-14 text-emerald-500" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Complaint Submitted!</h2>
                <p className="text-muted-foreground mt-1">Your complaint has been registered successfully.</p>
              </div>
              <div className="bg-muted/40 rounded-2xl p-5 inline-block">
                <p className="text-xs text-muted-foreground mb-1">Your Complaint ID</p>
                <p className="text-3xl font-mono font-bold text-primary tracking-widest">{submitResult.id}</p>
              </div>
              {submitResult.notification?.message && (
                <p className="text-sm text-muted-foreground">{submitResult.notification.message}</p>
              )}
              <p className="text-xs text-muted-foreground">Save this ID to track your complaint status anytime.</p>
              <div className="flex gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link href="/">Home</Link>
                </Button>
                <Button asChild>
                  <Link href={`/track?id=${encodeURIComponent(submitResult.id)}`}>
                    Track Complaint <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ── Step indicator ───────────────────────────────────────────────────────
  const steps = [
    { key: "contact", label: "Contact" },
    { key: "otp", label: "Verify" },
    { key: "form", label: "Details" },
  ];
  const currentStepIdx = steps.findIndex(s => s.key === step);

  return (
    <div className="container mx-auto max-w-xl px-4 py-8">
      <PageHero title="Raise a Complaint" description="Report civic issues to the municipal authority" icon={FilePlus} />

      {/* Step Progress */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-all ${
              i < currentStepIdx ? "bg-emerald-500 text-white" :
              i === currentStepIdx ? "bg-primary text-white ring-4 ring-primary/20" :
              "bg-muted text-muted-foreground"
            }`}>
              {i < currentStepIdx ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === currentStepIdx ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
            {i < steps.length - 1 && <div className={`h-0.5 w-8 rounded ${i < currentStepIdx ? "bg-emerald-500" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      <Card className="overflow-hidden rounded-2xl border border-border/50 shadow-xl">
        <div className="h-1 w-full bg-gradient-to-r from-primary to-cyan-500" />
        <CardContent className="pt-6 pb-6 space-y-5">
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">

            {/* ── Step 1: Contact ── */}
            {step === "contact" && (
              <motion.div key="contact" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold">Verify Your Identity</h2>
                  <p className="text-sm text-muted-foreground">Enter your email or phone to receive an OTP</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    {isEmail(phoneOrEmail) ? <Mail className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
                    Email or Phone Number
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g. citizen@email.com or 9876543210"
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                    className="h-12 text-base border-2 hover:border-primary/50 transition-colors"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Your contact info is used only for complaint tracking
                  </p>
                </div>
                <Button onClick={sendOtp} disabled={loading} className="w-full h-12 text-base gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Send OTP
                </Button>
              </motion.div>
            )}

            {/* ── Step 2: OTP ── */}
            {step === "otp" && (
              <motion.div key="otp" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold">Enter OTP</h2>
                  <p className="text-sm text-muted-foreground">
                    6-digit code sent to <span className="font-semibold text-primary">{phoneOrEmail}</span>
                  </p>
                </div>

                {/* 6-box OTP input */}
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className={`h-14 w-12 text-center text-2xl font-bold rounded-xl border-2 bg-background transition-all outline-none focus:ring-2 focus:ring-primary/30 ${
                        digit ? "border-primary bg-primary/5" : "border-input hover:border-primary/50"
                      }`}
                    />
                  ))}
                </div>

                <Button onClick={verifyOtp} disabled={loading || otpValue.length < 6} className="w-full h-12 text-base gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Verify OTP
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button onClick={() => { setStep("contact"); setOtpDigits(["","","","","",""]); setError(null); }}
                    className="text-muted-foreground hover:text-primary transition-colors">
                    ← Change contact
                  </button>
                  {resendTimer > 0 ? (
                    <span className="text-muted-foreground">Resend in {resendTimer}s</span>
                  ) : (
                    <button onClick={sendOtp} disabled={loading} className="text-primary hover:underline flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" /> Resend OTP
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Form ── */}
            {step === "form" && (
              <motion.form key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="space-y-5" onSubmit={submitComplaint}>

                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold">Complaint Details</h2>
                  <p className="text-sm text-muted-foreground">Provide as much detail as possible</p>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat.value} type="button" onClick={() => setCategory(cat.value)}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 text-center transition-all text-xs font-medium ${
                          category === cat.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                        }`}>
                        <span className="text-lg">{cat.icon}</span>
                        <span className="leading-tight">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRIORITIES.map(p => (
                      <button key={p.value} type="button" onClick={() => setPriority(p.value)}
                        className={`py-2 px-1 rounded-xl border-2 text-xs font-semibold transition-all ${
                          priority === p.value ? `${p.color} bg-current/10` : "border-border hover:border-primary/40"
                        }`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="title">Subject <span className="text-destructive">*</span></Label>
                  <Input id="title" placeholder="e.g. Street light not working near Block B"
                    value={title} onChange={e => setTitle(e.target.value)}
                    className="border-2 hover:border-primary/50 transition-colors" />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="desc">Description <span className="text-destructive">*</span></Label>
                  <textarea id="desc" placeholder="Describe the issue in detail..."
                    value={description} onChange={e => setDescription(e.target.value)}
                    className="w-full min-h-[100px] rounded-xl border-2 border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-primary/50 transition-colors" />
                </div>

                {/* Location with auto-detect */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Location</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Enter location or use auto-detect"
                      value={location} onChange={e => setLocation(e.target.value)}
                      className="border-2 hover:border-primary/50 transition-colors flex-1" />
                    <Button type="button" variant="outline" size="sm" onClick={getLocation}
                      disabled={geoLoading} className="shrink-0 gap-1 border-2">
                      {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                      <span className="hidden sm:inline">Auto</span>
                    </Button>
                  </div>
                  {latitude && longitude && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> GPS: {latitude.toFixed(5)}, {longitude.toFixed(5)}
                    </p>
                  )}
                  {geoError && <p className="text-xs text-destructive">{geoError}</p>}
                </div>

                {/* Image Upload with Preview */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5" /> Photos / Documents
                    <Badge variant="secondary" className="text-xs">Optional</Badge>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {previews.map((src, i) => (
                      <div key={i} className="relative group">
                        <img src={src} alt={`preview-${i}`}
                          className="h-20 w-20 object-cover rounded-xl border-2 border-border" />
                        <button type="button" onClick={() => removeFile(i)}
                          className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-0.5 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity">
                          {files[i]?.name.slice(0, 10)}…
                        </div>
                      </div>
                    ))}
                    {files.length < 5 && (
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="h-20 w-20 rounded-xl border-2 border-dashed border-input hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-1 transition-all">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Add</span>
                      </button>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={handleFileChange} />
                  </div>
                  <p className="text-xs text-muted-foreground">Max 5 files, 5MB each. Images will be visible to admin.</p>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 text-base gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Submit Complaint
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
