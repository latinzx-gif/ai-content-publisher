import type { AdminNavItem } from "@/components/admin/admin-nav-types"

export type { AdminNavItem, AdminNavIconName } from "@/components/admin/admin-nav-types"

/** Sidebar navigation — aligned with HR Admin Dashboard mockup (12441) */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "layout-dashboard" },
  { label: "Employees", href: "/admin/employees", icon: "users" },
  { label: "Branches", href: "/admin/branches", icon: "building" },
  { label: "HR Approval Queue", href: "/admin/manager", icon: "building" },
  { label: "Organization", href: "/admin/organization", icon: "building" },
  { label: "Attendance", href: "/admin/attendance", icon: "clock" },
  { label: "Leave Management", href: "/admin/leaves", icon: "calendar" },
  { label: "Overtime", href: "/admin/overtime", icon: "timer" },
  { label: "Payroll", href: "/admin/payroll", icon: "wallet" },
  // Performance, Recruitment & Training hidden — routes remain at /admin/performance, /admin/recruitment, /admin/training
  { label: "Documents", href: "/admin/documents", icon: "file-text" },
  { label: "Complaints", href: "/admin/complaints", icon: "message-warning" },
  { label: "Announcements", href: "/admin/announcements", icon: "megaphone" },
  { label: "Reports & Analytics", href: "/admin/reports", icon: "bar-chart" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
]

export function isAdminNavActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)
}
