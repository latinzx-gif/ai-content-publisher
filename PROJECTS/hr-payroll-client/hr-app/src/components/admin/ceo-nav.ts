import type { AdminNavItem } from "@/components/admin/admin-nav-types"

/** Sidebar สำหรับ CEO (role: ceo) — executive read-focused */
export const CEO_NAV_ITEMS: AdminNavItem[] = [
  { label: "Executive Dashboard", href: "/admin/ceo", icon: "layout-dashboard" },
  { label: "Employees", href: "/admin/employees", icon: "users" },
  { label: "Branches", href: "/admin/branches", icon: "building" },
  { label: "Reports & Analytics", href: "/admin/reports", icon: "bar-chart" },
]

export function isCeoNavActive(pathname: string, href: string): boolean {
  if (href === "/admin/ceo") {
    return pathname === "/admin/ceo"
  }
  return pathname.startsWith(href)
}
