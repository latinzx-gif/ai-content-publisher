import type { AdminNavGroup, AdminNavItem } from "@/components/admin/admin-nav-types"

export type { AdminNavItem, AdminNavIconName, AdminNavGroup } from "@/components/admin/admin-nav-types"

/** Grouped sidebar navigation — 3 sections per sitemap */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    title: "Human Management",
    items: [
      { label: "Dashboard", href: "/admin", icon: "layout-dashboard" },
      { label: "Employee", href: "/admin/employees", icon: "users" },
      { label: "Approval", href: "/admin/manager", icon: "list-checks" },
      { label: "Attendance", href: "/admin/attendance", icon: "clock" },
      { label: "Leave Management", href: "/admin/leaves", icon: "calendar" },
      { label: "Overtime", href: "/admin/overtime", icon: "timer" },
      { label: "Announcements", href: "/admin/announcements", icon: "megaphone" },
      { label: "Complaints", href: "/admin/complaints", icon: "message-warning" },
      { label: "Documents", href: "/admin/documents", icon: "file-text" },
    ],
  },
  {
    title: "Accounting",
    items: [{ label: "Payroll", href: "/admin/payroll", icon: "wallet" }],
  },
  {
    title: "Management",
    items: [
      { label: "Organization", href: "/admin/organization", icon: "organization" },
      { label: "Branches", href: "/admin/branches", icon: "branches" },
      { label: "Report & Analytics", href: "/admin/report", icon: "bar-chart" },
      { label: "Inventory", href: "/admin/inventory", icon: "inventory" },
      { label: "Setting", href: "/admin/settings", icon: "settings" },
    ],
  },
]

/** Flatten groups for backward-compatible consumers */
export function flattenAdminNavGroups(groups: AdminNavGroup[]): AdminNavItem[] {
  return groups.flatMap((group) => group.items)
}

/** @deprecated Use ADMIN_NAV_GROUPS — flat list kept for legacy imports */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = flattenAdminNavGroups(ADMIN_NAV_GROUPS)

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin/report") {
    return pathname === "/admin/report" || pathname.startsWith("/admin/report/")
  }
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)
}
