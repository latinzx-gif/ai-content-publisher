import Link from "next/link"
import { CalendarDays, Clock, Timer, Users } from "lucide-react"

import { KpiCard } from "@/components/brand/KpiCard"
import { LEAVE_TYPE_LABELS, type LeaveType } from "@/features/leave/types"
import { ApprovalQueue } from "@/features/manager/ApprovalQueue"

export function BranchDashboard({
  branchName,
  pendingAttendance,
  pendingLeaves,
  teamCount,
  attendance,
  leaves,
}: {
  branchName: string
  pendingAttendance: number
  pendingLeaves: number
  teamCount: number
  attendance: Array<Record<string, unknown>>
  leaves: Array<Record<string, unknown>>
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-brand-red/20 bg-gradient-to-r from-brand-red/5 to-transparent p-4">
        <h2 className="text-lg font-semibold">{branchName}</h2>
        <p className="text-sm text-muted-foreground">
          อนุมัติชม.ทำงานและการลาของทีมในสาขา — ส่งต่อ HR หลังอนุมัติขั้นแรก
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          compact
          label="รออนุมัติเข้างาน"
          value={pendingAttendance}
          detail="สรุปรายวัน"
          icon={Clock}
          accent="warning"
        />
        <KpiCard
          compact
          label="รออนุมัติลา"
          value={pendingLeaves}
          detail="คำขอลา"
          icon={CalendarDays}
        />
        <KpiCard
          compact
          label="พนักงานในสาขา"
          value={teamCount}
          detail="Active"
          icon={Users}
          accent="success"
        />
        <Link
          href="/admin/branch/overtime"
          className="flex items-center gap-3 rounded-xl border border-dashed border-brand-red/40 bg-brand-red/5 p-4 transition-colors hover:bg-brand-red/10"
        >
          <Timer className="size-8 text-brand-red" />
          <div>
            <p className="text-sm font-semibold">ยื่นคำขอ OT</p>
            <p className="text-xs text-muted-foreground">ให้พนักงานในสาขา</p>
          </div>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ApprovalQueue
          title="สรุปเข้างานรายวัน (รอคุณอนุมัติ)"
          emptyText="ไม่มีคิวรออนุมัติ"
          items={attendance.slice(0, 5).map((r) => {
            const emp = Array.isArray(r.hr_employees) ? r.hr_employees[0] : r.hr_employees
            return {
              id: r.id as string,
              label: (emp as { name: string })?.name ?? "—",
              meta: `${r.work_date} · ยื่น ${new Date(r.submitted_at as string).toLocaleString("th-TH")}`,
              decidePath: `/api/attendance/submissions/${r.id}/decide`,
            }
          })}
        />
        <ApprovalQueue
          title="คำขอลา (รอคุณอนุมัติ)"
          emptyText="ไม่มีคำขอลารออนุมัติ"
          items={leaves.slice(0, 5).map((r) => {
            const emp = Array.isArray(r.hr_employees) ? r.hr_employees[0] : r.hr_employees
            const typeLabel = LEAVE_TYPE_LABELS[r.type as LeaveType] ?? String(r.type)
            const unit =
              r.leave_unit === "hours"
                ? `${r.leave_hours} ชม.`
                : `${r.start_date} – ${r.end_date}`
            return {
              id: r.id as string,
              label: `${(emp as { name: string })?.name ?? "—"} · ${typeLabel}`,
              meta: unit as string,
              decidePath: `/api/leave/${r.id}/decide`,
            }
          })}
        />
      </div>

      {(pendingAttendance > 5 || pendingLeaves > 5) && (
        <div className="flex flex-wrap gap-3 text-sm">
          {pendingAttendance > 5 ? (
            <Link href="/admin/branch/attendance" className="text-brand-red underline">
              ดูคิวเข้างานทั้งหมด ({pendingAttendance})
            </Link>
          ) : null}
          {pendingLeaves > 5 ? (
            <Link href="/admin/branch/leaves" className="text-brand-red underline">
              ดูคิวลาทั้งหมด ({pendingLeaves})
            </Link>
          ) : null}
        </div>
      )}
    </div>
  )
}
