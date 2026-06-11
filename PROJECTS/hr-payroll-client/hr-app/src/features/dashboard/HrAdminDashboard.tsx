import Link from "next/link"
import {
  BarChart3,
  CalendarCheck,
  CircleAlert,
  Clock,
  FileText,
  Loader2,
  Megaphone,
  MessageCircleWarning,
  Network,
  Settings,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { HeroBanner } from "@/components/brand/HeroBanner"
import { KpiCard } from "@/components/brand/KpiCard"
import { StatusPill } from "@/components/brand/StatusPill"
import { WidgetCard } from "@/components/brand/WidgetCard"
import { getDashboardStats } from "@/features/dashboard/data"
import { OnboardingDonut } from "@/features/dashboard/OnboardingDonut"
import { getDashboardWidgets } from "@/features/dashboard/widgets-data"

const QUICK_ACTIONS: Array<{
  label: string
  href: string
  icon: LucideIcon
}> = [
  { label: "Add Employee", href: "/admin/employees", icon: UserPlus },
  { label: "Approve Leave", href: "/admin/leaves", icon: CalendarCheck },
  { label: "Run Payroll", href: "/admin/payroll", icon: Wallet },
  { label: "Manage Documents", href: "/admin/documents", icon: FileText },
  { label: "Create Announcement", href: "/admin/settings", icon: Megaphone },
  { label: "Report Builder", href: "/admin/reports", icon: BarChart3 },
  { label: "View Org Chart", href: "/admin/organization", icon: Network },
  { label: "Attendance Report", href: "/admin/attendance", icon: Clock },
  { label: "HR Settings", href: "/admin/settings", icon: Settings },
]

const NEW_HIRE_STATUS: Record<
  "completed" | "in_progress" | "pending",
  { label: string; variant: "approved" | "pending" | "info" }
> = {
  completed: { label: "Completed", variant: "approved" },
  in_progress: { label: "In Progress", variant: "info" },
  pending: { label: "Pending", variant: "pending" },
}

const DOC_STUB = [
  { label: "Employment Contracts", count: 0 },
  { label: "ID Proofs", count: 0 },
  { label: "Policy Acknowledgement", count: 0 },
] as const

const RECRUITMENT_STUB = [
  { label: "New", count: 0 },
  { label: "In Review", count: 0 },
  { label: "Interview", count: 0 },
  { label: "Offered", count: 0 },
  { label: "On Hold", count: 0 },
] as const

export async function HrAdminDashboard({ userName }: { userName: string }) {
  const [stats, widgets] = await Promise.all([
    getDashboardStats(),
    getDashboardWidgets(),
  ])

  const payrollMonthLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden md:gap-3 [@media(max-height:800px)]:gap-1.5">
      <HeroBanner
        compact
        userName={userName}
        title="HR Admin Dashboard"
        subtitle="Manage your people, operations, and workplace with ease."
      />

      <div className="grid shrink-0 gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 md:gap-3">
        <KpiCard
          compact
          iconSize="lg"
          label="Total Employees"
          value={stats.totalActiveEmployees.toLocaleString()}
          detail="Active headcount"
          icon={Users}
        />
        <KpiCard
          compact
          iconSize="lg"
          label="Pending Onboarding"
          value={widgets.pendingOnboarding}
          detail="New hires to onboard"
          icon={UserPlus}
          accent="success"
        />
        <KpiCard
          compact
          iconSize="lg"
          label="Attendance Exceptions"
          value={widgets.exceptionCount}
          detail="Require attention"
          icon={CircleAlert}
          accent="warning"
        />
        <KpiCard
          compact
          iconSize="lg"
          label="Leave Approvals Pending"
          value={stats.pendingLeaves}
          detail="Requests awaiting approval"
          icon={CalendarCheck}
        />
        <KpiCard
          compact
          iconSize="lg"
          label="Payroll Processing"
          value="0%"
          detail={`${payrollMonthLabel} Payroll`}
          icon={Loader2}
          accent="info"
        />
        <KpiCard
          compact
          iconSize="lg"
          label="Unresolved HR Tickets"
          value={widgets.unresolvedAlerts}
          detail="Open support requests"
          icon={MessageCircleWarning}
          accent="purple"
        />
      </div>

      <div className="grid min-h-0 flex-1 gap-2 md:gap-3 min-[1024px]:grid-cols-4">
        <WidgetCard compact title="Employee Onboarding Status" href="/admin/employees">
          <OnboardingDonut compact data={widgets.onboardingDonut} />
          <div className="mt-2 border-t border-border/60 pt-2">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              New Hires
            </p>
            {widgets.newHires.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent hires</p>
            ) : (
              <ul className="space-y-2">
                {widgets.newHires.map((hire) => {
                  const st = NEW_HIRE_STATUS[hire.status]
                  return (
                    <li
                      key={hire.id}
                      className="flex items-start justify-between gap-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{hire.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {hire.position ?? "—"}
                          {hire.contractStart ? ` · ${hire.contractStart}` : ""}
                        </p>
                      </div>
                      <StatusPill label={st.label} variant={st.variant} />
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </WidgetCard>

        <WidgetCard
          compact
          title="Pending Document Approvals"
          href="/admin/documents"
        >
          <ul className="space-y-3">
            {DOC_STUB.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-semibold tabular-nums text-brand-red">
                  {item.count}
                </span>
              </li>
            ))}
          </ul>
        </WidgetCard>

        <WidgetCard compact title="Attendance Exceptions" href="/admin/attendance">
          {widgets.exceptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No exceptions today</p>
          ) : (
            <ul className="space-y-3">
              {widgets.exceptions.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-2 border-b border-border/60 pb-2 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{item.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <StatusPill
                    label={item.kind === "late" ? "Late" : "Open"}
                    variant="warning"
                  />
                </li>
              ))}
            </ul>
          )}
        </WidgetCard>

        <WidgetCard compact title="Recent HR Tickets" href="/admin/alerts">
          {widgets.recentAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">All clear</p>
          ) : (
            <ul className="space-y-3">
              {widgets.recentAlerts.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{item.employeeName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.alertType} · {item.triggerDate}
                    </p>
                  </div>
                  <StatusPill
                    label={item.status}
                    variant={item.status === "failed" ? "rejected" : "pending"}
                  />
                </li>
              ))}
            </ul>
          )}
        </WidgetCard>
      </div>

      <div className="grid min-h-0 flex-1 gap-2 md:gap-3 min-[1024px]:grid-cols-4">
        <WidgetCard compact title="Recruitment Snapshot" href="/admin/recruitment">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-full border-4 border-muted bg-muted/30">
              <span className="text-lg font-bold tabular-nums text-foreground">0</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">Open Positions</p>
              <ul className="mt-2 space-y-1.5">
                {RECRUITMENT_STUB.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold tabular-nums">{item.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </WidgetCard>

        <WidgetCard compact title="Compliance Reminders" href="/admin/alerts">
          {widgets.compliance.length === 0 ? (
            <p className="text-sm text-muted-foreground">All clear for 30 days</p>
          ) : (
            <ul className="space-y-3">
              {widgets.compliance.map((item) => (
                <li
                  key={`${item.employeeId}-${item.kind}`}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{item.employeeName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.kind} · due {item.dueDate}
                    </p>
                  </div>
                  <StatusPill
                    label={`${item.daysLeft}d`}
                    variant={item.daysLeft <= 7 ? "warning" : "info"}
                  />
                </li>
              ))}
            </ul>
          )}
        </WidgetCard>

        <WidgetCard compact title="Announcements">
          <ul className="space-y-2">
            <li className="rounded-lg border border-border/60 bg-muted/20 p-2 text-sm">
              <div className="flex items-center gap-2">
                <Megaphone className="size-5 text-brand-red" strokeWidth={1.75} />
                <span className="font-medium">Welcome to 中国名堂 HR</span>
                <StatusPill label="Info" variant="info" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Use LINE for check-in and leave requests.
              </p>
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Full announcements — Phase 2
          </p>
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
