import Link from "next/link"
import { notFound } from "next/navigation"
import { Clock } from "lucide-react"

import { AdminPageShell } from "@/components/brand/AdminPageShell"
import {
  getBranchAttendanceQueue,
  getBranchById,
} from "@/features/branches/branch-hub-data"
import { ApprovalQueue } from "@/features/manager/ApprovalQueue"
import { mapAttendanceQueueItems } from "@/features/manager/map-queue-items"
import { requireRole } from "@/lib/auth/require-role"

export default async function BranchAttendancePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireRole("hr", "admin", "dev")
  const { id } = await params
  const [branch, attendance] = await Promise.all([
    getBranchById(id),
    getBranchAttendanceQueue(id),
  ])
  if (!branch) notFound()

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      <p className="shrink-0 text-sm">
        <Link href={`/admin/branches/${id}`} className="text-brand-red hover:underline">
          ← กลับ {branch.name}
        </Link>
      </p>
      <AdminPageShell fill title="Attendance" description={`สาขา ${branch.name}`}>
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
