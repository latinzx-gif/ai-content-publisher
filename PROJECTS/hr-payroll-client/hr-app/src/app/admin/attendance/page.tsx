import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { AttendanceFilters } from "@/features/attendance/AttendanceFilters"
import { AttendancePagination } from "@/features/attendance/AttendancePagination"
import { AttendanceSummaryCard } from "@/features/attendance/AttendanceSummary"
import { AttendanceTable } from "@/features/attendance/AttendanceTable"
import { ExportCsvButton } from "@/features/attendance/ExportCsvButton"
import {
  getAttendanceDepartments,
  getAttendanceEmployees,
  getAttendanceRecords,
  normalizeAttendanceParams,
} from "@/features/attendance/data"

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = normalizeAttendanceParams(await searchParams)
  const [{ rows, total, summary }, departments, employees] = await Promise.all([
    getAttendanceRecords(params),
    getAttendanceDepartments(),
    getAttendanceEmployees(),
  ])

  return (
    <AdminPageShell
      title="Attendance"
      description="ประวัติเช็คอิน-เช็คเอาท์และสรุปชั่วโมงทำงาน"
      action={<ExportCsvButton rows={rows} />}
    >
      <div className="flex flex-col gap-4">
        <AttendanceFilters
          departments={departments}
          employees={employees}
          values={{
            from: params.from,
            to: params.to,
            dept: params.dept,
            employee: params.employee,
          }}
        />
        <AttendanceSummaryCard summary={summary} />
        <AttendanceTable rows={rows} />
        <AttendancePagination page={params.page} total={total} />
      </div>
    </AdminPageShell>
  )
}
