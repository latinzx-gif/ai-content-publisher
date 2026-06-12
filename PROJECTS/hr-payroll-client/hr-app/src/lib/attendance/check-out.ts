// Check-out business logic — pure DB pipeline, no LINE SDK imports.
// Service-role client by design (webhook has no user session, T02).
import { getAdminClient } from "@/lib/auth/admin-client"
import { ictDayRangeUtc } from "@/lib/attendance/late"

// Phase 1: display-only OT threshold (8h). No pay calculation.
const STANDARD_WORK_MINUTES = 480

export type CheckOutResult =
  | {
      status: "success"
      employeeName: string
      checkInAt: Date
      checkOutAt: Date
      workMinutes: number
      overtimeMinutes: number
    }
  | { status: "not_checked_in" }
  | { status: "already_checked_out"; checkOutAt: Date }
  | { status: "pending_approval" }
  | { status: "not_registered" }

export async function checkOut({
  lineUserId,
  now = new Date(),
}: {
  lineUserId: string
  now?: Date
}): Promise<CheckOutResult> {
  const admin = getAdminClient()

  const { data: row, error: employeeError } = await admin
    .from("hr_employees")
    .select("id, name, status")
    .eq("line_user_id", lineUserId)
    .maybeSingle()

  if (employeeError) {
    throw employeeError
  }
  if (!row) {
    return { status: "not_registered" }
  }
  if (row.status !== "active") {
    return { status: "pending_approval" }
  }
  const employee = row

  const { start, end } = ictDayRangeUtc(now)
  const { data: record, error: recordError } = await admin
    .from("hr_attendance")
    .select("id, check_in_at, check_out_at")
    .eq("employee_id", employee.id)
    .gte("check_in_at", start.toISOString())
    .lt("check_in_at", end.toISOString())
    .limit(1)
    .maybeSingle()

  if (recordError) {
    throw recordError
  }
  if (!record) {
    return { status: "not_checked_in" }
  }
  if (record.check_out_at) {
    return {
      status: "already_checked_out",
      checkOutAt: new Date(record.check_out_at),
    }
  }

  const checkInAt = new Date(record.check_in_at)
  const workMinutes = Math.max(
    0,
    Math.floor((now.getTime() - checkInAt.getTime()) / 60_000)
  )
  // Stored as hours with 2 decimals — numeric(5,2) cannot hold minutes (max
  // 999.99, a day can reach 1440).
  const workHours = Math.round((workMinutes / 60) * 100) / 100

  // Conditional update: a concurrent check-out loses the race and matches 0 rows.
  const { data: updated, error: updateError } = await admin
    .from("hr_attendance")
    .update({ check_out_at: now.toISOString(), work_hours: workHours })
    .eq("id", record.id)
    .is("check_out_at", null)
    .select("id")

  if (updateError) {
    throw updateError
  }
  if (!updated || updated.length === 0) {
    return { status: "already_checked_out", checkOutAt: now }
  }

  return {
    status: "success",
    employeeName: employee.name,
    checkInAt,
    checkOutAt: now,
    workMinutes,
    overtimeMinutes: Math.max(0, workMinutes - STANDARD_WORK_MINUTES),
  }
}
