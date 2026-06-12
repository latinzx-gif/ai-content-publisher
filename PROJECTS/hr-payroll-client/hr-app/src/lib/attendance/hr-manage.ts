import {
  computeWorkHours,
  hasAttendanceOnIctDay,
  ictLocalToUtc,
} from "@/lib/attendance/ict-datetime"
import { lateMinutes } from "@/lib/attendance/late"
import { getWorkStart } from "@/lib/runtime-config"
import { createClient } from "@/lib/supabase/server"

export type HrAttendanceInput = {
  date: string
  checkInTime: string
  checkOutTime?: string | null
  workHours?: number | null
}

function parseInput(input: HrAttendanceInput): {
  checkInAt: Date
  checkOutAt: Date | null
  workHours: number | null
} {
  const checkInAt = ictLocalToUtc(input.date, input.checkInTime)
  const checkOutAt =
    input.checkOutTime && input.checkOutTime.trim()
      ? ictLocalToUtc(input.date, input.checkOutTime)
      : null

  if (checkOutAt && checkOutAt.getTime() <= checkInAt.getTime()) {
    throw new Error("เวลาออกต้องหลังเวลาเข้า")
  }

  let workHours: number | null = null
  if (input.workHours != null && String(input.workHours).trim() !== "") {
    const parsed = Number(input.workHours)
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 24) {
      throw new Error("ชม.การทำงานไม่ถูกต้อง (0–24)")
    }
    workHours = Math.round(parsed * 100) / 100
  } else if (checkOutAt) {
    workHours = computeWorkHours(checkInAt, checkOutAt)
  }

  return { checkInAt, checkOutAt, workHours }
}

async function resolveIsLate(checkInAt: Date): Promise<boolean> {
  const { hour, minute } = await getWorkStart()
  return lateMinutes(checkInAt, hour, minute) > 0
}

export async function createAttendanceByHr(
  employeeId: string,
  input: HrAttendanceInput
) {
  const supabase = await createClient()
  const { checkInAt, checkOutAt, workHours } = parseInput(input)

  const duplicate = await hasAttendanceOnIctDay(supabase, employeeId, checkInAt)
  if (duplicate) {
    throw new Error("พนักงานมีบันทึกเข้างานวันนี้แล้ว — แก้ไขรายการเดิมแทน")
  }

  const { data: employee, error: empError } = await supabase
    .from("hr_employees")
    .select("id, status")
    .eq("id", employeeId)
    .maybeSingle()

  if (empError) throw empError
  if (!employee) throw new Error("ไม่พบพนักงาน")

  const isLate = await resolveIsLate(checkInAt)

  const { data, error } = await supabase
    .from("hr_attendance")
    .insert({
      employee_id: employeeId,
      check_in_at: checkInAt.toISOString(),
      check_out_at: checkOutAt?.toISOString() ?? null,
      work_hours: workHours,
      is_late: isLate,
      check_in_location: null,
    })
    .select("id")
    .single()

  if (error) throw error
  return data
}

export async function updateAttendanceByHr(
  attendanceId: string,
  input: HrAttendanceInput
) {
  const supabase = await createClient()
  const { checkInAt, checkOutAt, workHours } = parseInput(input)

  const { data: existing, error: loadError } = await supabase
    .from("hr_attendance")
    .select("id, employee_id")
    .eq("id", attendanceId)
    .maybeSingle()

  if (loadError) throw loadError
  if (!existing) throw new Error("ไม่พบรายการเข้างาน")

  const duplicate = await hasAttendanceOnIctDay(
    supabase,
    existing.employee_id,
    checkInAt,
    attendanceId
  )
  if (duplicate) {
    throw new Error("พนักงานมีบันทึกเข้างานวันนี้อยู่แล้ว")
  }

  const isLate = await resolveIsLate(checkInAt)

  const { data, error } = await supabase
    .from("hr_attendance")
    .update({
      check_in_at: checkInAt.toISOString(),
      check_out_at: checkOutAt?.toISOString() ?? null,
      work_hours: workHours,
      is_late: isLate,
    })
    .eq("id", attendanceId)
    .select("id")
    .single()

  if (error) throw error
  return data
}

export async function deleteAttendanceByHr(attendanceId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("hr_attendance")
    .delete()
    .eq("id", attendanceId)

  if (error) throw error
}
