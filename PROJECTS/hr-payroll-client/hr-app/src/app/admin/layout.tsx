import { AdminShell } from "@/components/admin/AdminShell"
import { getUrgentAlertCount } from "@/features/alerts/data"
import { requireRole } from "@/lib/auth/require-role"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const employee = await requireRole("hr", "admin")
  const alertBadge = await getUrgentAlertCount()

  return (
    <AdminShell
      alertBadge={alertBadge}
      user={{
        name: employee.name,
        role: employee.role,
        position: employee.position,
      }}
    >
      {children}
    </AdminShell>
  )
}
