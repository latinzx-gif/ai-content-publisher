import { ictDayRangeUtc } from "@/lib/attendance/late"
import { ictToday } from "@/features/employees/data"
import { LEAVE_TYPE_LABELS, type LeaveType } from "@/features/leave/types"
import { createClient } from "@/lib/supabase/server"

const DAY_MS = 86_400_000
const ICT_OFFSET_MS = 7 * 60 * 60 * 1000
const EXPIRY_WINDOW_DAYS = 30

function ictDayLabel(dayStartUtc: Date): string {
  const ict = new Date(dayStartUtc.getTime() + ICT_OFFSET_MS)
  const dd = String(ict.getUTCDate()).padStart(2, "0")
  const mm = String(ict.getUTCMonth() + 1).padStart(2, "0")
  return `${dd}/${mm}`
}

function ictDateString(instant: Date): string {
  return new Date(instant.getTime() + ICT_OFFSET_MS).toISOString().slice(0, 10)
}

function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00Z`).getTime()
  const b = new Date(`${to}T00:00:00Z`).getTime()
  return Math.round((b - a) / DAY_MS)
}

export type CeoActivityItem = {
  text: string
  time: string
  kind: "leave" | "hire" | "complaint" | "announcement" | "payroll"
}

export type CeoDashboardData = {
  branchCount: number
  totalEmployees: number
  presentToday: number
  presentRate: number
  onLeaveToday: number
  onLeaveRate: number
  lateToday: number
  absentToday: number
  pendingHrApprovals: number
  pendingOnboarding: number
  openComplaints: number
  complianceRiskCount: number
  otHoursMonth: number
  regularHoursMonth: number
  sickHoursMonth: number
  payrollHoursChangePct: number | null
  payrollPeriodLabel: string
  pendingLeaves: number
  approvedLeaves: number
  rejectedLeaves: number
  totalLeaveRequests: number
  attendanceDonut: Array<{ name: string; value: number; color: string }>
  weekTrend: Array<{ day: string; rate: number }>
  payrollBreakdown: Array<{ name: string; value: number; color: string }>
  recentLeaveRows: Array<{
    id: string
    name: string
    department: string
    dates: string
    type: string
    status: "approved" | "pending" | "rejected"
  }>
  branchRows: Array<{
    id: string
    name: string
    code: string | null
    headcount: number
    presentToday: number
    rate: number
    otHours: number
  }>
  recentAnnouncements: Array<{ title: string; date: string }>
  recentActivity: CeoActivityItem[]
  riskAlerts: Array<{ title: string; detail: string }>
}

function sumHours(
  lines: Array<{ line_type: string; hours: number }> | null,
  type: string
): number {
  return Math.round(
    (lines ?? [])
      .filter((r) => r.line_type === type)
      .reduce((s, r) => s + Number(r.hours), 0) * 10
  ) / 10
}

export async function getCeoDashboardData(): Promise<CeoDashboardData> {
  const supabase = await createClient()
  const now = new Date()
  const today = ictToday()
  const { start: todayStart, end: todayEnd } = ictDayRangeUtc(now)
  const weekStart = new Date(todayStart.getTime() - 6 * DAY_MS)
  const expiryLimit = ictDateString(
    new Date(now.getTime() + EXPIRY_WINDOW_DAYS * DAY_MS)
  )

  const year = new Date(now.getTime() + ICT_OFFSET_MS).getUTCFullYear()
  const month = new Date(now.getTime() + ICT_OFFSET_MS).getUTCMonth() + 1
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year

  const payrollPeriodLabel = new Date(year, month - 1, 1).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  )

  const [
    branchesRes,
    employeesRes,
    attTodayRes,
    leavesTodayRes,
    leavesRes,
    weekAttRes,
    periodsRes,
    annRes,
    complaintRes,
    pendingLeaveHrRes,
    pendingOtHrRes,
    pendingAttHrRes,
    recentHiresRes,
    recentComplaintsRes,
    expiryRes,
  ] = await Promise.all([
    supabase.from("hr_branches").select("id, name, code").order("name"),
    supabase
      .from("hr_employees")
      .select(
        "id, branch_id, name, department, role, contract_start, probation_end, visa_expiry, work_permit_expiry"
      )
      .eq("status", "active"),
    supabase
      .from("hr_attendance")
      .select("employee_id, is_late")
      .gte("check_in_at", todayStart.toISOString())
      .lt("check_in_at", todayEnd.toISOString()),
    supabase
      .from("hr_leaves")
      .select("employee_id")
      .eq("approval_status", "approved")
      .lte("start_date", today)
      .gte("end_date", today),
    supabase
      .from("hr_leaves")
      .select(
        "id, type, start_date, end_date, leave_unit, leave_hours, approval_status, status, created_at, hr_employees!employee_id(name, department)"
      )
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("hr_attendance")
      .select("check_in_at, employee_id")
      .gte("check_in_at", weekStart.toISOString())
      .lt("check_in_at", todayEnd.toISOString()),
    supabase
      .from("hr_payroll_periods")
      .select("id, year, month")
      .or(
        `and(year.eq.${year},month.eq.${month}),and(year.eq.${prevYear},month.eq.${prevMonth})`
      ),
    supabase
      .from("hr_announcements")
      .select("title, sent_at")
      .eq("status", "sent")
      .order("sent_at", { ascending: false })
      .limit(4),
    supabase
      .from("hr_complaints")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("hr_leaves")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "pending_hr"),
    supabase
      .from("hr_overtime")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "pending_hr"),
    supabase
      .from("hr_attendance_submissions")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "pending_hr"),
    supabase
      .from("hr_employees")
      .select("name, contract_start")
      .eq("status", "active")
      .not("contract_start", "is", null)
      .gte("contract_start", ictDateString(new Date(now.getTime() - 30 * DAY_MS)))
      .order("contract_start", { ascending: false })
      .limit(5),
    supabase
      .from("hr_complaints")
      .select("subject, created_at")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("hr_employees")
      .select("probation_end, visa_expiry, work_permit_expiry")
      .eq("status", "active"),
  ])

  const employees = employeesRes.data ?? []
  const fieldEmployees = employees.filter(
    (e) =>
      e.role === "employee" ||
      e.role === "branch_manager" ||
      e.role === "hr"
  )
  const totalEmployees = fieldEmployees.length || employees.length
  const attRows = attTodayRes.data ?? []
  const presentToday = attRows.length
  const lateToday = attRows.filter((r) => r.is_late).length
  const onLeaveToday = leavesTodayRes.data?.length ?? 0
  const absentToday = Math.max(0, totalEmployees - presentToday - onLeaveToday)

  const presentRate =
    totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 1000) / 10 : 0
  const onLeaveRate =
    totalEmployees > 0 ? Math.round((onLeaveToday / totalEmployees) * 1000) / 10 : 0

  const attendanceDonut = [
    { name: "Present", value: presentToday, color: "#22c55e" },
    { name: "Late", value: lateToday, color: "#f59e0b" },
    { name: "Absent", value: absentToday, color: "#ef4444" },
    { name: "On Leave", value: onLeaveToday, color: "#3b82f6" },
  ].filter((d) => d.value > 0)

  const weekTrend = Array.from({ length: 7 }, (_, i) => {
    const dayStart = new Date(weekStart.getTime() + i * DAY_MS)
    const dayEnd = new Date(dayStart.getTime() + DAY_MS)
    const count =
      (weekAttRes.data ?? []).filter((r) => {
        const t = new Date(r.check_in_at as string).getTime()
        return t >= dayStart.getTime() && t < dayEnd.getTime()
      }).length ?? 0
    const rate = totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0
    return { day: ictDayLabel(dayStart), rate }
  })

  const periods = periodsRes.data ?? []
  const currentPeriodIds = periods
    .filter((p) => p.year === year && p.month === month)
    .map((p) => p.id as string)
  const prevPeriodIds = periods
    .filter((p) => p.year === prevYear && p.month === prevMonth)
    .map((p) => p.id as string)

  const [currentLinesRes, prevLinesRes] = await Promise.all([
    currentPeriodIds.length
      ? supabase
          .from("hr_payroll_hour_lines")
          .select("line_type, hours, employee_id")
          .in("period_id", currentPeriodIds)
      : Promise.resolve({ data: [] as Array<{ line_type: string; hours: number; employee_id: string }> }),
    prevPeriodIds.length
      ? supabase
          .from("hr_payroll_hour_lines")
          .select("line_type, hours, employee_id")
          .in("period_id", prevPeriodIds)
      : Promise.resolve({ data: [] as Array<{ line_type: string; hours: number; employee_id: string }> }),
  ])

  const currentLines = currentLinesRes.data ?? []
  const prevLines = prevLinesRes.data ?? []
  const otHoursMonth = sumHours(currentLines, "overtime")
  const regularHoursMonth = sumHours(currentLines, "regular")
  const sickHoursMonth = sumHours(currentLines, "sick_hourly")
  const totalHoursMonth = otHoursMonth + regularHoursMonth + sickHoursMonth
  const prevTotalHours =
    sumHours(prevLines, "overtime") +
    sumHours(prevLines, "regular") +
    sumHours(prevLines, "sick_hourly")
  const payrollHoursChangePct =
    prevTotalHours > 0
      ? Math.round(((totalHoursMonth - prevTotalHours) / prevTotalHours) * 1000) / 10
      : null

  const payrollBreakdown = [
    { name: "Regular", value: regularHoursMonth, color: "#22c55e" },
    { name: "Overtime", value: otHoursMonth, color: "#f59e0b" },
    { name: "Sick (hours)", value: sickHoursMonth, color: "#3b82f6" },
  ].filter((d) => d.value > 0)

  const leaves = leavesRes.data ?? []
  let pendingLeaves = 0
  let approvedLeaves = 0
  let rejectedLeaves = 0
  for (const l of leaves) {
    const st = (l.approval_status ?? l.status) as string
    if (st === "approved") approvedLeaves += 1
    else if (st === "rejected") rejectedLeaves += 1
    else pendingLeaves += 1
  }

  const recentLeaveRows = leaves.slice(0, 4).map((l) => {
    const emp = Array.isArray(l.hr_employees) ? l.hr_employees[0] : l.hr_employees
    const approval = (l.approval_status ?? l.status) as string
    const status: "approved" | "pending" | "rejected" =
      approval === "approved"
        ? "approved"
        : approval === "rejected"
          ? "rejected"
          : "pending"
    return {
      id: l.id as string,
      name: (emp as { name: string })?.name ?? "—",
      department: (emp as { department?: string })?.department ?? "—",
      dates:
        l.leave_unit === "hours"
          ? `${l.start_date} (${l.leave_hours}h)`
          : `${l.start_date} – ${l.end_date}`,
      type: LEAVE_TYPE_LABELS[l.type as LeaveType] ?? String(l.type),
      status,
    }
  })

  const headcountEmployees = fieldEmployees.length ? fieldEmployees : employees
  const presentByBranch = new Map<string, number>()
  const headcountByBranch = new Map<string, number>()
  const otByBranch = new Map<string, number>()
  let pendingOnboarding = 0

  for (const emp of headcountEmployees) {
    const bid = emp.branch_id as string | null
    if (bid) {
      headcountByBranch.set(bid, (headcountByBranch.get(bid) ?? 0) + 1)
    }
    if (
      emp.probation_end !== null &&
      emp.probation_end >= today
    ) {
      pendingOnboarding += 1
    }
  }
  for (const row of attRows) {
    const emp = headcountEmployees.find((e) => e.id === row.employee_id)
    const bid = emp?.branch_id as string | null
    if (!bid) continue
    presentByBranch.set(bid, (presentByBranch.get(bid) ?? 0) + 1)
  }
  for (const line of currentLines) {
    if (line.line_type !== "overtime") continue
    const emp = headcountEmployees.find((e) => e.id === line.employee_id)
    const bid = emp?.branch_id as string | null
    if (!bid) continue
    otByBranch.set(bid, (otByBranch.get(bid) ?? 0) + Number(line.hours))
  }

  const branchRows = (branchesRes.data ?? []).map((b) => {
    const headcount = headcountByBranch.get(b.id as string) ?? 0
    const present = presentByBranch.get(b.id as string) ?? 0
    return {
      id: b.id as string,
      name: b.name as string,
      code: b.code as string | null,
      headcount,
      presentToday: present,
      rate: headcount > 0 ? Math.round((present / headcount) * 100) : 0,
      otHours: Math.round((otByBranch.get(b.id as string) ?? 0) * 10) / 10,
    }
  })

  let complianceRiskCount = 0
  const riskAlerts: CeoDashboardData["riskAlerts"] = []
  for (const row of expiryRes.data ?? []) {
    for (const [kind, field] of [
      ["Probation", "probation_end"],
      ["Visa", "visa_expiry"],
      ["Work permit", "work_permit_expiry"],
    ] as const) {
      const due = row[field] as string | null
      if (due && due >= today && due <= expiryLimit) {
        complianceRiskCount += 1
        if (riskAlerts.length < 3) {
          riskAlerts.push({
            title: `${kind} expiring soon`,
            detail: `Due ${due} (${daysBetween(today, due)} days)`,
          })
        }
      }
    }
  }

  const pendingHrApprovals =
    (pendingLeaveHrRes.count ?? 0) +
    (pendingOtHrRes.count ?? 0) +
    (pendingAttHrRes.count ?? 0)

  const recentActivity: CeoActivityItem[] = []

  for (const hire of recentHiresRes.data ?? []) {
    recentActivity.push({
      text: `${hire.name as string} joined the company`,
      time: hire.contract_start as string,
      kind: "hire",
    })
  }
  for (const l of leaves.slice(0, 4)) {
    const emp = Array.isArray(l.hr_employees) ? l.hr_employees[0] : l.hr_employees
    recentActivity.push({
      text: `${(emp as { name: string })?.name ?? "—"} submitted leave request`,
      time: (l.created_at as string)?.slice(0, 10) ?? "—",
      kind: "leave",
    })
  }
  for (const c of recentComplaintsRes.data ?? []) {
    recentActivity.push({
      text: `New complaint: ${(c.subject as string) ?? "—"}`,
      time: new Date(c.created_at as string).toLocaleDateString("th-TH"),
      kind: "complaint",
    })
  }
  for (const a of annRes.data ?? []) {
    recentActivity.push({
      text: `Announcement: ${a.title as string}`,
      time: a.sent_at
        ? new Date(a.sent_at as string).toLocaleDateString("th-TH")
        : "—",
      kind: "announcement",
    })
  }

  recentActivity.sort((a, b) => b.time.localeCompare(a.time))

  if (pendingHrApprovals > 0) {
    riskAlerts.unshift({
      title: `${pendingHrApprovals} items awaiting HR approval`,
      detail: "Leave, overtime, or attendance submissions",
    })
  }
  if ((complaintRes.count ?? 0) > 0) {
    riskAlerts.push({
      title: `${complaintRes.count} open employee complaints`,
      detail: "Review F8 tickets for workplace issues",
    })
  }

  return {
    branchCount: branchesRes.data?.length ?? 0,
    totalEmployees,
    presentToday,
    presentRate,
    onLeaveToday,
    onLeaveRate,
    lateToday,
    absentToday,
    pendingHrApprovals,
    pendingOnboarding,
    openComplaints: complaintRes.count ?? 0,
    complianceRiskCount,
    otHoursMonth,
    regularHoursMonth,
    sickHoursMonth,
    payrollHoursChangePct,
    payrollPeriodLabel,
    pendingLeaves,
    approvedLeaves,
    rejectedLeaves,
    totalLeaveRequests: pendingLeaves + approvedLeaves + rejectedLeaves,
    attendanceDonut,
    weekTrend,
    payrollBreakdown,
    recentLeaveRows,
    branchRows,
    recentAnnouncements: (annRes.data ?? []).map((a) => ({
      title: a.title as string,
      date: a.sent_at
        ? new Date(a.sent_at as string).toLocaleDateString("th-TH")
        : "—",
    })),
    recentActivity: recentActivity.slice(0, 6),
    riskAlerts: riskAlerts.slice(0, 4),
  }
}
