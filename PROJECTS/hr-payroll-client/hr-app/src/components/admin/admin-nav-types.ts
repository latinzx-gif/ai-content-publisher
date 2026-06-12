/** Serializable nav item — safe to pass from Server Components to client sidebar */
export type AdminNavIconName =
  | "layout-dashboard"
  | "users"
  | "building"
  | "clock"
  | "calendar"
  | "timer"
  | "wallet"
  | "target"
  | "user-search"
  | "graduation-cap"
  | "file-text"
  | "message-warning"
  | "megaphone"
  | "bar-chart"
  | "settings"
  | "list-checks"
  | "organization"
  | "branches"
  | "inventory"

export type AdminNavItem = {
  label: string
  href: string
  icon: AdminNavIconName
  comingSoon?: boolean
  badge?: number
}

export type AdminNavGroup = {
  title: string
  items: AdminNavItem[]
}
