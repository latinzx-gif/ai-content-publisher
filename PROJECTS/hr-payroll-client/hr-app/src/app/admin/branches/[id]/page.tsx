import Link from "next/link"
import { notFound } from "next/navigation"

import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { HrBranchHub } from "@/features/branches/HrBranchHub"
import {
  getBranchById,
  getBranchEmployeesWithAlerts,
  getBranchHubDashboard,
  getBranchOvertimeQueue,
} from "@/features/branches/branch-hub-data"
import { isCeo, isDev } from "@/lib/auth/roles"
import { requireRole } from "@/lib/auth/require-role"

export default async function BranchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const employee = await requireRole("hr", "admin", "ceo", "dev")
  const { id } = await params
  const readOnly = isCeo(employee.role) && !isDev(employee.role)

  const [branch, dashboard, employees, overtimeQueue] = await Promise.all([
    getBranchById(id),
    getBranchHubDashboard(id),
    getBranchEmployeesWithAlerts(id),
    getBranchOvertimeQueue(id),
  ])

  if (!branch) notFound()

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      <p className="shrink-0 text-sm">
        <Link href="/admin/branches" className="text-brand-red hover:underline">
          ← กลับรายการสาขา
        </Link>
      </p>
      <AdminPageShell
        fill
        title={branch.name}
        description={`จัดการสาขา — พนักงาน ลา เข้างาน OT (${branch.code ?? "—"})`}
      >
        <HrBranchHub
          branch={branch}
          dashboard={dashboard}
          employees={employees}
          overtimeQueue={overtimeQueue}
          readOnly={readOnly}
        />
      </AdminPageShell>
    </div>
  )
}
