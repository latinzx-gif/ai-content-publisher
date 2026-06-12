import {
  ADMIN_NAV_ITEMS,
  type AdminNavItem,
} from "@/components/admin/admin-nav"
import { CEO_NAV_ITEMS } from "@/components/admin/ceo-nav"
import { isManagementDepartment } from "@/lib/auth/department-access"

/** ซ่อนจาก nav — redirect ไป /admin/branch */
export const HIDDEN_BRANCH_PATHS = [
  "/admin/branch/team",
  "/admin/branch/leaves",
  "/admin/branch/overtime",
] as const

/** Dev all-mode only — BM tools ที่ยังเปิดใช้ (ไม่รวม team/leaves/overtime) */
export const BRANCH_SECTION_ITEMS: AdminNavItem[] = [
  { label: "Attendance", href: "/admin/branch/attendance", icon: "clock" },
]

/** Sidebar สำหรับ Branch Manager — hub only; tools อยู่ใน /admin/branch */
export const BRANCH_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin/branch", icon: "layout-dashboard" },
]

/** แผนก Management + role Employee — Dashboard เท่านั้น */
export const MANAGEMENT_EMPLOYEE_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "layout-dashboard" },
]

export function getNavItemsForRole(
  role: "employee" | "hr" | "admin" | "branch_manager" | "ceo" | "dev",
  department: string | null = null
): AdminNavItem[] {
  if (role === "branch_manager") return BRANCH_NAV_ITEMS
  if (role === "ceo") return CEO_NAV_ITEMS
  if (role === "employee" && isManagementDepartment(department)) {
    return MANAGEMENT_EMPLOYEE_NAV_ITEMS
  }
  return ADMIN_NAV_ITEMS
}

export function withBranchPendingBadges(
  items: AdminNavItem[],
  counts: { total: number }
): AdminNavItem[] {
  return items.map((item) => {
    if (item.href === "/admin/branch") {
      return counts.total > 0 ? { ...item, badge: counts.total } : item
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
