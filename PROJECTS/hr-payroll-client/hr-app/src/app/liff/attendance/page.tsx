import { getCurrentEmployee } from "@/lib/auth/session"
import { getEmployeeWorkShift, listWorkShifts } from "@/features/shifts/data"
import { AttendanceManualClient } from "./page-client"

function ictDateNow(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

function ictTimeNow(): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Bangkok",
  }).format(new Date())
}

export default async function AttendanceLiffPage() {
  const employee = await getCurrentEmployee()
  if (!employee) return null

  const [shifts, assignedShift] = await Promise.all([
    listWorkShifts({ activeOnly: true }),
    getEmployeeWorkShift(employee.id),
  ])

  return (
    <AttendanceManualClient
      shifts={shifts}
      defaultShiftId={assignedShift?.id ?? ""}
      defaultDate={ictDateNow()}
      defaultTime={ictTimeNow()}
    />
  )
}
