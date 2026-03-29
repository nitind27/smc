"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2,
  Mail, KeyRound, ShieldCheck, Building2, Shield,
  Users, FileCheck, MapPin, Landmark, Scale, User,
  ChevronRight, Lock, AlertCircle,
} from "lucide-react";
import type { UserRole } from "@/types";

// ── Role Portal Config ────────────────────────────────────────────────────────
const ROLE_PORTALS: Array<{
  role: UserRole;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  badge: string;
  badgeColor: string;
  desc: string;
}> = [
  {
    role: "admin",
    title: "Municipal Admin",
    subtitle: "Full system control",
    icon: Shield,
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "Super Admin",
    badgeColor: "bg-red-100 text-red-700",
    desc: "Manage all departments, staff, complaints, budgets and system settings",
  },
  {
    role: "dc",
    title: "Deputy Commissioner",
    subtitle: "District authority",
    icon: Scale,
    color: "text-slate-700",
    bg: "bg-slate-50",
    border: "border-slate-200",
    badge: "DC Office",
    badgeColor: "bg-slate-100 text-slate-700",
    desc: "District-level governance, compliance oversight and final authority",
  },
  {
    role: "collector",
    title: "District Collector",
    subtitle: "District oversight",
    icon: Landmark,
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    badge: "Collectorate",
    badgeColor: "bg-indigo-100 text-indigo-700",
    desc: "Monitor district complaints, approve major projects and bills",
  },
  {
    role: "department_head",
    title: "Department Head",
    subtitle: "Department management",
    icon: Building2,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "Dept. Head",
    badgeColor: "bg-emerald-100 text-emerald-700",
    desc: "Manage department staff, assign complaints and approve department bills",
  },
  {
    role: "po",
    title: "Post Office / Ward Officer",
    subtitle: "Ward-level operations",
    icon: MapPin,
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    badge: "Ward Officer",
    badgeColor: "bg-orange-100 text-orange-700",
    desc: "Receive citizen complaints, verify and forward to relevant departments",
  },
  {
    role: "staff",
    title: "Municipal Staff",
    subtitle: "Field operations",
    icon: Users,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "Staff",
    badgeColor: "bg-blue-100 text-blue-700",
    desc: "Handle assigned complaints, update task progress and submit bills",
  },
  {
    role: "auditor",
    title: "Auditor",
    subtitle: "Compliance & audit",
    icon: FileCheck,
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    badge: "Auditor",
    badgeColor: "bg-violet-100 text-violet-700",
    desc: "Review audit logs, verify bills and generate compliance reports",
  },
  {
    role: "public",
    title: "Citizen / Public",
    subtitle: "Citizen services",
    icon: User,
    color: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-teal-200",
    badge: "Citizen",
    badgeColor: "bg-teal-100 text-teal-700",
    desc: "Track complaints, view notices and access public services",
  },
];

// ── Complaint Transfer Flow ───────────────────────────────────────────────────
const TRANSFER_FLOW = [
  { from: "Citizen", to: "PO / Ward Officer", action: "Submits complaint", color: "bg-teal-500" },
  { from: "PO / Ward Officer", to: "Department Head", action: "Verifies & forwards", color: "bg-orange-500" },
  { from: "Department Head", to: "Staff Member", action: "Assigns to staff", color: "bg-emerald-500" },
  { from: "Staff Member", to: "Department Head", action: "Updates progress", color: "bg-blue-500" },
  { from: "Department Head", to: "Collector / DC", action: "Escalates if needed", color: "bg-indigo-500" },
  { from: "Collector / DC", to: "Resolved", action: "Final approval", color: "bg-violet-500" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function PasswordInput({ id, value, onChange, placeholder, autoComplete }: {
  id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; autoComplete?: string;
}) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <Input id={id} type={show ? "text" : "password"} value={value}
        onChange={e => onChange(e.target.value)} placeholder={placeholder ?? "••••••••"}
        autoComplete={autoComplete}
        className="pr-10 h-11 border-2 focus:border-[#1a3a6b]" />
      <button type="button" onClick={() => setShow(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

type Step = "portal" | "login" | "fp-email" | "fp-otp" | "fp-reset" | "fp-done";

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const { user, login, isLoading } = useAuth();

  const [step, setStep] = React.useState<Step>("portal");
  const [selectedRole, setSelectedRole] = React.useState<typeof ROLE_PORTALS[0] | null>(null);
  const [showFlow, setShowFlow] = React.useState(false);

  // login
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState("");
  const [loginBusy, setLoginBusy] = React.useState(false);

  // forgot password
  const [fpEmail, setFpEmail] = React.useState("");
  const [fpOtp, setFpOtp] = React.useState("");
  const [fpNew, setFpNew] = React.useState("");
  const [fpConfirm, setFpConfirm] = React.useState("");
  const [fpError, setFpError] = React.useState("");
  const [fpBusy, setFpBusy] = React.useState(false);
  const [resendTimer, setResendTimer] = React.useState(0);
  const otpRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const [otpDigits, setOtpDigits] = React.useState(["","","","","",""]);

  React.useEffect(() => {
    if (!isLoading && user) router.replace("/dashboard");
  }, [user, isLoading, router]);

  React.useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleSelectRole = (portal: typeof ROLE_PORTALS[0]) => {
    setSelectedRole(portal);
    setEmail("");
    setPassword("");
    setLoginError("");
    setStep("login");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!email.trim() || !password) { setLoginError("Email and password are required."); return; }
    setLoginBusy(true);
    const result = await login({ email: email.trim(), password });
    setLoginBusy(false);
    if (result.error) { setLoginError(result.error); return; }
    router.replace("/dashboard");
  };

  const sendOtp = async (resend = false) => {
    setFpError("");
    if (!fpEmail.trim()) { setFpError("Enter your email address."); return; }
    setFpBusy(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setFpError(data.error ?? "Failed to send OTP"); return; }
      setStep("fp-otp");
      setResendTimer(60);
      setOtpDigits(["","","","","",""]);
    } catch { setFpError("Network error."); }
    finally { setFpBusy(false); }
  };

  const handleOtpChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits]; next[i] = digit; setOtpDigits(next);
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };
  const otpValue = otpDigits.join("");

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpError("");
    if (otpValue.length < 6) { setFpError("Enter all 6 digits."); return; }
    setFpBusy(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneOrEmail: fpEmail.trim(), otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) { setFpError(data.error ?? "Invalid OTP"); return; }
      setStep("fp-reset");
    } catch { setFpError("Network error."); }
    finally { setFpBusy(false); }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpError("");
    if (fpNew.length < 8) { setFpError("Password must be at least 8 characters."); return; }
    if (fpNew !== fpConfirm) { setFpError("Passwords do not match."); return; }
    setFpBusy(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail.trim(), otp: otpValue, newPassword: fpNew }),
      });
      const data = await res.json();
      if (!res.ok) { setFpError(data.error ?? "Failed to reset password"); return; }
      setStep("fp-done");
    } catch { setFpError("Network error."); }
    finally { setFpBusy(false); }
  };

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8]">
      <Loader2 className="h-8 w-8 animate-spin text-[#1a3a6b]" />
    </div>
  );
  if (user) return null;

  // ── Portal Selection Screen ───────────────────────────────────────────────
  if (step === "portal") {
    return (
      <div className="min-h-screen bg-[#f0f4f8]">
        {/* Gov Header */}
        <div className="bg-[#1a3a6b] text-white">
          <div className="container mx-auto px-4 py-5 max-w-6xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Building2 className="h-7 w-7 text-yellow-300" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Smart Municipal Corporation</h1>
                  <p className="text-white/60 text-xs">Official Staff Login Portal</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-white/50" />
                <span className="text-xs text-white/50">Secure Login</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-[#1a3a6b]">Select Your Login Portal</h2>
            <p className="text-gray-500 text-sm">Choose your role to access the appropriate dashboard</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="h-px w-16 bg-[#1a3a6b]/20" />
              <span className="text-xs text-gray-400 uppercase tracking-widest">Authorized Personnel Only</span>
              <div className="h-px w-16 bg-[#1a3a6b]/20" />
            </div>
          </div>

          {/* Role Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROLE_PORTALS.map((portal, i) => {
              const Icon = portal.icon;
              return (
                <button key={portal.role} onClick={() => handleSelectRole(portal)}
                  className={`group text-left bg-white rounded-2xl border-2 ${portal.border} shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden`}>
                  <div className={`h-1.5 w-full ${portal.bg.replace("bg-", "bg-gradient-to-r from-").replace("-50", "-400")} to-transparent`} />
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl ${portal.bg} group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${portal.color}`} />
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${portal.badgeColor}`}>
                        {portal.badge}
                      </span>
                    </div>
                    <div>
                      <h3 className={`font-bold text-base ${portal.color}`}>{portal.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{portal.subtitle}</p>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{portal.desc}</p>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${portal.color} group-hover:gap-2 transition-all`}>
                      Login <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Complaint Transfer Flow */}
          <div className="bg-white rounded-2xl border-2 border-[#1a3a6b]/10 shadow-md overflow-hidden">
            <button onClick={() => setShowFlow(f => !f)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#1a3a6b]/10 rounded-xl">
                  <ChevronRight className={`h-5 w-5 text-[#1a3a6b] transition-transform ${showFlow ? "rotate-90" : ""}`} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-[#1a3a6b]">Complaint Transfer Flow</p>
                  <p className="text-xs text-gray-500">How complaints move through the system</p>
                </div>
              </div>
              <Badge className="bg-[#1a3a6b]/10 text-[#1a3a6b] border-0">View Flow</Badge>
            </button>
            {showFlow && (
              <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap">
                  {TRANSFER_FLOW.map((step, i) => (
                    <React.Fragment key={i}>
                      <div className="flex flex-col items-center gap-1 min-w-[100px]">
                        <div className={`h-2 w-2 rounded-full ${step.color}`} />
                        <div className="text-center">
                          <p className="text-xs font-bold text-gray-800">{step.from}</p>
                          <p className="text-xs text-gray-500 italic">{step.action}</p>
                        </div>
                      </div>
                      {i < TRANSFER_FLOW.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 hidden sm:block" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  <strong>Note:</strong> Registration is disabled. Only the Admin can create new user accounts from the Staff Management panel.
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-400">
            Unauthorized access is prohibited. All login attempts are logged and monitored.
          </p>
        </div>
      </div>
    );
  }

  // ── Login Form ────────────────────────────────────────────────────────────
  if (step === "login" && selectedRole) {
    const Icon = selectedRole.icon;
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex flex-col">
        <div className="bg-[#1a3a6b] text-white">
          <div className="container mx-auto px-4 py-4 max-w-6xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-yellow-300" />
              <span className="font-bold text-sm">SMC Portal</span>
            </div>
            <button onClick={() => setStep("portal")} className="flex items-center gap-1 text-white/70 hover:text-white text-sm transition-colors">
              <ArrowLeft className="h-4 w-4" /> All Portals
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-5">
            {/* Role Header Card */}
            <div className={`bg-white rounded-2xl border-2 ${selectedRole.border} shadow-lg p-5`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${selectedRole.bg}`}>
                  <Icon className={`h-8 w-8 ${selectedRole.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className={`text-xl font-bold ${selectedRole.color}`}>{selectedRole.title}</h2>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedRole.badgeColor}`}>
                      {selectedRole.badge}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{selectedRole.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Login Form */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-6 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Sign In</h3>
                <p className="text-sm text-gray-500">Enter your credentials to access the portal</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                    <p className="text-sm text-red-600">{loginError}</p>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                  <Input id="email" type="email" autoComplete="email"
                    placeholder="your@municipal.gov"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="h-11 border-2 focus:border-[#1a3a6b]" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                    <button type="button"
                      onClick={() => { setStep("fp-email"); setFpEmail(email); setFpError(""); }}
                      className="text-xs text-[#1a3a6b] hover:underline font-medium">
                      Forgot password?
                    </button>
                  </div>
                  <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="current-password" />
                </div>
                <Button type="submit" disabled={loginBusy}
                  className="w-full h-11 bg-[#1a3a6b] hover:bg-[#1a3a6b]/90 font-semibold gap-2 shadow-lg">
                  {loginBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  {loginBusy ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    <strong>No self-registration.</strong> Contact your administrator to get access credentials.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400">
              All login attempts are logged and monitored for security.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Forgot Password Flow ──────────────────────────────────────────────────
  const fpHeader = (
    <div className="bg-[#1a3a6b] text-white">
      <div className="container mx-auto px-4 py-4 max-w-6xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-yellow-300" />
          <span className="font-bold text-sm">SMC Portal — Password Reset</span>
        </div>
        <button onClick={() => { setStep("login"); setFpError(""); }}
          className="flex items-center gap-1 text-white/70 hover:text-white text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </button>
      </div>
    </div>
  );

  if (step === "fp-email") return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">
      {fpHeader}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1a3a6b]/10 rounded-xl"><Mail className="h-6 w-6 text-[#1a3a6b]" /></div>
            <div>
              <h3 className="text-lg font-bold">Forgot Password</h3>
              <p className="text-sm text-gray-500">Enter your registered email</p>
            </div>
          </div>
          {fpError && <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3"><AlertCircle className="h-4 w-4 text-red-600 shrink-0" /><p className="text-sm text-red-600">{fpError}</p></div>}
          <div className="space-y-1.5">
            <Label className="font-semibold text-gray-700">Email Address</Label>
            <Input type="email" placeholder="your@municipal.gov" value={fpEmail}
              onChange={e => setFpEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && sendOtp()}
              className="h-11 border-2 focus:border-[#1a3a6b]" />
          </div>
          <Button onClick={() => sendOtp()} disabled={fpBusy} className="w-full h-11 bg-[#1a3a6b] hover:bg-[#1a3a6b]/90 gap-2">
            {fpBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Send OTP
          </Button>
        </div>
      </div>
    </div>
  );

  if (step === "fp-otp") return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">
      {fpHeader}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1a3a6b]/10 rounded-xl"><ShieldCheck className="h-6 w-6 text-[#1a3a6b]" /></div>
            <div>
              <h3 className="text-lg font-bold">Enter OTP</h3>
              <p className="text-sm text-gray-500">Sent to <span className="font-semibold text-[#1a3a6b]">{fpEmail}</span></p>
            </div>
          </div>
          {fpError && <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3"><AlertCircle className="h-4 w-4 text-red-600 shrink-0" /><p className="text-sm text-red-600">{fpError}</p></div>}
          <form onSubmit={verifyOtp} className="space-y-5">
            <div className="flex justify-center gap-2">
              {otpDigits.map((digit, i) => (
                <input key={i} ref={el => { otpRefs.current[i] = el; }} type="text" inputMode="numeric"
                  maxLength={1} value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  className={`h-14 w-12 text-center text-2xl font-bold rounded-xl border-2 bg-background outline-none focus:ring-2 focus:ring-[#1a3a6b]/30 transition-all ${digit ? "border-[#1a3a6b] bg-[#1a3a6b]/5" : "border-input hover:border-[#1a3a6b]/50"}`} />
              ))}
            </div>
            <Button type="submit" disabled={fpBusy || otpValue.length < 6} className="w-full h-11 bg-[#1a3a6b] hover:bg-[#1a3a6b]/90 gap-2">
              {fpBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Verify OTP
            </Button>
          </form>
          <div className="flex items-center justify-between text-sm">
            <button onClick={() => { setStep("fp-email"); setOtpDigits(["","","","","",""]); }} className="text-gray-500 hover:text-[#1a3a6b]">← Change email</button>
            {resendTimer > 0 ? <span className="text-gray-400 text-xs">Resend in {resendTimer}s</span> :
              <button onClick={() => sendOtp(true)} disabled={fpBusy} className="text-[#1a3a6b] hover:underline text-xs font-medium">Resend OTP</button>}
          </div>
        </div>
      </div>
    </div>
  );

  if (step === "fp-reset") return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col">
      {fpHeader}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1a3a6b]/10 rounded-xl"><KeyRound className="h-6 w-6 text-[#1a3a6b]" /></div>
            <div>
              <h3 className="text-lg font-bold">Set New Password</h3>
              <p className="text-sm text-gray-500">Choose a strong password</p>
            </div>
          </div>
          {fpError && <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3"><AlertCircle className="h-4 w-4 text-red-600 shrink-0" /><p className="text-sm text-red-600">{fpError}</p></div>}
          <form onSubmit={resetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-semibold text-gray-700">New Password</Label>
              <PasswordInput id="fp-new" value={fpNew} onChange={setFpNew} placeholder="Min. 8 characters" autoComplete="new-password" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-gray-700">Confirm Password</Label>
              <PasswordInput id="fp-confirm" value={fpConfirm} onChange={setFpConfirm} placeholder="Re-enter password" autoComplete="new-password" />
              {fpConfirm && fpConfirm !== fpNew && <p className="text-xs text-red-500">Passwords do not match</p>}
            </div>
            <Button type="submit" disabled={fpBusy || (!!fpConfirm && fpConfirm !== fpNew)} className="w-full h-11 bg-[#1a3a6b] hover:bg-[#1a3a6b]/90 gap-2">
              {fpBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );

  if (step === "fp-done") return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border-2 border-emerald-200 shadow-lg p-8 text-center space-y-5">
        <div className="flex justify-center"><div className="p-4 bg-emerald-100 rounded-full"><CheckCircle2 className="h-12 w-12 text-emerald-500" /></div></div>
        <h3 className="text-xl font-bold text-gray-900">Password Reset Successful</h3>
        <p className="text-gray-600 text-sm">Your password has been updated. You can now sign in with your new password.</p>
        <Button onClick={() => { setStep("portal"); setFpEmail(""); setFpNew(""); setFpConfirm(""); setOtpDigits(["","","","","",""]); }}
          className="w-full bg-[#1a3a6b] hover:bg-[#1a3a6b]/90">
          Back to Portal Selection
        </Button>
      </div>
    </div>
  );

  return null;
}
