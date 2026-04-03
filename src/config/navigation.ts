import type { UserRole } from "@/types";
import {
  LayoutDashboard, MessageSquareWarning, Briefcase, Calendar,
  CheckSquare, FileText, CreditCard, Building2, Users, Bell,
  BarChart3, FileCheck, Home, Sparkles, Megaphone, Images,
  Scale, ClipboardList, Landmark,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  children?: { title: string; href: string }[];
}

// Role groups
const ADMIN_ONLY:      UserRole[] = ["admin"];
const ADMIN_DEPT:      UserRole[] = ["admin", "department_head"];
const STAFF_ROLES:     UserRole[] = ["admin", "department_head", "staff", "auditor"];
const AUDIT_ROLES:     UserRole[] = ["admin", "auditor", "dc"];
const PUBLIC_ONLY:     UserRole[] = ["public"];
const PO_ROLES:        UserRole[] = ["po"];
const COLLECTOR_ROLES: UserRole[] = ["collector"];
const DC_ROLES:        UserRole[] = ["dc"];

export const SIDEBAR_NAV: NavItem[] = [

  // ── All roles ────────────────────────────────────────────────────────────
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },

  // ── Public citizen ───────────────────────────────────────────────────────
  {
    title: "My Complaints",
    href: "/complaints",
    icon: MessageSquareWarning,
    roles: PUBLIC_ONLY,
    children: [
      { title: "My Complaints", href: "/complaints" },
      { title: "Submit New",    href: "/complaints/submit" },
    ],
  },
  { title: "Notices",  href: "/notices",  icon: Megaphone, roles: PUBLIC_ONLY },
  { title: "Schemes",  href: "/schemes",  icon: Sparkles,  roles: PUBLIC_ONLY },

  // ── Admin ────────────────────────────────────────────────────────────────
  {
    title: "Complaints",
    href: "/complaints",
    icon: MessageSquareWarning,
    roles: ADMIN_ONLY,
    children: [{ title: "All Complaints", href: "/complaints" }],
  },
  { title: "Manage Notices",   href: "/notices-admin", icon: Megaphone,  roles: ADMIN_ONLY },
  { title: "Homepage Slider",  href: "/hero-slider",   icon: Images,     roles: ADMIN_ONLY },
  { title: "Staff",            href: "/staff",         icon: Users,      roles: ADMIN_ONLY },
  { title: "Departments",      href: "/departments",   icon: Building2,  roles: ADMIN_ONLY },
  {
    title: "Work & Projects",
    href: "/projects",
    icon: Briefcase,
    roles: ADMIN_ONLY,
    children: [
      { title: "Projects", href: "/projects" },
      { title: "Salary",   href: "/projects/salary" },
    ],
  },
  {
    title: "Meetings",
    href: "/schedule",
    icon: Calendar,
    roles: ADMIN_ONLY,
    children: [
      { title: "Schedule",    href: "/schedule" },
      { title: "Discussions", href: "/schedule/discussions" },
    ],
  },
  { title: "Tasks",   href: "/tasks",   icon: CheckSquare, roles: ADMIN_ONLY },
  {
    title: "Bills & Approval",
    href: "/bills",
    icon: FileText,
    roles: ADMIN_ONLY,
    children: [
      { title: "Submit Bill", href: "/bills/submit" },
      { title: "Approvals",   href: "/bills/approvals" },
    ],
  },
  { title: "Payments",           href: "/payments",      icon: CreditCard, roles: ADMIN_ONLY },
  { title: "Notifications",      href: "/notifications", icon: Bell,       roles: ADMIN_ONLY },
  { title: "Reports & Analytics",href: "/reports",       icon: BarChart3,  roles: ADMIN_ONLY },
  { title: "Audit Trail",        href: "/audit",         icon: FileCheck,  roles: ADMIN_ONLY },

  // ── Department Head ──────────────────────────────────────────────────────
  {
    title: "Complaints",
    href: "/complaints",
    icon: MessageSquareWarning,
    roles: ["department_head"],
    children: [{ title: "All Complaints", href: "/complaints" }],
  },
  { title: "Departments", href: "/departments", icon: Building2, roles: ["department_head"] },
  { title: "Staff",       href: "/staff",       icon: Users,     roles: ["department_head"] },
  {
    title: "Work & Projects",
    href: "/projects",
    icon: Briefcase,
    roles: ["department_head"],
    children: [
      { title: "Projects", href: "/projects" },
      { title: "Salary",   href: "/projects/salary" },
    ],
  },
  {
    title: "Meetings",
    href: "/schedule",
    icon: Calendar,
    roles: ["department_head"],
    children: [
      { title: "Schedule",    href: "/schedule" },
      { title: "Discussions", href: "/schedule/discussions" },
    ],
  },
  { title: "Tasks",   href: "/tasks",   icon: CheckSquare, roles: ["department_head"] },
  {
    title: "Bills & Approval",
    href: "/bills",
    icon: FileText,
    roles: ["department_head"],
    children: [
      { title: "Submit Bill", href: "/bills/submit" },
      { title: "Approvals",   href: "/bills/approvals" },
    ],
  },
  { title: "Notifications",      href: "/notifications", icon: Bell,      roles: ["department_head"] },
  { title: "Reports & Analytics",href: "/reports",       icon: BarChart3, roles: ["department_head"] },

  // ── Staff ────────────────────────────────────────────────────────────────
  {
    title: "Complaints",
    href: "/complaints",
    icon: MessageSquareWarning,
    roles: ["staff"],
    children: [{ title: "All Complaints", href: "/complaints" }],
  },
  {
    title: "Meetings",
    href: "/schedule",
    icon: Calendar,
    roles: ["staff"],
    children: [
      { title: "Schedule",    href: "/schedule" },
      { title: "Discussions", href: "/schedule/discussions" },
    ],
  },
  { title: "Tasks",         href: "/tasks",         icon: CheckSquare, roles: ["staff"] },
  { title: "Bills",         href: "/bills/submit",  icon: FileText,    roles: ["staff"] },
  { title: "Notifications", href: "/notifications", icon: Bell,        roles: ["staff"] },

  // ── Auditor ──────────────────────────────────────────────────────────────
  {
    title: "Complaints",
    href: "/complaints",
    icon: MessageSquareWarning,
    roles: ["auditor"],
    children: [{ title: "All Complaints", href: "/complaints" }],
  },
  { title: "Bills",                href: "/bills",         icon: FileText,  roles: ["auditor"] },
  { title: "Reports & Analytics",  href: "/reports",       icon: BarChart3, roles: ["auditor"] },
  { title: "Audit Trail",          href: "/audit",         icon: FileCheck, roles: ["auditor"] },
  { title: "Notifications",        href: "/notifications", icon: Bell,      roles: ["auditor"] },

  // ── PO / Ward Officer ────────────────────────────────────────────────────
  {
    title: "Ward Complaints",
    href: "/complaints",
    icon: MessageSquareWarning,
    roles: PO_ROLES,
    children: [{ title: "All Complaints", href: "/complaints" }],
  },
  { title: "Notifications", href: "/notifications", icon: Bell,      roles: PO_ROLES },
  { title: "Reports",       href: "/reports",       icon: BarChart3, roles: PO_ROLES },

  // ── Collector ────────────────────────────────────────────────────────────
  {
    title: "District Complaints",
    href: "/complaints",
    icon: MessageSquareWarning,
    roles: COLLECTOR_ROLES,
    children: [{ title: "All Complaints", href: "/complaints" }],
  },
  { title: "Projects Overview", href: "/projects",       icon: Briefcase,  roles: COLLECTOR_ROLES },
  { title: "Bill Approvals",    href: "/bills/approvals",icon: FileText,   roles: COLLECTOR_ROLES },
  { title: "Reports",           href: "/reports",        icon: BarChart3,  roles: COLLECTOR_ROLES },
  { title: "Notifications",     href: "/notifications",  icon: Bell,       roles: COLLECTOR_ROLES },

  // ── DC (Deputy Commissioner) ─────────────────────────────────────────────
  {
    title: "All Complaints",
    href: "/complaints",
    icon: MessageSquareWarning,
    roles: DC_ROLES,
    children: [{ title: "All Complaints", href: "/complaints" }],
  },
  { title: "All Projects",  href: "/projects",      icon: Briefcase,  roles: DC_ROLES },
  { title: "Reports",       href: "/reports",       icon: BarChart3,  roles: DC_ROLES },
  { title: "Audit Trail",   href: "/audit",         icon: FileCheck,  roles: DC_ROLES },
  { title: "Notifications", href: "/notifications", icon: Bell,       roles: DC_ROLES },

  // ── Common bottom ────────────────────────────────────────────────────────
  { title: "Public Portal", href: "/", icon: Home },
];

export function getNavForRole(role: UserRole): NavItem[] {
  return SIDEBAR_NAV.filter((item) => !item.roles || item.roles.includes(role));
}
