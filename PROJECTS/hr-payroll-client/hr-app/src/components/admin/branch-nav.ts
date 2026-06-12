import {
  ADMIN_NAV_ITEMS,
  type AdminNavItem,
} from "@/components/admin/admin-nav"
import { CEO_NAV_ITEMS } from "@/components/admin/ceo-nav"

/** Sidebar สำหรับ Branch Manager — อนุมัติผ่านเว็บเท่านั้น */
export const BRANCH_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/branch", icon: "layout-dashboard" },
  { label: "Employees", href: "/admin/branch/team", icon: "users" },
  { label: "Attendance", href: "/admin/branch/attendance", icon: "clock" },
  { label: "Leave Management", href: "/admin/branch/leaves", icon: "calendar" },
  { label: "Approve OT", href: "/admin/branch/overtime", icon: "timer" },
]

export function getNavItemsForRole(
  role: "employee" | "hr" | "admin" | "branch_manager" | "ceo" | "dev"
): AdminNavItem[] {
  if (role === "branch_manager") return BRANCH_NAV_ITEMS
  if (role === "ceo") return CEO_NAV_ITEMS
  return ADMIN_NAV_ITEMS
}

export function withBranchPendingBadges(
  items: AdminNavItem[],
  counts: { attendance: number; leaves: number; total: number }
): AdminNavItem[] {
  return items.map((item) => {
    if (item.href === "/admin/branch") {
      return counts.total > 0 ? { ...item, badge: counts.total } : item
    }
    if (item.href === "/admin/branch/attendance") {
      return counts.attendance > 0 ? { ...item, badge: counts.attendance } : item
    }
    if (item.href === "/admin/branch/leaves") {
      return counts.leaves > 0 ? { ...item, badge: counts.leaves } : item
    }
    return item
  })
}

export function isBranchNavActive(pathname: string, href: string): boolean {
  if (href === "/admin/branch") {
    return pathname === "/admin/branch"
  }
  return pathname.startsWith(href)
}
