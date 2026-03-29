"use client";

import * as React from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Download, ChevronLeft, ChevronRight, MapPin, Phone, Mail, Building2 } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";

const PUBLIC_HOLIDAYS: Record<string, string> = {
  "2026-01-01": "New Year's Day",
  "2026-01-14": "Makar Sankranti",
  "2026-01-26": "Republic Day",
  "2026-03-04": "Maha Shivratri",
  "2026-03-19": "Holi",
  "2026-03-21": "Gudi Padwa",
  "2026-03-26": "Ram Navami",
  "2026-03-31": "Id-ul-Fitr",
  "2026-04-14": "Dr. Ambedkar Jayanti",
  "2026-05-01": "Maharashtra Day",
  "2026-08-15": "Independence Day",
  "2026-10-02": "Gandhi Jayanti",
  "2026-10-20": "Dussehra",
  "2026-11-04": "Diwali",
  "2026-12-25": "Christmas",
};

const DAY_LABELS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LABELS_GU = ["રવિ", "સોમ", "મંગ", "બુધ", "ગુરુ", "શુક્ર", "શનિ"];

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function HolidayCalendar() {
  const { t, lang } = useLanguage();
  const today = new Date();
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prev = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); };

  const monthLabel = new Date(year, month).toLocaleString(lang === "gu" ? "gu-IN" : "default", { month: "long", year: "numeric" });

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const dayLabels = lang === "gu" ? DAY_LABELS_GU : DAY_LABELS_EN;

  function cellClass(day: number | null, col: number): string {
    if (!day) return "";
    const key = toKey(year, month, day);
    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const isHoliday = !!PUBLIC_HOLIDAYS[key];
    const isWeekend = col === 0 || col === 6;
    if (isToday && !isHoliday) return "bg-amber-500 text-white font-bold rounded-sm";
    if (isHoliday) return "bg-green-600 text-white font-semibold rounded-sm";
    if (isWeekend) return "bg-red-600 text-white font-semibold rounded-sm";
    return "text-slate-200";
  }

  return (
    <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="flex items-center justify-between bg-white/10 px-3 py-2.5">
        <button onClick={prev} aria-label="Previous month" className="flex h-7 w-7 items-center justify-center rounded-md text-white hover:bg-white/20 transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold text-white tracking-wide">{monthLabel}</span>
        <button onClick={next} aria-label="Next month" className="flex h-7 w-7 items-center justify-center rounded-md text-white hover:bg-white/20 transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-white/10">
        {dayLabels.map((d, i) => (
          <div key={d} className={`py-1.5 text-center text-[11px] font-bold tracking-wide ${i === 0 || i === 6 ? "text-amber-400" : "text-slate-300"}`}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          const col = idx % 7;
          const key = day ? toKey(year, month, day) : null;
          const title = key ? PUBLIC_HOLIDAYS[key] : undefined;
          return (
            <div key={idx} className="aspect-square flex items-center justify-center border border-white/[0.06] text-[11px]">
              {day ? (
                <span title={title} className={`flex h-[22px] w-[22px] items-center justify-center ${cellClass(day, col)}`}>
                  {day}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="px-3 pt-2.5 pb-1">
        <p className="text-[11px] text-slate-400 leading-snug">{t("footer.holiday.note")}</p>
        <div className="mt-2 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <span className="h-3 w-3 rounded-sm bg-green-600 shrink-0" />{t("footer.holiday.public")}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <span className="h-3 w-3 rounded-sm bg-red-600 shrink-0" />{t("footer.holiday.weekly")}
          </div>
        </div>
      </div>

      <div className="px-3 pb-3 pt-2">
        <Link href="/notices" className="inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 px-4 py-1.5 text-xs font-bold text-white transition-colors shadow-md shadow-amber-500/20">
          <Download className="h-3.5 w-3.5" />{t("footer.holiday.list")}
        </Link>
      </div>
    </div>
  );
}

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: Facebook },
  { label: "Twitter", href: "https://twitter.com", icon: Twitter },
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
];

export function PublicFooter() {
  const { t } = useLanguage();

  const quickLinks = [
    { key: "footer.link.home",        href: "/" },
    { key: "footer.link.track",       href: "/track" },
    { key: "footer.link.raise",       href: "/raise-complaint" },
    { key: "footer.link.notices",     href: "/notices" },
    { key: "footer.link.transparency",href: "/transparency" },
    { key: "footer.link.meetings",    href: "/meetings" },
    { key: "footer.link.budget",      href: "/budget" },
    { key: "footer.link.works",       href: "/public-works" },
    { key: "footer.link.rti",         href: "/rti" },
    { key: "footer.link.feedback",    href: "/feedback" },
    { key: "footer.link.emergency",   href: "/emergency" },
  ];

  return (
    <footer className="relative bg-[#0d1b3e] text-white overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-primary to-cyan-400" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}
      />

      <div className="relative container px-4 md:px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Col 1 — Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-base font-bold text-white leading-tight">SMC Portal</p>
                <p className="text-[11px] text-slate-400 leading-tight">Municipal Services</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">{t("footer.brand.desc")}</p>
            <div className="flex items-center gap-2">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:bg-primary/20 hover:border-primary/40 hover:text-white transition-all duration-200">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Quick links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-4">{t("footer.quicklinks")}</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
                    <span className="h-px w-3 bg-primary/50 group-hover:w-5 group-hover:bg-primary transition-all duration-200" />
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Contact */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-4">{t("footer.contact")}</h3>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-slate-300 leading-snug">
                  Municipal Corporation Building,<br />Main Road, City — 400001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a href="tel:+912212345678" className="text-sm text-slate-300 hover:text-white transition-colors">+91 22 1234 5678</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href="mailto:info@smc.gov.in" className="text-sm text-slate-300 hover:text-white transition-colors">info@smc.gov.in</a>
              </li>
            </ul>
            <div className="mt-5 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs font-semibold text-white mb-0.5">{t("footer.hours.title")}</p>
              <p className="text-xs text-slate-400">{t("footer.hours.weekday")}</p>
              <p className="text-xs text-slate-400">{t("footer.hours.weekend")}</p>
            </div>
          </div>

          {/* Col 4 — Holiday Calendar */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400 mb-4">{t("footer.holidays")}</h3>
            <HolidayCalendar />
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Smart Municipal Corporation. {t("footer.rights")}</p>
          <p className="text-xs text-slate-500">{t("footer.noauth")}</p>
        </div>
      </div>
    </footer>
  );
}
