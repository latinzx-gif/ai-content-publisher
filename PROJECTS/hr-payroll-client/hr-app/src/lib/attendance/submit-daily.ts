import { ictDayRangeUtc } from "@/lib/attendance/late"
import { expiresAtFrom } from "@/lib/approval/types"
import { getAdminClient } from "@/lib/auth/admin-client"

export type SubmitDailyResult =
  | { status: "success"; expiresAt: string; employeeId: string; employeeName: string }
  | { status: "not_checked_in" }
  | { status: "not_checked_out" }
  | { status: "already_submitted" }
  | { status: "not_registered" }

export async function submitDailyAttendance({
  lineUserId,
  now = new Date(),
}: {
  lineUserId: string
  now?: Date
}): Promise<SubmitDailyResult> {
  const admin = getAdminClient()

  const { data: employee } = await admin
    .from("hr_employees")
    .select("id, name")
    .eq("line_user_id", lineUserId)
    .eq("status", "active")
    .maybeSingle()

  if (!employee) return { status: "not_registered" }

  const { start, end } = ictDayRangeUtc(now)
  const { data: attendance } = await admin
    .from("hr_attendance")
    .select("id, check_out_at")
    .eq("employee_id", employee.id)
    .gte("check_in_at", start.toISOString())
    .lt("check_in_at", end.toISOString())
    .maybeSingle()

  if (!attendance) return { status: "not_checked_in" }
  if (!attendance.check_out_at) return { status: "not_checked_out" }

  const { data: existing } = await admin
    .from("hr_attendance_submissions")
    .select("approval_status")
    .eq("attendance_id", attendance.id)
    .maybeSingle()

  if (
    existing &&
    existing.approval_status !== "expired" &&
    existing.approval_status !== "rejected"
  ) {
    return { status: "already_submitted" }
  }

  const workDate = now.toISOString().slice(0, 10)
  const submittedAt = now
  const expiresAt = expiresAtFrom(submittedAt)

  const { error } = await admin.from("hr_attendance_submissions").upsert(
    {
      attendance_id: attendance.id,
      employee_id: employee.id,
      work_date: workDate,
      submitted_at: submittedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      approval_status: "pending_manager",
      manager_decided_by: null,
      manager_decided_at: null,
      hr_decided_by: null,
      hr_decided_at: null,
      decision_note: null,
    },
    { onConflict: "attendance_id" }
  )

  if (error) throw error

  return {
    status: "success",
    expiresAt: expiresAt.toISOString(),
    employeeId: employee.id as string,
    employeeName: employee.name as string,
  }
}
