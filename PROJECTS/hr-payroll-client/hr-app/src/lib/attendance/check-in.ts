// Check-in business logic — pure DB pipeline, no LINE SDK imports.
// Runs in the webhook context, so writes go through the service-role client
// (no user session); RLS is bypassed by design (T02).
import { getAdminClient } from "@/lib/auth/admin-client"
import { ictDayRangeUtc, lateMinutes } from "@/lib/attendance/late"

export type CheckInLocation = {
  latitude: number
  longitude: number
  address?: string
}

export type CheckInResult =
  | {
      status: "success"
      employeeName: string
      checkInAt: Date
      lateMinutes: number
    }
  | { status: "already_checked_in"; checkInAt: Date }
  | { status: "not_registered" }

function workStart(): { hour: number; minute: number } {
  return {
    hour: Number(process.env.WORK_START_HOUR ?? 9),
    minute: Number(process.env.WORK_START_MINUTE ?? 0),
  }
}

export async function checkIn({
  lineUserId,
  location,
  now = new Date(),
}: {
  lineUserId: string
  location: CheckInLocation
  now?: Date
}): Promise<CheckInResult> {
  const admin = getAdminClient()

  const { data: employee, error: employeeError } = await admin
    .from("hr_employees")
    .select("id, name")
    .eq("line_user_id", lineUserId)
    .eq("status", "active")
    .maybeSingle()

  if (employeeError) {
    throw employeeError
  }
  if (!employee) {
    return { status: "not_registered" }
  }

  const { start, end } = ictDayRangeUtc(now)
  const { data: existing, error: existingError } = await admin
    .from("hr_attendance")
    .select("check_in_at")
    .eq("employee_id", employee.id)
    .gte("check_in_at", start.toISOString())
    .lt("check_in_at", end.toISOString())
    .limit(1)
    .maybeSingle()

  if (existingError) {
    throw existingError
  }
  if (existing) {
    return {
      status: "already_checked_in",
      checkInAt: new Date(existing.check_in_at),
    }
  }

  const { hour, minute } = workStart()
  const late = lateMinutes(now, hour, minute)

  const { error: insertError } = await admin.from("hr_attendance").insert({
    employee_id: employee.id,
    check_in_at: now.toISOString(),
    check_in_location: location,
    is_late: late > 0,
  })

  if (insertError) {
    throw insertError
  }

  return {
    status: "success",
    employeeName: employee.name,
    checkInAt: now,
    lateMinutes: late,
  }
}
