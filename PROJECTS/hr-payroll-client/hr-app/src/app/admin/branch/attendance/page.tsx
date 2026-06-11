import { Clock } from "lucide-react"

import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { ApprovalQueue } from "@/features/manager/ApprovalQueue"
import { getManagerAttendanceQueue } from "@/features/manager/data"
import { mapAttendanceQueueItems } from "@/features/manager/map-queue-items"
import { requireRole } from "@/lib/auth/require-role"

export default async function BranchAttendanceApprovalsPage() {
  const employee = await requireRole("branch_manager", "dev")
  const attendance = await getManagerAttendanceQueue(employee)

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <AdminPageShell
        fill
        title="อนุมัติเข้างาน"
        description="สรุป check-in/out รายวัน — อนุมัติภายใน 48 ชม. หลังพนักงานยื่น"
      >
        <ApprovalQueue
          title={`รออนุมัติ (${attendance.length})`}
          emptyText="ไม่มีคิวรออนุมัติ"
          emptyIcon={Clock}
          items={mapAttendanceQueueItems(attendance)}
        />
      </AdminPageShell>
    </div>
  )
}
