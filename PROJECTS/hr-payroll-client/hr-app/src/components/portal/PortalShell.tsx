import type { AdminNavItem } from "@/components/admin/admin-nav-types"
import { PortalHeader } from "@/components/portal/PortalHeader"
import { PortalSidebar } from "@/components/portal/PortalSidebar"
import type { EmployeeUserChip } from "@/lib/auth/session"

export function PortalShell({
  children,
  user,
  navItems,
}: {
  children: React.ReactNode
  user: EmployeeUserChip
  navItems: AdminNavItem[]
}) {
  return (
    <div className="flex h-dvh max-h-dvh overflow-hidden bg-background">
      <PortalSidebar items={navItems} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <PortalHeader user={user} navItems={navItems} />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 md:p-4 lg:p-5">
          {children}
        </main>
      </div>
    </div>
  )
}
