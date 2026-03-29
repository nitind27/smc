import type { UserRole } from "@/types";
import {
  LayoutDashboard,
  MessageSquareWarning,
  Briefcase,
  Calendar,
  CheckSquare,
  FileText,
  CreditCard,
  Building2,
  Users,
  Bell,
  BarChart3,
  FileCheck,
  Home,
  Sparkles,
  Megaphone,
  Images,
  MapPin,
  Landmark,
  Scale,
  Forward,
  ClipboardList,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
  children?: { title: string; href: string }[];
}

const STAFF_ROLES: UserRole[] = ["admin", "department_head", "staff", "auditor"];
const GOVT_ROLES: UserRole[] = ["admin", "department_head", "staff", "auditor", "po", "collector", "dc"];
const PUBLIC_ONLY: UserRole[] = ["public"];
const PO_ROLES: UserRole[] = ["po"];
const COLLECTOR_ROLES: UserRole[] = ["collector"];
const DC_ROLES: UserRole[] = ["dc"];
const SENIOR_GOVT: UserRole[] = ["admin", "collector", "dc"];

export const SIDEBAR_NAV: NavItem[] = [
  // ── Common ──────────────────────────────────────────────────────────────
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },

  // ── Public ──────────────────────────────────────────────────────────────
  {
    title: "My Complaints",
    href: "/complaints",
    icon: MessageSquareWarning,
    roles: PUBLIC_ONLY,
    children: [
      { title: "My Complaints", href: "/complaints" },
      { title: "Submit New", href: "/complaints/submit" },
    ],
  },
  { title: "Notices", href: "/notices", icon: Megaphone, roles: PUBLIC_ONLY },
  { title: "Schemes", href: "/schemes", icon: Sparkles, roles: PUBLIC_ONLY },

  // ── Staff / Admin ────────────────────────────────────────────────────────
  {
    title: "Complaints",
    href: "/complaints",
    icon: MessageSquareWarning,
    roles: STAFF_ROLES,
    children: [{ title: "All Complaints", href: "/complaints" }],
  },
  { title: "Manage Notices", href: "/notices-admin", icon: Megaphone, roles: ["admin"] },
  {
    title: "Work & Projects",
    href: "/projects",
    icon: Briefcase,
    roles: STAFF_ROLES,
    children: [
      { title: "Projects", href: "/projects" },
      { title: "Salary", href: "/projects/salary" },
    ],
  },
  {
    title: "Meetings",
    href: "/schedule",
    icon: Calendar,
    roles: STAFF_ROLES,
    children: [
      { title: "Schedule", href: "/schedule" },
      { title: "Discussions", href: "/schedule/discussions" },
    ],
  },
  { title: "Tasks", href: "/tasks", icon: CheckSquare, roles: STAFF_ROLES },
  {
    title: "Bills & Approval",
    href: "/bills",
    icon: FileText,
    roles: STAFF_ROLES,
    children: [
      { title: "Submit Bill", href: "/bills/submit" },
      { title: "Approvals", href: "/bills/approvals" },
    ],
  },
  { title: "Payments", href: "/payments", icon: CreditCard, roles: STAFF_ROLES },
  { title: "Departments", href: "/departments", icon: Building2, roles: ["admin", "department_head"] },
  { title: "Staff", href: "/staff", icon: Users, roles: ["admin", "department_head"] },
  { title: "Notifications", href: "/notifications", icon: Bell, roles: STAFF_ROLES },
  { title: "Reports & Analytics", href: "/reports", icon: BarChart3, roles: STAFF_ROLES },
  { title: "Audit Trail", href: "/audit", icon: FileCheck, roles: ["admin", "auditor"] },
  { title: "Homepage Slider", href: "/hero-slider", icon: Images, roles: ["admin"] },

  // ── PO (Post Office / Ward Officer) ─────────────────────────────────────
  {
    title: "Ward Complaints",
    href: "/complaints",
    icon: MessageSquareWarning,
    roles: PO_ROLES,
    children: [
      { title: "Incoming", href: "/complaints" },
      { title: "Forward to Dept", href: "/po/forward" },
    ],
  },
  { title: "Ward Reports", href: "/po/reports", icon: ClipboardList, roles: PO_ROLES },
  { title: "Notifications", href: "/notifications", icon: Bell, roles: PO_ROLES },

  // ── Collector ────────────────────────────────────────────────────────────
  {
    title: "District Complaints",
    href: "/complaints",
    icon: MessageSquareWarning,
    roles: COLLECTOR_ROLES,
    children: [
      { title: "All Complaints", href: "/complaints" },
      { title: "Escalated", href: "/collector/escalated" },
    ],
  },
  { title: "Projects Overview", href: "/projects", icon: Briefcase, roles: COLLECTOR_ROLES },
  { title: "District Reports", href: "/collector/reports", icon: BarChart3, roles: COLLECTOR_ROLES },
  { title: "Approve Bills", href: "/bills/approvals", icon: FileText, roles: COLLECTOR_ROLES },
  { title: "Notifications", href: "/notifications", icon: Bell, roles: COLLECTOR_ROLES },

  // ── DC (Deputy Commissioner) ─────────────────────────────────────────────
  {
    title: "All Complaints",
    href: "/complaints",
    icon: MessageSquareWarning,
    roles: DC_ROLES,
    children: [
      { title: "All Complaints", href: "/complaints" },
      { title: "High Priority", href: "/dc/priority" },
    ],
  },
  { title: "All Projects", href: "/projects", icon: Briefcase, roles: DC_ROLES },
  { title: "DC Reports", href: "/dc/reports", icon: Scale, roles: DC_ROLES },
  { title: "Audit Trail", href: "/audit", icon: FileCheck, roles: DC_ROLES },
  { title: "Notifications", href: "/notifications", icon: Bell, roles: DC_ROLES },

  // ── Common bottom ────────────────────────────────────────────────────────
  { title: "Public Portal", href: "/", icon: Home },
];

export function getNavForRole(role: UserRole): NavItem[] {
  return SIDEBAR_NAV.filter((item) => !item.roles || item.roles.includes(role));
}
