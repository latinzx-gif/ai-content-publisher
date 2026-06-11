import { CalendarCheck } from "lucide-react"

import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { ApprovalQueue } from "@/features/manager/ApprovalQueue"
import { getManagerLeaveQueue } from "@/features/manager/data"
import { mapLeaveQueueItems } from "@/features/manager/map-queue-items"
import { requireRole } from "@/lib/auth/require-role"

export default async function BranchLeaveApprovalsPage() {
  const employee = await requireRole("branch_manager", "dev")
  const leaves = await getManagerLeaveQueue(employee)

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <AdminPageShell
        fill
        title="อนุมัติการลา"
        description="อนุมัติขั้นแรก — ส่งต่อ HR หลังคุณอนุมัติ"
      >
        <ApprovalQueue
          title={`รออนุมัติ (${leaves.length})`}
          emptyText="ไม่มีคำขอลารออนุมัติ"
          emptyIcon={CalendarCheck}
          items={mapLeaveQueueItems(leaves)}
        />
      </AdminPageShell>
    </div>
  )
}
