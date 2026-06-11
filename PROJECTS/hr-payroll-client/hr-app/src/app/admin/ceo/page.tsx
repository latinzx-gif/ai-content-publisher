import { CeoDashboard } from "@/features/ceo-dashboard/CeoDashboard"
import { getCeoDashboardData } from "@/features/ceo-dashboard/data"
import { requireRole } from "@/lib/auth/require-role"

export default async function CeoDashboardPage() {
  const employee = await requireRole("ceo")
  const data = await getCeoDashboardData()

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <CeoDashboard userName={employee.name} data={data} />
    </div>
  )
}
