import { CircleHelp, LogOut, Search } from "lucide-react"

import type { AdminNavGroup, AdminNavItem } from "@/components/admin/admin-nav"
import { AdminMobileNav } from "@/components/admin/AdminMobileNav"
import { AdminNotificationBell } from "@/components/admin/AdminNotificationBell"
import { DevRoleSwitcher } from "@/components/admin/DevRoleSwitcher"
import { Button } from "@/components/ui/button"
import type { DevViewAs } from "@/lib/auth/dev-view"
import { roleDisplayLabel } from "@/lib/auth/labels"
import type { Employee } from "@/lib/auth/session"
import type { NotificationItem } from "@/features/notifications/types"

export function AdminHeader({
  alertBadge = 0,
  approvalBadge = 0,
  notificationItems = [],
  showComplianceLink = true,
  user,
  navGroups,
  navItems,
  branchMode = false,
  devAllMode = false,
  devView = null,
}: {
  alertBadge?: number
  approvalBadge?: number
  notificationItems?: NotificationItem[]
  showComplianceLink?: boolean
  user?: Pick<Employee, "name" | "role" | "position">
  navGroups?: AdminNavGroup[]
  navItems?: AdminNavItem[]
  branchMode?: boolean
  devAllMode?: boolean
  devView?: DevViewAs | null
}) {
  const isDev = user?.role === "dev"

  return (
    <header className="z-10 shrink-0 border-b border-border/80 bg-white px-3 py-2 md:px-4 md:py-2.5">
      <div className="flex items-center gap-3">
        <AdminMobileNav
          groups={navGroups}
          items={navItems}
          branchMode={branchMode}
          devAllMode={devAllMode}
        />
        <div className="relative mx-auto hidden w-full max-w-xl flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search employees, modules, documents..."
            className="h-9 w-full rounded-full border border-border/80 bg-muted/30 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-brand-red/40 focus-visible:ring-2 focus-visible:ring-brand-red/20"
            aria-label="Search"
          />
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {isDev && devView ? <DevRoleSwitcher currentView={devView} /> : null}
          <AdminNotificationBell
            initialApprovalTotal={approvalBadge}
            initialTotal={alertBadge}
            initialItems={notificationItems}
            showComplianceLink={showComplianceLink}
          />
          <button
            type="button"
            className="hidden rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:block"
            aria-label="Help"
          >
            <CircleHelp className="size-5" />
          </button>
          {user ? (
            <div className="hidden items-center gap-2 rounded-lg border border-border/80 px-2 py-1 sm:flex">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/mascot-hd.png"
                alt=""
                width={32}
                height={32}
                className="size-8 rounded-full object-contain"
              />
              <div className="hidden min-w-0 lg:block">
                <p className="truncate text-sm font-medium leading-tight">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {roleDisplayLabel(user.role)}
                </p>
              </div>
            </div>
          ) : null}
          <form action="/api/auth/logout" method="post" className="hidden md:block">
            <Button variant="ghost" size="sm" type="submit" className="gap-2">
              <LogOut className="size-4" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
