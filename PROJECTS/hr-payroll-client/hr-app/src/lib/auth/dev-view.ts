import {
  ADMIN_NAV_GROUPS,
  flattenAdminNavGroups,
  isAdminNavActive,
  type AdminNavGroup,
  type AdminNavItem,
} from "@/components/admin/admin-nav"
import {
  BRANCH_NAV_ITEMS,
  BRANCH_SECTION_ITEMS,
  isBranchNavActive,
} from "@/components/admin/branch-nav"

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
  { label: "↳ Report & Analytics", href: "/admin/report", icon: "bar-chart" },
  { label: "↳ Branch Dashboard", href: "/admin/branch", icon: "layout-dashboard" },
]

const DEV_ALL_EXTRA_GROUP: AdminNavGroup = {
  title: "Dev — All Routes",
  items: [
    ...DASHBOARD_LINKS,
    ...BRANCH_SECTION_ITEMS.map((item) => ({
      ...item,
      label: `[BM] ${item.label}`,
    })),
  ],
}

/** Merged nav — dashboards first, then grouped HR nav */
export const DEV_ALL_NAV_GROUPS: AdminNavGroup[] = [
  DEV_ALL_EXTRA_GROUP,
  ...ADMIN_NAV_GROUPS,
]

/** @deprecated Use DEV_ALL_NAV_GROUPS */
export const DEV_ALL_NAV_ITEMS: AdminNavItem[] = flattenAdminNavGroups(DEV_ALL_NAV_GROUPS)

export function parseDevViewAs(value: string | undefined): DevViewAs {
  if (value === "hr" || value === "ceo" || value === "branch" || value === "all") {
    return value
  }
  return "all"
}

export function getDevNavGroups(view: DevViewAs): AdminNavGroup[] {
  switch (view) {
    case "hr":
      return [
        {
          title: "Quick Access",
          items: [
            { label: "↳ Branch Dashboard", href: "/admin/branch", icon: "layout-dashboard" },
          ],
        },
        ...ADMIN_NAV_GROUPS,
      ]
    case "ceo":
      return ADMIN_NAV_GROUPS
    case "branch":
      return [{ title: "", items: BRANCH_NAV_ITEMS }]
    default:
      return DEV_ALL_NAV_GROUPS
  }
}

/** @deprecated Use getDevNavGroups */
export function getDevNavItems(view: DevViewAs): AdminNavItem[] {
  return flattenAdminNavGroups(getDevNavGroups(view))
}

export function getDevNavMode(view: DevViewAs): {
  branchMode: boolean
  devAllMode: boolean
} {
  return {
    branchMode: view === "branch",
    devAllMode: view === "all",
  }
}

export function isDevNavActive(pathname: string, href: string): boolean {
  return (
    isAdminNavActive(pathname, href) ||
    isBranchNavActive(pathname, href)
  )
}

export function devViewLabel(view: DevViewAs): string {
  return DEV_VIEW_OPTIONS.find((o) => o.id === view)?.label ?? "All Pages"
}
