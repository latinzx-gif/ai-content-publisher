import { getAdminClient } from "@/lib/auth/admin-client"

const ICT_OFFSET_MS = 7 * 60 * 60 * 1000

export type LineTodayAttendanceState =
  | { kind: "not_registered" }
  | { kind: "none" }
  | { kind: "checked_in"; checkInAt: Date }
  | { kind: "checked_out"; checkOutAt: Date }

/**
 * Returns the start of the current shift "session window" in UTC.
 *
 * Rule: find the most recent past occurrence of H:MM ICT ≤ now.
 * Example: shift 14:00, now 14:36 ICT June 20 → June 20 07:00 UTC.
 *          shift 14:00, now 13:00 ICT June 20 → June 19 07:00 UTC (previous cycle).
 *
 * This prevents an earlier shift's phantom record from blocking a later shift's check-in.
 */
function shiftSessionWindowStart(
  now: Date,
  startHour: number,
  startMinute: number
): Date {
  const ictNowMs = now.getTime() + ICT_OFFSET_MS
  const ictDayStartMs = Math.floor(ictNowMs / 86_400_000) * 86_400_000
  const shiftStartMsToday = ictDayStartMs + (startHour * 60 + startMinute) * 60_000

  if (ictNowMs >= shiftStartMsToday) {
    return new Date(shiftStartMsToday - ICT_OFFSET_MS)
  }
  return new Date(shiftStartMsToday - 86_400_000 - ICT_OFFSET_MS)
}

/** Today's attendance for a LINE user — used to route location messages. */
export async function getLineTodayAttendanceState(
  lineUserId: string,
  now = new Date()
): Promise<LineTodayAttendanceState> {
  const admin = getAdminClient()

  const { data: employee, error: employeeError } = await admin
    .from("hr_employees")
    .select("id, work_shift_id")
    .eq("line_user_id", lineUserId)
    .maybeSingle()

  if (employeeError) throw employeeError
  if (!employee) return { kind: "not_registered" }

  // 1. Open record within last 36 h (covers 14:00–02:00 shifts after midnight).
  const window36hStart = new Date(now.getTime() - 36 * 60 * 60 * 1000)
  const { data: openRecord, error: openError } = await admin
    .from("hr_attendance")
    .select("check_in_at")
    .eq("employee_id", employee.id)
    .is("check_out_at", null)
    .gte("check_in_at", window36hStart.toISOString())
    .order("check_in_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (openError) throw openError
  if (openRecord) return { kind: "checked_in", checkInAt: new Date(openRecord.check_in_at) }

  // 2. Find the session window start based on the employee's work shift.
  //    This avoids the ICT-day boundary confusion for overnight shifts:
  //    a 14:00-02:00 employee at 14:36 on June 20 has a session starting at 14:00 June 20,
  //    so only records from that point onwards are considered "current session."
  let sessionWindowStart: Date

  const shiftId = employee.work_shift_id as string | null
  if (shiftId) {
    const { data: shift, error: shiftError } = await admin
      .from("hr_work_shifts")
      .select("start_hour, start_minute")
      .eq("id", shiftId)
      .eq("is_active", true)
      .maybeSingle()

    if (shiftError) throw shiftError

    if (shift) {
      sessionWindowStart = shiftSessionWindowStart(
        now,
        shift.start_hour as number,
        shift.start_minute as number
      )
    } else {
      // Shift inactive or not found — fall back to ICT midnight
      const ictNowMs = now.getTime() + ICT_OFFSET_MS
      const ictDayStartMs = Math.floor(ictNowMs / 86_400_000) * 86_400_000
      sessionWindowStart = new Date(ictDayStartMs - ICT_OFFSET_MS)
    }
  } else {
    // No shift assigned — use ICT midnight
    const ictNowMs = now.getTime() + ICT_OFFSET_MS
    const ictDayStartMs = Math.floor(ictNowMs / 86_400_000) * 86_400_000
    sessionWindowStart = new Date(ictDayStartMs - ICT_OFFSET_MS)
  }

  const { data: record, error: recordError } = await admin
    .from("hr_attendance")
    .select("check_in_at, check_out_at")
    .eq("employee_id", employee.id)
    .gte("check_in_at", sessionWindowStart.toISOString())
    .lte("check_in_at", now.toISOString())
    .order("check_in_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (recordError) throw recordError
  if (!record) return { kind: "none" }
  if (record.check_out_at) {
    return { kind: "checked_out", checkOutAt: new Date(record.check_out_at) }
  }
  return { kind: "checked_in", checkInAt: new Date(record.check_in_at) }
}
