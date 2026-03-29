"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getNavForRole } from "@/config/navigation";
import { useAuth } from "@/providers/auth-provider";

interface SidebarProps {
  embedded?: boolean;
}

export function Sidebar({ embedded = false }: SidebarProps) {
  const pathname = usePathname();
  const { role } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);
  const [logoError, setLogoError] = React.useState(false);
  const navItems = getNavForRole(role);

  return (
    <aside
      className={cn(
        "relative flex h-full min-h-0 flex-col border-r bg-card/50 backdrop-blur-sm transition-all duration-300 ease-in-out",
        embedded ? "w-full border-0" : collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex h-[72px] shrink-0 items-center gap-0 border-b px-3">
        <Link href="/dashboard" className="flex items-center gap-0 min-w-0 overflow-hidden rounded-lg py-1 transition-opacity hover:opacity-95">
          {!logoError ? (
            <img
              src="/images/smc-removebg-preview.png"
              alt="SMC Logo"
              className={cn("h-[52px] w-auto object-contain object-left", collapsed ? "max-w-[52px]" : "max-w-[200px]")}
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
          )}
          {!collapsed && (
            <span className="ml-[-8px] truncate text-sm font-semibold">SMC Portal</span>
          )}
        </Link>
      </div>
      <ScrollArea className="flex-1 min-h-0 py-4">
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <React.Fragment key={item.href}>
                {item.children && item.children.length > 0 ? (
                  <>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </Link>
                    {!collapsed &&
                      item.children.map((child) => {
                        const childActive = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "ml-6 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                              childActive
                                ? "text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {child.title}
                          </Link>
                        );
                      })}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="truncate">{item.title}</span>}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </ScrollArea>
      {!embedded && (
        <>
          <Separator />
          <div className="shrink-0 p-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-full"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </>
      )}
    </aside>
  );
}
