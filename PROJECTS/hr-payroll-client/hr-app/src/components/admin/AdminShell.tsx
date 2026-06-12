import { AdminHeader } from "@/components/admin/AdminHeader"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import type { AdminNavItem } from "@/components/admin/admin-nav"
import type { DevViewAs } from "@/lib/auth/dev-view"
import type { Employee } from "@/lib/auth/session"
import type { NotificationItem } from "@/features/notifications/types"

export function AdminShell({
  children,
  alertBadge = 0,
  approvalBadge = 0,
  notificationItems = [],
  showComplianceLink = true,
  user,
  navItems,
  branchMode = false,
  ceoMode = false,
  devAllMode = false,
  devView = null,
}: {
  children: React.ReactNode
  alertBadge?: number
  approvalBadge?: number
  notificationItems?: NotificationItem[]
  showComplianceLink?: boolean
  user?: Pick<Employee, "name" | "role" | "position">
  navItems: AdminNavItem[]
  branchMode?: boolean
  ceoMode?: boolean
  devAllMode?: boolean
  devView?: DevViewAs | null
}) {
  return (
    <div className="flex h-dvh max-h-dvh overflow-hidden bg-background">
      <AdminSidebar
        items={navItems}
        branchMode={branchMode}
        ceoMode={ceoMode}
        devAllMode={devAllMode}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader
          alertBadge={alertBadge}
          approvalBadge={approvalBadge}
          notificationItems={notificationItems}
          showComplianceLink={showComplianceLink}
          user={user}
          navItems={navItems}
          branchMode={branchMode}
          ceoMode={ceoMode}
          devAllMode={devAllMode}
          devView={devView}
        />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 md:p-4 lg:p-5">
          {children}
        </main>
      </div>
    </div>
  )
}
