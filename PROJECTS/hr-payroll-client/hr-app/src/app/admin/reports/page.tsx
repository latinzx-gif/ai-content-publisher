import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { ReportsPanel } from "@/features/reports/ReportsPanel"
import {
  getAttendanceReport,
  getLeaveReportSummary,
  getOvertimeReportSummary,
  getReportDepartments,
} from "@/features/reports/data"

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; department?: string }>
}) {
  const params = await searchParams
  const days = Number(params.days ?? "30")
  const department = params.department?.trim() ?? ""

  const [departments, attendance, leaves, overtime] = await Promise.all([
    getReportDepartments(),
    getAttendanceReport(days, department || undefined),
    getLeaveReportSummary(days, department || undefined),
    getOvertimeReportSummary(department || undefined),
  ])

  return (
    <AdminPageShell
      title="Reports"
      description={`รายงานเข้างาน ลา และ OT (${days} วันล่าสุด)`}
    >
      <ReportsPanel departments={departments} days={days} department={department} />
      <div className="grid gap-6">
        <ReportSection title={`Attendance (${attendance.length})`}>
          <SimpleTable
            headers={["Employee", "Check-in", "Late", "Hours"]}
            rows={attendance.map((r) => {
              const emp = Array.isArray(r.hr_employees) ? r.hr_employees[0] : r.hr_employees
              return [
                (emp as { name: string })?.name ?? "—",
                new Date(r.check_in_at as string).toLocaleString("th-TH"),
                r.is_late ? "ใช่" : "—",
                r.work_hours != null ? String(r.work_hours) : "—",
              ]
            })}
          />
        </ReportSection>
        <ReportSection title={`Leave (${leaves.length})`}>
          <SimpleTable
            headers={["Employee", "Type", "Dates", "Status"]}
            rows={leaves.map((r) => {
              const emp = Array.isArray(r.hr_employees) ? r.hr_employees[0] : r.hr_employees
              return [
                (emp as { name: string })?.name ?? "—",
                r.type as string,
                `${r.start_date} – ${r.end_date}`,
                r.status as string,
              ]
            })}
          />
        </ReportSection>
        <ReportSection title={`Overtime (${overtime.length})`}>
          <SimpleTable
            headers={["Employee", "Date", "Time", "Status"]}
            rows={overtime.map((r) => {
              const emp = Array.isArray(r.hr_employees) ? r.hr_employees[0] : r.hr_employees
              return [
                (emp as { name: string })?.name ?? "—",
                r.work_date as string,
                `${String(r.start_time).slice(0, 5)} – ${String(r.end_time).slice(0, 5)}`,
                r.status as string,
              ]
            })}
          />
        </ReportSection>
      </div>
    </AdminPageShell>
  )
}

function ReportSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {children}
    </section>
  )
}

function SimpleTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: string[][]
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">ไม่มีข้อมูล</p>
  }
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-muted/40">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
