import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { ApprovalQueue } from "@/features/manager/ApprovalQueue"
import {
  getManagerAttendanceQueue,
  getManagerLeaveQueue,
} from "@/features/manager/data"
import {
  mapAttendanceQueueItems,
  mapLeaveQueueItems,
} from "@/features/manager/map-queue-items"
import { requireRole } from "@/lib/auth/require-role"

/** คิวอนุมัติขั้นสุดท้ายสำหรับ HR เท่านั้น */
export default async function HrApprovalQueuePage() {
  const employee = await requireRole("hr", "admin")
  const [attendance, leaves] = await Promise.all([
    getManagerAttendanceQueue(employee),
    getManagerLeaveQueue(employee),
  ])

  return (
    <AdminPageShell
      title="HR Approval Queue"
      description="อนุมัติขั้นสุดท้าย — หลัง Branch Manager อนุมัติแล้ว"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <ApprovalQueue
          title="สรุปเข้างาน (pending HR)"
          emptyText="ไม่มีคิวรออนุมัติ"
          items={mapAttendanceQueueItems(attendance)}
        />
        <ApprovalQueue
          title="คำขอลา (pending HR)"
          emptyText="ไม่มีคำขอลารออนุมัติ"
          items={mapLeaveQueueItems(leaves)}
        />
      </div>
    </AdminPageShell>
  )
}
