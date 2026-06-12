import {
  ADMIN_NAV_ITEMS,
  type AdminNavItem,
} from "@/components/admin/admin-nav"
import {
  BRANCH_NAV_ITEMS,
  BRANCH_SECTION_ITEMS,
} from "@/components/admin/branch-nav"
import { CEO_NAV_ITEMS } from "@/components/admin/ceo-nav"
import { isBranchNavActive } from "@/components/admin/branch-nav"
import { isAdminNavActive } from "@/components/admin/admin-nav"
import { isCeoNavActive } from "@/components/admin/ceo-nav"

export const DEV_VIEW_COOKIE = "dev_view_as"

export type DevViewAs = "all" | "hr" | "ceo" | "branch"

export const DEV_VIEW_OPTIONS: Array<{
  id: DevViewAs
  label: string
  description: string
}> = [
  { id: "all", label: "All Pages", description: "ทุกเมนูรวมกัน" },
  { id: "hr", label: "HR Admin", description: "มุมมอง HR" },
  { id: "ceo", label: "CEO", description: "มุมมองผู้บริหาร" },
  { id: "branch", label: "Branch Manager", description: "มุมมองหัวหน้าสาขา" },
]

const DASHBOARD_LINKS: AdminNavItem[] = [
  { label: "↳ HR Dashboard", href: "/admin", icon: "layout-dashboard" },
  { label: "↳ CEO Dashboard", href: "/admin/ceo", icon: "layout-dashboard" },
  { label: "↳ Branch Dashboard", href: "/admin/branch", icon: "layout-dashboard" },
]

/** Merged nav — dashboards first, then HR, CEO extras, branch tools */
export const DEV_ALL_NAV_ITEMS: AdminNavItem[] = [
  ...DASHBOARD_LINKS,
  ...ADMIN_NAV_ITEMS.filter((item) => item.href !== "/admin"),
  ...CEO_NAV_ITEMS.filter(
    (item) =>
      item.href !== "/admin/ceo" &&
      !ADMIN_NAV_ITEMS.some((h) => h.href === item.href)
  ).map((item) => ({ ...item, label: `[CEO] ${item.label}` })),
  ...BRANCH_SECTION_ITEMS.map((item) => ({
    ...item,
    label: `[BM] ${item.label}`,
  })),
]

export function parseDevViewAs(value: string | undefined): DevViewAs {
  if (value === "hr" || value === "ceo" || value === "branch" || value === "all") {
    return value
  }
  return "all"
}

export function getDevNavItems(view: DevViewAs): AdminNavItem[] {
  switch (view) {
    case "hr":
      return [
        { label: "↳ Branch Dashboard", href: "/admin/branch", icon: "layout-dashboard" },
        ...ADMIN_NAV_ITEMS,
      ]
    case "ceo":
      return CEO_NAV_ITEMS
    case "branch":
      return BRANCH_NAV_ITEMS
    default:
      return DEV_ALL_NAV_ITEMS
  }
}

export function getDevNavMode(view: DevViewAs): {
  branchMode: boolean
  ceoMode: boolean
  devAllMode: boolean
} {
  return {
    branchMode: view === "branch",
    ceoMode: view === "ceo",
    devAllMode: view === "all",
  }
}

export function isDevNavActive(pathname: string, href: string): boolean {
  return (
    isAdminNavActive(pathname, href) ||
    isBranchNavActive(pathname, href) ||
    isCeoNavActive(pathname, href)
  )
}

export function devViewLabel(view: DevViewAs): string {
  return DEV_VIEW_OPTIONS.find((o) => o.id === view)?.label ?? "All Pages"
}
