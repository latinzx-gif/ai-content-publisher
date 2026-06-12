import { Timer } from "lucide-react"

import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { ApprovalQueue } from "@/features/manager/ApprovalQueue"
import { getManagerOvertimeQueue } from "@/features/manager/data"
import { mapOvertimeQueueItems } from "@/features/manager/map-queue-items"
import { requireRole } from "@/lib/auth/require-role"

export default async function BranchOvertimePage() {
  const employee = await requireRole("branch_manager", "dev")
  const queue = await getManagerOvertimeQueue(employee)

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <AdminPageShell
        fill
        title="อนุมัติ OT"
        description="อนุมัติขั้นแรก — พนักงานยื่นเองผ่าน LINE/LIFF แล้วส่งต่อ HR"
      >
        <ApprovalQueue
          title={`รออนุมัติ (${queue.length})`}
          emptyText="ไม่มีคำขอ OT รออนุมัติ"
          emptyIcon={Timer}
          items={mapOvertimeQueueItems(queue)}
        />
      </AdminPageShell>
    </div>
  )
}
