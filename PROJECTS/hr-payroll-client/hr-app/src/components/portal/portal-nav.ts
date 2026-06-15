import type { AdminNavItem } from "@/components/admin/admin-nav-types"

export const PORTAL_NAV_ITEMS: AdminNavItem[] = [
  { label: "หน้าหลัก", href: "/portal", icon: "layout-dashboard" },
  { label: "โปรไฟล์", href: "/portal/profile", icon: "users" },
  { label: "การเข้างาน", href: "/portal/attendance", icon: "clock" },
  { label: "ตารางงาน", href: "/portal/schedule", icon: "timer" },
  { label: "ขอลา", href: "/portal/leave", icon: "calendar" },
  { label: "เอกสาร", href: "/portal/documents", icon: "file-text" },
  { label: "สลิปเงินเดือน", href: "/portal/payslips", icon: "file-text" },
  { label: "คลังสินค้า", href: "/portal/inbound", icon: "inventory" },
]

export function isPortalNavActive(pathname: string, href: string): boolean {
  return href === "/portal" ? pathname === "/portal" : pathname.startsWith(href)
}
