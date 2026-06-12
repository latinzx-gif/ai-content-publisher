import { ictToday } from "@/features/employees/data"
import { DOC_TYPE_LABELS } from "@/features/documents/types"
import { LEAVE_TYPE_LABELS, type LeaveType } from "@/features/leave/types"
import type {
  NotificationInbox,
  NotificationItem,
  NotificationKind,
} from "@/features/notifications/types"
import { NOTIFICATION_LIST_LIMIT } from "@/features/notifications/types"
import {
  buildBranchNavBadges,
  buildHrNavBadges,
  type HrApprovalCounts,
} from "@/features/notifications/nav-badges"
import type { DevViewAs } from "@/lib/auth/dev-view"
import { getManagedBranchId } from "@/lib/auth/branch"
import { canManageHr } from "@/lib/auth/roles"
import type { Employee } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"

const DAY_MS = 86_400_000
const COMPLIANCE_WINDOW_DAYS = 60
const COMPLIANCE_URGENT_DAYS = 14
const LIST_LIMIT = NOTIFICATION_LIST_LIMIT

const KIND_ORDER: Record<NotificationKind, number> = {
  registration: 0,
  leave: 1,
  attendance: 2,
  overtime: 3,
  document: 4,
  complaint: 5,
  probation: 6,
  visa: 7,
  work_permit: 8,
}

function daysBetween(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS
  )
}

function employeeName(
  joined: { name: string } | Array<{ name: string }> | null | undefined
): string {
  if (!joined) return "—"
  return Array.isArray(joined) ? joined[0].name : joined.name
}

function notificationTime(iso: string | null): number {
  if (!iso) return 0
  const normalized = iso.includes("T") ? iso : `${iso}T12:00:00Z`
  const t = Date.parse(normalized)
  return Number.isNaN(t) ? 0 : t
}

/** Newest first — used for the bell dropdown (max 10 latest). */
function sortItemsByRecency(items: NotificationItem[]): NotificationItem[] {
  return [...items].sort((a, b) => {
    const timeDiff = notificationTime(b.createdAt) - notificationTime(a.createdAt)
    if (timeDiff !== 0) return timeDiff
    if (a.urgency !== b.urgency) return a.urgency === "urgent" ? -1 : 1
    return KIND_ORDER[a.kind] - KIND_ORDER[b.kind]
  })
}

async function complianceNotifications(
  today: string,
  windowEnd: string
): Promise<{ items: NotificationItem[]; total: number }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("hr_employees")
    .select("id, name, department, probation_end, visa_expiry, work_permit_expiry")
    .eq("status", "active")

  if (error) throw error

  const items: NotificationItem[] = []
  let total = 0

  const pushCompliance = (
    kind: "probation" | "visa" | "work_permit",
    employeeId: string,
    name: string,
    department: string | null,
    dueDate: string
  ) => {
    if (dueDate < today || dueDate > windowEnd) return
    total += 1
    const daysLeft = daysBetween(today, dueDate)
    const urgency = daysLeft <= COMPLIANCE_URGENT_DAYS ? "urgent" : "normal"
    const title =
      kind === "probation"
        ? "ทดลองงานใกล้ครบ"
        : kind === "visa"
          ? "วีซ่าใกล้หมดอายุ"
          : "Work Permit ใกล้หมดอายุ"
    items.push({
      id: `${kind}-${employeeId}`,
      kind,
      title,
      summary: `${name}${department ? ` · ${department}` : ""} — เหลือ ${daysLeft} วัน (${dueDate})`,
      href: `/admin/employees/${employeeId}`,
      createdAt: dueDate,
      urgency,
    })
  }

  for (const row of data ?? []) {
    if (row.probation_end) {
      pushCompliance(
        "probation",
        row.id,
        row.name,
        row.department,
        row.probation_end as string
      )
    }
    if (row.visa_expiry) {
      pushCompliance("visa", row.id, row.name, row.department, row.visa_expiry as string)
    }
    if (row.work_permit_expiry) {
      pushCompliance(
        "work_permit",
        row.id,
        row.name,
        row.department,
        row.work_permit_expiry as string
      )
    }
  }

  return { items: sortItemsByRecency(items), total }
}

async function hrApprovalNotifications(): Promise<{
  items: NotificationItem[]
  total: number
  counts: HrApprovalCounts
}> {
  const supabase = await createClient()
  const [
    regRes,
    regCountRes,
    leaveRes,
    leaveCountRes,
    attRes,
    attCountRes,
    otRes,
    otCountRes,
    docRes,
    docCountRes,
    complaintRes,
    complaintCountRes,
  ] = await Promise.all([
    supabase
      .from("hr_employees")
      .select("id, employee_code, name, phone, created_at, hr_branches(name)")
      .eq("status", "inactive")
      .eq("role", "employee")
      .order("created_at", { ascending: false })
      .limit(LIST_LIMIT),
    supabase
      .from("hr_employees")
      .select("id", { count: "exact", head: true })
      .eq("status", "inactive")
      .eq("role", "employee"),
    supabase
      .from("hr_leaves")
      .select(
        "id, type, start_date, end_date, created_at, hr_employees!employee_id(name)"
      )
      .eq("approval_status", "pending_hr")
      .order("created_at", { ascending: false })
      .limit(LIST_LIMIT),
    supabase
      .from("hr_leaves")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "pending_hr"),
    supabase
      .from("hr_attendance_submissions")
      .select(
        "id, work_date, submitted_at, hr_employees!employee_id(name)"
      )
      .eq("approval_status", "pending_hr")
      .order("submitted_at", { ascending: false })
      .limit(LIST_LIMIT),
    supabase
      .from("hr_attendance_submissions")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "pending_hr"),
    supabase
      .from("hr_overtime_requests")
      .select(
        "id, work_date, start_time, end_time, submitted_at, hr_employees!employee_id(name)"
      )
      .eq("approval_status", "pending_hr")
      .order("submitted_at", { ascending: false })
      .limit(LIST_LIMIT),
    supabase
      .from("hr_overtime_requests")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "pending_hr"),
    supabase
      .from("hr_document_requests")
      .select(
        "id, doc_type, purpose, created_at, hr_employees!inner(name)"
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(LIST_LIMIT),
    supabase
      .from("hr_document_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("hr_complaints")
      .select("id, ticket_code, subject, created_at, hr_employees(name)")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(LIST_LIMIT),
    supabase
      .from("hr_complaints")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
  ])

  const items: NotificationItem[] = []

  for (const row of regRes.data ?? []) {
    const branch = Array.isArray(row.hr_branches)
      ? row.hr_branches[0]
      : row.hr_branches
    items.push({
      id: `registration-${row.id}`,
      kind: "registration",
      title: "ลงทะเบียนใหม่",
      summary: [
        row.employee_code as string | null,
        row.name,
        branch?.name,
        row.phone,
      ]
        .filter(Boolean)
        .join(" · "),
      href: `/admin/employees/${row.id}`,
      createdAt: row.created_at as string | null,
      urgency: "urgent",
    })
  }

  for (const row of leaveRes.data ?? []) {
    const typeLabel =
      LEAVE_TYPE_LABELS[row.type as LeaveType] ?? row.type
    items.push({
      id: `leave-${row.id}`,
      kind: "leave",
      title: "ขอลารออนุมัติ",
      summary: `${employeeName(row.hr_employees)} · ${typeLabel} ${row.start_date}–${row.end_date}`,
      href: "/admin/leaves?status=pending",
      createdAt: row.created_at as string | null,
      urgency: "normal",
    })
  }

  for (const row of attRes.data ?? []) {
    items.push({
      id: `attendance-${row.id}`,
      kind: "attendance",
      title: "ส่งเวลางานรออนุมัติ",
      summary: `${employeeName(row.hr_employees)} · วันที่ ${row.work_date}`,
      href: "/admin/attendance",
      createdAt: row.submitted_at as string | null,
      urgency: "normal",
    })
  }

  for (const row of otRes.data ?? []) {
    items.push({
      id: `overtime-${row.id}`,
      kind: "overtime",
      title: "ขอ OT รออนุมัติ",
      summary: `${employeeName(row.hr_employees)} · ${row.work_date} ${row.start_time}–${row.end_time}`,
      href: "/admin/overtime",
      createdAt: row.submitted_at as string | null,
      urgency: "normal",
    })
  }

  for (const row of docRes.data ?? []) {
    const docLabel =
      DOC_TYPE_LABELS[row.doc_type as keyof typeof DOC_TYPE_LABELS] ?? row.doc_type
    items.push({
      id: `document-${row.id}`,
      kind: "document",
      title: "ขอเอกสารรอดำเนินการ",
      summary: `${employeeName(row.hr_employees)} · ${docLabel}`,
      href: "/admin/documents?status=pending",
      createdAt: row.created_at as string | null,
      urgency: "normal",
    })
  }

  for (const row of complaintRes.data ?? []) {
    items.push({
      id: `complaint-${row.id}`,
      kind: "complaint",
      title: "เรื่องร้องเรียนใหม่",
      summary: `${row.ticket_code} · ${row.subject}`,
      href: "/admin/complaints?status=open",
      createdAt: row.created_at as string | null,
      urgency: "normal",
    })
  }

  const total =
    (regCountRes.count ?? 0) +
    (leaveCountRes.count ?? 0) +
    (attCountRes.count ?? 0) +
    (otCountRes.count ?? 0) +
    (docCountRes.count ?? 0) +
    (complaintCountRes.count ?? 0)

  return {
    items: sortItemsByRecency(items),
    total,
    counts: {
      registration: regCountRes.count ?? 0,
      leave: leaveCountRes.count ?? 0,
      attendance: attCountRes.count ?? 0,
      overtime: otCountRes.count ?? 0,
      document: docCountRes.count ?? 0,
      complaint: complaintCountRes.count ?? 0,
    },
  }
}

async function branchApprovalNotifications(
  caller: Employee
): Promise<{
  items: NotificationItem[]
  total: number
  counts: { leave: number; attendance: number; overtime: number }
}> {
  const branchId = await getManagedBranchId(caller.id)
  if (!branchId) {
    return {
      items: [],
      total: 0,
      counts: { leave: 0, attendance: 0, overtime: 0 },
    }
  }

  const supabase = await createClient()
  const [leaveRes, leaveCountRes, attRes, attCountRes, otRes, otCountRes] =
    await Promise.all([
      supabase
        .from("hr_leaves")
        .select(
          "id, type, start_date, end_date, created_at, hr_employees!employee_id(name, branch_id)"
        )
        .eq("approval_status", "pending_manager")
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("hr_leaves")
        .select("id, hr_employees!inner(branch_id)", { count: "exact", head: true })
        .eq("approval_status", "pending_manager")
        .eq("hr_employees.branch_id", branchId),
      supabase
        .from("hr_attendance_submissions")
        .select(
          "id, work_date, submitted_at, hr_employees!employee_id(name, branch_id)"
        )
        .eq("approval_status", "pending_manager")
        .order("submitted_at", { ascending: false })
        .limit(30),
      supabase
        .from("hr_attendance_submissions")
        .select("id, hr_employees!inner(branch_id)", { count: "exact", head: true })
        .eq("approval_status", "pending_manager")
        .eq("hr_employees.branch_id", branchId),
      supabase
        .from("hr_overtime_requests")
        .select(
          "id, work_date, start_time, end_time, submitted_at, hr_employees!employee_id(name, branch_id)"
        )
        .eq("approval_status", "pending_manager")
        .order("submitted_at", { ascending: false })
        .limit(30),
      supabase
        .from("hr_overtime_requests")
        .select("id, hr_employees!inner(branch_id)", { count: "exact", head: true })
        .eq("approval_status", "pending_manager")
        .eq("hr_employees.branch_id", branchId),
    ])

  const items: NotificationItem[] = []

  const inBranch = (joined: { branch_id?: string } | Array<{ branch_id?: string }>) => {
    const emp = Array.isArray(joined) ? joined[0] : joined
    return emp?.branch_id === branchId
  }

  for (const row of (leaveRes.data ?? []).filter((r) => inBranch(r.hr_employees))) {
    const typeLabel =
      LEAVE_TYPE_LABELS[row.type as LeaveType] ?? row.type
    items.push({
      id: `leave-${row.id}`,
      kind: "leave",
      title: "ขอลารอ BM อนุมัติ",
      summary: `${employeeName(row.hr_employees)} · ${typeLabel} ${row.start_date}–${row.end_date}`,
      href: "/admin/branch/leaves",
      createdAt: row.created_at as string | null,
      urgency: "normal",
    })
  }

  for (const row of (attRes.data ?? []).filter((r) => inBranch(r.hr_employees))) {
    items.push({
      id: `attendance-${row.id}`,
      kind: "attendance",
      title: "ส่งเวลางานรอ BM",
      summary: `${employeeName(row.hr_employees)} · วันที่ ${row.work_date}`,
      href: "/admin/branch/attendance",
      createdAt: row.submitted_at as string | null,
      urgency: "normal",
    })
  }

  for (const row of (otRes.data ?? []).filter((r) => inBranch(r.hr_employees))) {
    items.push({
      id: `overtime-${row.id}`,
      kind: "overtime",
      title: "ขอ OT รอ BM",
      summary: `${employeeName(row.hr_employees)} · ${row.work_date} ${row.start_time}–${row.end_time}`,
      href: "/admin/branch/overtime",
      createdAt: row.submitted_at as string | null,
      urgency: "normal",
    })
  }

  const total =
    (leaveCountRes.count ?? 0) +
    (attCountRes.count ?? 0) +
    (otCountRes.count ?? 0)

  return {
    items: sortItemsByRecency(items).slice(0, LIST_LIMIT),
    total,
    counts: {
      leave: leaveCountRes.count ?? 0,
      attendance: attCountRes.count ?? 0,
      overtime: otCountRes.count ?? 0,
    },
  }
}

export type NotificationScope = "hr" | "branch"

export function resolveNotificationScope(
  caller: Employee,
  devView?: DevViewAs | null
): NotificationScope | null {
  if (caller.role === "dev") {
    if (devView === "branch") return "branch"
    if (devView === "ceo") return null
    return "hr"
  }
  if (canManageHr(caller.role)) return "hr"
  if (caller.role === "branch_manager") return "branch"
  return null
}

export async function getNotificationInbox(
  caller: Employee,
  scope: NotificationScope
): Promise<NotificationInbox> {
  const today = ictToday()
  const windowEnd = new Date(
    Date.parse(`${today}T00:00:00Z`) + COMPLIANCE_WINDOW_DAYS * DAY_MS
  )
    .toISOString()
    .slice(0, 10)

  if (scope === "branch") {
    const branch = await branchApprovalNotifications(caller)
    return {
      items: branch.items.slice(0, LIST_LIMIT),
      total: branch.total,
      approvalTotal: branch.total,
      complianceTotal: 0,
      navBadges: buildBranchNavBadges({
        attendance: branch.counts.attendance,
        leaves: branch.counts.leave,
        overtime: branch.counts.overtime,
        total: branch.total,
      }),
    }
  }

  const [approvals, compliance] = await Promise.all([
    hrApprovalNotifications(),
    complianceNotifications(today, windowEnd),
  ])

  const merged = sortItemsByRecency([
    ...approvals.items,
    ...compliance.items,
  ]).slice(0, LIST_LIMIT)

  return {
    items: merged,
    total: approvals.total + compliance.total,
    approvalTotal: approvals.total,
    complianceTotal: compliance.total,
    navBadges: buildHrNavBadges(approvals.counts, compliance.total),
  }
}

export async function getNotificationCount(
  caller: Employee,
  scope: NotificationScope
): Promise<number> {
  const inbox = await getNotificationInbox(caller, scope)
  return inbox.total
}
