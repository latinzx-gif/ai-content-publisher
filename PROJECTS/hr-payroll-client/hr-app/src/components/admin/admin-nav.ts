import {
  BarChart3,
  Building2,
  CalendarDays,
  Clock,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Target,
  UserSearch,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"

export type AdminNavItem = {
  label: string
  href: string
  icon: LucideIcon
  /** Module not built yet — show coming-soon shell */
  comingSoon?: boolean
}

/** Sidebar navigation — aligned with HR Admin Dashboard mockup (12441) */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Employees", href: "/admin/employees", icon: Users },
  { label: "Organization", href: "/admin/organization", icon: Building2, comingSoon: true },
  { label: "Attendance", href: "/admin/attendance", icon: Clock },
  { label: "Leave Management", href: "/admin/leaves", icon: CalendarDays },
  { label: "Payroll", href: "/admin/payroll", icon: Wallet, comingSoon: true },
  { label: "Performance", href: "/admin/performance", icon: Target, comingSoon: true },
  { label: "Recruitment", href: "/admin/recruitment", icon: UserSearch, comingSoon: true },
  {
    label: "Training & Development",
    href: "/admin/training",
    icon: GraduationCap,
    comingSoon: true,
  },
  { label: "Documents", href: "/admin/documents", icon: FileText, comingSoon: true },
  { label: "Reports & Analytics", href: "/admin/reports", icon: BarChart3, comingSoon: true },
  { label: "Settings", href: "/admin/settings", icon: Settings, comingSoon: true },
]

export function isAdminNavActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)
}
