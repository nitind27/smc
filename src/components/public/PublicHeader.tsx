"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Moon,
  Sun,
  Search,
  LayoutDashboard,
  FilePlus,
  Bell,
  LogIn,
  Menu,
  Building2,
  Home,
  Globe,
  ChevronDown,
  IndianRupee,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/providers/theme-provider";
import { useLanguage } from "@/providers/language-provider";

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  // IMPORTANT: now also getting "languages" from provider
  const { lang, setLang, t, languages } = useLanguage();

  const nav = [
    { key: "nav.track",        href: "/track",          icon: Search },
    { key: "nav.raise",        href: "/raise-complaint", icon: FilePlus },
    { key: "nav.notices",      href: "/notices",         icon: Bell },
    { key: "nav.services",     href: "/services",        icon: Building2 },
    { key: "nav.works",        href: "/public-works",    icon: Building2 },
    { key: "nav.budget",       href: "/budget",          icon: IndianRupee },
    { key: "nav.emergency",    href: "/emergency",       icon: AlertTriangle },
    { key: "nav.transparency", href: "/transparency",    icon: LayoutDashboard },
    { key: "nav.help",         href: "/help",            icon: HelpCircle },
  ];  // Show selected language label in dropdown button
  const selectedLanguage =
    languages.find((item) => item.code === lang)?.label || "English";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl shadow-sm">
      <div className="container flex h-14 md:h-[84px] items-center justify-between gap-6 px-4 md:px-6">
        {/* Mobile: hamburger */}
        <div className="flex lg:hidden shrink-0">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menu"
                className="rounded-lg"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-72 border-r border-border/50">
              <nav className="flex flex-col gap-1 pt-6">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Home className="h-4 w-4 text-muted-foreground" />
                  {t("nav.home")}
                </Link>

                {nav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {t(item.key)}
                    </Link>
                  );
                })}

                {/* Language switcher in mobile menu */}
                <div className="mt-4 pt-4 border-t border-border space-y-1">
                  <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {t("lang.select")}
                  </p>

                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        lang === l.code
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <Globe className="h-4 w-4" />
                      <span>{l.label}</span>
                      {lang === l.code && (
                        <span className="ml-auto text-xs text-primary">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-2">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    {t("nav.login")}
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link
          href="/"
          className="hidden md:flex items-center gap-0 min-w-0 transition-all duration-300 hover:opacity-95 hover:scale-[1.01] rounded-xl -m-1 px-1 py-1.5"
          aria-label="SMC Portal - Home"
        >
          {!logoError ? (
            <img
              src="/images/smc-removebg-preview.png"
              alt="SMC Logo"
              className="h-[84px] w-auto max-w-[320px] object-contain object-left drop-shadow-sm"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20 shadow-md">
              <Building2 className="h-6 w-6" />
            </span>
          )}
          <span className="hidden sm:inline -ml-4 text-lg md:text-xl font-bold tracking-tight text-foreground truncate">
            SMC Portal
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-lg px-3 transition-colors"
              >
                <Link href={item.href} className="gap-2 font-medium">
                  <Icon className="h-4 w-4 shrink-0" />
                  {t(item.key)}
                </Link>
              </Button>
            );
          })}
        </nav>

        {/* Right: language + theme + login */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {/* Language dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 rounded-lg text-muted-foreground hover:text-foreground px-2.5"
              >
                <Globe className="h-4 w-4" />
                <span className="text-xs font-semibold max-w-[80px] truncate">
                  {selectedLanguage}
                </span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-52 max-h-80 overflow-y-auto"
            >
              {languages.map((l) => (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`gap-2 cursor-pointer ${
                    lang === l.code ? "text-primary font-medium" : ""
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>{l.label}</span>
                  {lang === l.code && (
                    <span className="ml-auto text-primary text-xs">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            aria-label="Toggle theme"
            className="rounded-lg text-muted-foreground hover:text-foreground"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Staff login */}
          <Button size="sm" asChild className="rounded-lg font-semibold shadow-sm bg-[#1a3a6b] hover:bg-[#1a3a6b]/90 text-white gap-2">
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Staff Portal</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}