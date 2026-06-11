import { AdminHeader } from "@/components/admin/AdminHeader"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import type { Employee } from "@/lib/auth/session"

export function AdminShell({
  children,
  alertBadge = 0,
  user,
}: {
  children: React.ReactNode
  alertBadge?: number
  user?: Pick<Employee, "name" | "role" | "position">
}) {
  return (
    <div className="flex h-dvh max-h-dvh overflow-hidden bg-background">
      <AdminSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader alertBadge={alertBadge} user={user} />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 md:p-4 lg:p-5">
          {children}
        </main>
      </div>
    </div>
  )
}
