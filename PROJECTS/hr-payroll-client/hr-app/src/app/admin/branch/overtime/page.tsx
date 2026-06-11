import { Timer } from "lucide-react"

import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { DevelopmentEmptyState } from "@/components/brand/DevelopmentEmptyState"
import { ManagerOvertimeForm } from "@/features/manager/ManagerOvertimeForm"
import { getBranchEmployees } from "@/features/manager/data"
import { requireRole } from "@/lib/auth/require-role"

export default async function BranchOvertimePage() {
  const employee = await requireRole("branch_manager", "dev")
  const employees = await getBranchEmployees(employee)

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <AdminPageShell
        fill
        title="ยื่นคำขอ OT"
        description="ยื่น OT ให้พนักงานในสาขา — HR อนุมัติขั้นสุดท้าย"
      >
        {employees.length === 0 ? (
          <DevelopmentEmptyState
            icon={Timer}
            title="ไม่มีพนักงานในสาขาที่ดูแล"
            description="อยู่ในช่วงพัฒนาปรับปรุงระบบ — เมื่อมีพนักงานในสาขาแล้วจะยื่น OT ได้ที่นี่"
          />
        ) : (
          <div className="min-h-0 overflow-y-auto">
            <ManagerOvertimeForm employees={employees} />
          </div>
        )}
      </AdminPageShell>
    </div>
  )
}
