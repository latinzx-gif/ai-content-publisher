import Link from "next/link"
import {
  Building2,
  CalendarCheck,
  Clock,
  Timer,
  Users,
} from "lucide-react"

import { KpiCard } from "@/components/brand/KpiCard"
import { WidgetCard } from "@/components/brand/WidgetCard"
import type { BranchDashboardData } from "@/features/branch-dashboard/data"
import { BranchEmployeeAlertIcons } from "@/features/branches/BranchEmployeeAlertIcons"
import type {
  BranchDetail,
  BranchEmployeeWithAlerts,
} from "@/features/branches/branch-hub-data"

const sectionLinks = (branchId: string) =>
  [
    { label: "Attendance", href: `/admin/branches/${branchId}/attendance`, icon: Clock },
    {
      label: "Leave Management",
      href: `/admin/branches/${branchId}/leaves`,
      icon: CalendarCheck,
    },
    { label: "Approve OT", href: `/admin/branches/${branchId}/overtime`, icon: Timer },
  ] as const

export function HrBranchHub({
  branch,
  dashboard,
  employees,
}: {
  branch: BranchDetail
  dashboard: BranchDashboardData
  employees: BranchEmployeeWithAlerts[]
}) {
  const links = sectionLinks(branch.id)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="size-5 text-brand-red" />
              <h1 className="text-lg font-bold">{branch.name}</h1>
              {branch.code ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {branch.code}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Branch Manager:{" "}
              {branch.manager_name ? (
                branch.manager_employee_id ? (
                  <Link
                    href={`/admin/employees/${branch.manager_employee_id}`}
                    className="text-brand-red hover:underline"
                  >
                    {branch.manager_name}
                  </Link>
                ) : (
                  branch.manager_name
                )
              ) : (
                "ยังไม่มอบหมาย"
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {links.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/30 px-3 py-1.5 text-xs font-medium hover:bg-muted/60"
                >
                  <Icon className="size-3.5" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          compact
          label="พนักงานในสาขา"
          value={dashboard.headcount}
          detail="Active employees"
          icon={Users}
        />
        <KpiCard
          compact
          label="ลารออนุมัติ"
          value={dashboard.pendingLeaves}
          detail="Leave Management"
          icon={CalendarCheck}
          accent={dashboard.pendingLeaves > 0 ? "warning" : undefined}
        />
        <KpiCard
          compact
          label="เวลางานรออนุมัติ"
          value={dashboard.pendingAttendance}
          detail="Attendance"
          icon={Clock}
          accent={dashboard.pendingAttendance > 0 ? "warning" : undefined}
        />
        <KpiCard
          compact
          label="OT รออนุมัติ"
          value={employees.reduce((s, e) => s + e.alerts.pendingOvertime, 0)}
          detail="Approve OT"
          icon={Timer}
        />
      </div>

      <WidgetCard title="Employees">
        <section id="employees" className="scroll-mt-4">
          {employees.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              ยังไม่มีพนักงานในสาขานี้
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/30 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">ชื่อ</th>
                    <th className="px-3 py-2 font-medium">แผนก / ตำแหน่ง</th>
                    <th className="px-3 py-2 font-medium">สถานะ</th>
                    <th className="px-3 py-2 text-right font-medium">
                      แจ้งเตือน / รออนุมัติ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-3 py-2">
                        <Link
                          href={`/admin/employees/${emp.id}`}
                          className="font-medium text-brand-red hover:underline"
                        >
                          {emp.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {[emp.department, emp.position].filter(Boolean).join(" · ") ||
                          "—"}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {emp.status === "inactive" ? "รออนุมัติ" : emp.status}
                      </td>
                      <td className="px-3 py-2">
                        <BranchEmployeeAlertIcons alerts={emp.alerts} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </WidgetCard>
    </div>
  )
}
