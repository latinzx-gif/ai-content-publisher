import Link from "next/link"
import {
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarCheck,
  CalendarDays,
  Download,
  ListChecks,
  Megaphone,
  MessageSquareWarning,
  Network,
  ShieldAlert,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { HeroBanner } from "@/components/brand/HeroBanner"
import { KpiCard } from "@/components/brand/KpiCard"
import { StatusPill } from "@/components/brand/StatusPill"
import { WidgetCard } from "@/components/brand/WidgetCard"
import {
  CeoAttendanceDonut,
  CeoPayrollDonut,
  CeoWeekTrend,
} from "@/features/ceo-dashboard/charts"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { CeoDashboardData } from "./data"

const LEAVE_STATUS_VARIANT = {
  approved: "approved",
  pending: "pending",
  rejected: "rejected",
} as const

const QUICK_ACTIONS = [
  { label: "Add Employee", href: "/admin/employees", icon: UserPlus },
  { label: "Leave Calendar", href: "/admin/leaves", icon: CalendarDays },
  { label: "Approve Queue", href: "/admin/manager", icon: CalendarCheck },
  { label: "Payroll Report", href: "/admin/payroll", icon: Wallet },
  { label: "Reports", href: "/admin/report", icon: BarChart3 },
  { label: "Org Chart", href: "/admin/organization", icon: Network },
] as const

const ACTIVITY_ICONS: Record<string, { icon: LucideIcon; className: string }> = {
  hire: { icon: UserPlus, className: "text-emerald-600 bg-emerald-100" },
  leave: { icon: CalendarDays, className: "text-sky-600 bg-sky-100" },
  complaint: { icon: MessageSquareWarning, className: "text-amber-600 bg-amber-100" },
  announcement: { icon: Megaphone, className: "text-brand-red bg-brand-red/10" },
  payroll: { icon: Wallet, className: "text-violet-600 bg-violet-100" },
}

export function CeoDashboard({
  userName,
  data,
}: {
  userName: string
  data: CeoDashboardData
}) {
  const totalPayrollHours =
    data.regularHoursMonth + data.otHoursMonth + data.sickHoursMonth

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden md:gap-2.5 [@media(max-height:800px)]:gap-1.5">
      <div className="flex shrink-0 items-start justify-between gap-2">
        <HeroBanner
          compact
          userName={userName}
          title="Executive Dashboard"
          subtitle="Company-wide workforce health, payroll hours, branch performance, and HR risk signals."
        />
        <Button render={<Link href="/admin/report" />} size="sm" className="shrink-0 gap-1.5">
          <Download className="size-3.5" />
          Export Report
        </Button>
      </div>

      <div className="grid shrink-0 gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 md:gap-2.5">
        <KpiCard
          compact
          iconSize="lg"
          label="Total Employees"
          value={data.totalEmployees.toLocaleString()}
          detail="Active workforce"
          icon={Users}
        />
        <KpiCard
          compact
          iconSize="lg"
          label="Present Today"
          value={data.presentToday.toLocaleString()}
          detail={`${data.presentRate}% of total`}
          icon={UserCheck}
          accent="success"
        />
        <KpiCard
          compact
          iconSize="lg"
          label="On Leave"
          value={data.onLeaveToday}
          detail={`${data.onLeaveRate}% of total`}
          icon={CalendarDays}
          accent="info"
        />
        <KpiCard
          compact
          iconSize="lg"
          label="Pending Approvals"
          value={data.pendingHrApprovals}
          detail="Leave · OT · Attendance"
          icon={ListChecks}
          accent="warning"
        />
        <KpiCard
          compact
          iconSize="lg"
          label="Payroll Hours"
          value={`${totalPayrollHours}h`}
          detail={
            data.payrollHoursChangePct !== null
              ? `${data.payrollPeriodLabel} · ${data.payrollHoursChangePct >= 0 ? "+" : ""}${data.payrollHoursChangePct}% MoM`
              : data.payrollPeriodLabel
          }
          icon={Wallet}
        />
        <KpiCard
          compact
          iconSize="lg"
          label="Branches"
          value={data.branchCount}
          detail={`${data.pendingOnboarding} onboarding`}
          icon={Building2}
          accent="purple"
        />
      </div>

      <div className="grid min-h-0 flex-1 gap-2 md:gap-2.5 lg:grid-cols-3">
        <WidgetCard compact title="Attendance Overview" href="/admin/attendance">
          <CeoAttendanceDonut
            data={data.attendanceDonut}
            presentRate={data.presentRate}
          />
          <p className="mt-1 text-[10px] text-muted-foreground">
            Today: {data.presentToday} in · {data.lateToday} late · {data.absentToday}{" "}
            absent
          </p>
          <div className="mt-1 border-t border-border/60 pt-1.5">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              7-day trend
            </p>
            <CeoWeekTrend data={data.weekTrend} />
          </div>
        </WidgetCard>

        <WidgetCard compact title="Leave Requests" href="/admin/leaves" actionLabel="View All">
          {data.recentLeaveRows.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No leave requests
            </p>
          ) : (
            <>
              <ul className="divide-y divide-border/60">
                {data.recentLeaveRows.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-start justify-between gap-2 py-1.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{row.name}</p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {row.department} · {row.dates}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{row.type}</p>
                    </div>
                    <StatusPill
                      label={row.status}
                      variant={LEAVE_STATUS_VARIANT[row.status]}
                    />
                  </li>
                ))}
              </ul>
              <div className="mt-1.5 flex flex-wrap gap-2 border-t border-border/60 pt-1.5 text-[10px] text-muted-foreground">
                <span>Pending {data.pendingLeaves}</span>
                <span>Approved {data.approvedLeaves}</span>
                <span>Rejected {data.rejectedLeaves}</span>
                <span>Total {data.totalLeaveRequests}</span>
              </div>
            </>
          )}
        </WidgetCard>

        <WidgetCard compact title="Payroll Summary" href="/admin/payroll">
          <p className="mb-1 text-[10px] text-muted-foreground">
            {data.payrollPeriodLabel} · Regular + OT + Sick
            {data.payrollHoursChangePct !== null ? (
              <span
                className={cn(
                  "ml-1 font-medium tabular-nums",
                  data.payrollHoursChangePct >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                )}
              >
                ({data.payrollHoursChangePct >= 0 ? "+" : ""}
                {data.payrollHoursChangePct}% MoM)
              </span>
            ) : null}
          </p>
          <CeoPayrollDonut data={data.payrollBreakdown} totalHours={totalPayrollHours} />
          <Link
            href="/admin/payroll"
            className="mt-1 block text-center text-[10px] font-medium text-brand-red hover:underline"
          >
            View Payroll Report
          </Link>
        </WidgetCard>
      </div>

      <div className="grid min-h-0 flex-1 gap-2 md:gap-2.5 lg:grid-cols-4">
        <WidgetCard compact title="Branch Performance" href="/admin/branches">
          {data.branchRows.length === 0 ? (
            <p className="py-4 text-xs text-muted-foreground">No branches configured</p>
          ) : (
            <div className="overflow-hidden">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b text-left text-[10px] text-muted-foreground">
                    <th className="pb-1 pr-1 font-medium">Branch</th>
                    <th className="pb-1 pr-1 font-medium">Staff</th>
                    <th className="pb-1 pr-1 font-medium">Present</th>
                    <th className="pb-1 pr-1 font-medium">OT</th>
                    <th className="pb-1 font-medium">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.branchRows.slice(0, 5).map((row) => (
                    <tr key={row.id} className="border-b border-border/40">
                      <td className="max-w-[5rem] truncate py-1 pr-1 font-medium">
                        {row.name}
                      </td>
                      <td className="py-1 pr-1 tabular-nums">{row.headcount}</td>
                      <td className="py-1 pr-1 tabular-nums">{row.presentToday}</td>
                      <td className="py-1 pr-1 tabular-nums">{row.otHours}h</td>
                      <td className="py-1">
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 w-10 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-300",
                                row.rate >= 80
                                  ? "bg-emerald-500"
                                  : row.rate >= 60
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              )}
                              style={{ width: `${row.rate}%` }}
                            />
                          </div>
                          <span className="tabular-nums">{row.rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </WidgetCard>

        <WidgetCard compact title="Announcements & Alerts" href="/admin/announcements">
          {data.riskAlerts.length > 0 ? (
            <ul className="mb-2 space-y-1.5 border-b border-border/60 pb-2">
              {data.riskAlerts.map((alert, i) => (
                <li
                  key={i}
                  className="flex gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-[10px] dark:bg-amber-950/30"
                >
                  <AlertTriangle className="mt-0.5 size-3 shrink-0 text-amber-600" />
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-muted-foreground">{alert.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          {data.recentAnnouncements.length === 0 ? (
            <p className="text-xs text-muted-foreground">No announcements</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {data.recentAnnouncements.map((a, i) => (
                <li key={i} className="py-1.5">
                  <div className="flex items-start gap-1.5">
                    <Megaphone className="mt-0.5 size-3 shrink-0 text-brand-red" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{a.title}</p>
                      <p className="text-[10px] text-muted-foreground">{a.date}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {data.openComplaints > 0 || data.complianceRiskCount > 0 ? (
            <div className="mt-1.5 border-t border-border/60 pt-1.5 text-[10px] text-muted-foreground">
              {data.openComplaints > 0 ? (
                <p className="flex items-center gap-1">
                  <MessageSquareWarning className="size-3 text-amber-600" />
                  {data.openComplaints} open complaints
                </p>
              ) : null}
              {data.complianceRiskCount > 0 ? (
                <p className="flex items-center gap-1">
                  <ShieldAlert className="size-3 text-red-600" />
                  {data.complianceRiskCount} compliance items expiring (30d)
                </p>
              ) : null}
            </div>
          ) : null}
        </WidgetCard>

        <WidgetCard compact title="Employee Activity">
          {data.recentActivity.length === 0 ? (
            <p className="py-4 text-xs text-muted-foreground">No recent activity</p>
          ) : (
            <ul className="space-y-2">
              {data.recentActivity.map((item, i) => {
                const meta = ACTIVITY_ICONS[item.kind] ?? {
                  icon: Users,
                  className: "text-muted-foreground bg-muted",
                }
                const Icon = meta.icon
                return (
                  <li key={i} className="flex gap-2 text-[11px]">
                    <span
                      className={cn(
                        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md",
                        meta.className
                      )}
                    >
                      <Icon className="size-3.5" strokeWidth={2} />
                    </span>
                    <div className="min-w-0">
                      <p className="leading-snug">{item.text}</p>
                      <p className="text-[10px] text-muted-foreground">{item.time}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </WidgetCard>

        <WidgetCard compact title="Quick Actions">
          <div className="grid grid-cols-3 gap-1.5">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-1 rounded-lg border border-border/80 bg-muted/20 px-1 py-1.5 text-center transition-colors hover:border-brand-red/40 hover:bg-brand-red/5"
              >
                <action.icon className="size-7 text-brand-red" strokeWidth={1.6} />
                <span className="text-[9px] font-medium leading-tight">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </WidgetCard>
      </div>
    </div>
  )
}
