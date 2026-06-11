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
import {
  AttendanceExceptionsList,
  ComplianceRemindersList,
  DocumentApprovalsList,
  RecentHrTicketsList,
} from "@/features/dashboard/DashboardWidgetLists"
import { AttendanceTrendBars } from "@/features/dashboard/AttendanceTrendBars"
import { OnboardingDonut } from "@/features/dashboard/OnboardingDonut"
import { RecruitmentDonut } from "@/features/dashboard/RecruitmentDonut"
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
  { label: "Create Announcement", href: "/admin/announcements", icon: Megaphone },
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

/** Demo pipeline counts — matches mockup until recruitment module ships. */
const RECRUITMENT_DONUT = [
  { name: "New", value: 14 },
  { name: "In Review", value: 11 },
  { name: "Interview", value: 9 },
  { name: "Offered", value: 5 },
  { name: "On Hold", value: 3 },
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
          footerHref="/admin/documents"
          footerLabel="Go to Documents"
        >
          <DocumentApprovalsList />
        </WidgetCard>

        <WidgetCard
          compact
          title="Attendance Exceptions"
          href="/admin/attendance"
          footerHref="/admin/attendance"
          footerLabel="Go to Attendance"
        >
          <AttendanceExceptionsList items={widgets.exceptions} />
        </WidgetCard>

        <WidgetCard
          compact
          title="Recent HR Tickets"
          href="/admin/alerts"
          footerHref="/admin/alerts"
          footerLabel="Go to Tickets"
        >
          <RecentHrTicketsList items={widgets.recentAlerts} />
        </WidgetCard>
      </div>

      <div className="grid min-h-0 flex-1 gap-2 md:gap-3 min-[1024px]:grid-cols-4">
        <WidgetCard compact title="Recruitment Snapshot" href="/admin/recruitment">
          <RecruitmentDonut compact data={[...RECRUITMENT_DONUT]} />
        </WidgetCard>

        <WidgetCard
          compact
          title="Compliance Reminders"
          href="/admin/alerts"
          footerHref="/admin/alerts"
          footerLabel="Go to Compliance"
        >
          <ComplianceRemindersList items={widgets.compliance} />
        </WidgetCard>

        <WidgetCard compact title="Attendance (7 days)" href="/admin/attendance">
          <AttendanceTrendBars
            title={`Today: ${stats.checkedInToday} in · ${stats.lateToday} late · ${stats.absentToday} absent`}
            data={stats.attendanceByDay}
          />
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
