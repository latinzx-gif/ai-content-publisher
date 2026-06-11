import { Building2 } from "lucide-react"

import { DevelopmentEmptyState } from "@/components/brand/DevelopmentEmptyState"
import { BranchManagerDashboard } from "@/features/branch-dashboard/BranchManagerDashboard"
import { getBranchDashboardData } from "@/features/branch-dashboard/data"
import { requireRole } from "@/lib/auth/require-role"

export default async function BranchDashboardPage() {
  const employee = await requireRole("branch_manager", "dev")
  const data = await getBranchDashboardData(employee)

  if (!data.branch) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <DevelopmentEmptyState
          icon={Building2}
          title="ยังไม่ได้มอบหมายสาขา"
          description="ติดต่อ HR เพื่อมอบหมายคุณเป็นหัวหน้าสาขา — อยู่ในช่วงพัฒนาปรับปรุงระบบ"
        />
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <BranchManagerDashboard userName={employee.name} data={data} />
    </div>
  )
}
