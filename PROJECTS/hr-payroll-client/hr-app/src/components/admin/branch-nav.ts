import {
  ADMIN_NAV_ITEMS,
  type AdminNavItem,
} from "@/components/admin/admin-nav"
import { CEO_NAV_ITEMS } from "@/components/admin/ceo-nav"
import { isManagementDepartment } from "@/lib/auth/department-access"

/** BM portal — ไม่รวม /admin/branches (HR) */
export function isBranchPortalPath(pathname: string): boolean {
  return pathname === "/admin/branch" || pathname.startsWith("/admin/branch/")
}

/** ซ่อนจาก nav — redirect ไป /admin/branch */
export const HIDDEN_BRANCH_PATHS = [
  "/admin/branch/team",
  "/admin/branch/leaves",
  "/admin/branch/overtime",
  "/admin/branch/attendance",
] as const

/** BM sub-routes ซ่อนทั้งหมด — ใช้ Branch Dashboard เท่านั้น */
export const BRANCH_SECTION_ITEMS: AdminNavItem[] = []

/** Sidebar สำหรับ Branch Manager — hub only; tools อยู่ใน /admin/branch */
export const BRANCH_NAV_ITEMS: AdminNavItem[] = [
  {
    label: "Branch Dashboard",
    href: "/admin/branch",
    icon: "layout-dashboard",
  },
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
    return isBranchPortalPath(pathname)
  }
  return pathname.startsWith(href)
}
