import { ictToday } from "@/features/employees/data"
import type { BranchDashboardData } from "@/features/branch-dashboard/data"
import { getBranchDashboardDataForBranch } from "@/features/branch-dashboard/data"
import {
  getBranchAttendanceQueue,
  getBranchLeaveQueue,
  getBranchOvertimeQueue,
} from "@/features/branches/branch-queues"
import { createClient } from "@/lib/supabase/server"

export {
  getBranchAttendanceQueue,
  getBranchLeaveQueue,
  getBranchOvertimeQueue,
} from "@/features/branches/branch-queues"

const COMPLIANCE_WINDOW_DAYS = 60
const DAY_MS = 86_400_000

export type BranchDetail = {
  id: string
  name: string
  code: string | null
  manager_employee_id: string | null
  manager_name: string | null
}

export type BranchEmployeeAlerts = {
  pendingLeave: number
  pendingAttendance: number
  pendingOvertime: number
  pendingApproval: boolean
  complianceDue: boolean
}

export type BranchEmployeeWithAlerts = {
  id: string
  name: string
  department: string | null
  position: string | null
  status: string
  role: string
  alerts: BranchEmployeeAlerts
}

export async function getBranchById(branchId: string): Promise<BranchDetail | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("hr_branches")
    .select(
      "id, name, code, manager_employee_id, hr_employees!manager_employee_id(name)"
    )
    .eq("id", branchId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const mgr = Array.isArray(data.hr_employees)
    ? data.hr_employees[0]
    : data.hr_employees

  return {
    id: data.id as string,
    name: data.name as string,
    code: data.code as string | null,
    manager_employee_id: data.manager_employee_id as string | null,
    manager_name: (mgr as { name?: string } | null)?.name ?? null,
  }
}

export async function getBranchHubDashboard(
  branchId: string
): Promise<BranchDashboardData> {
  return getBranchDashboardDataForBranch(branchId)
}

function countByEmployee(
  rows: Array<{ employee_id?: string }>,
  key: "employee_id" = "employee_id"
): Map<string, number> {
  const map = new Map<string, number>()
  for (const row of rows) {
    const id = row[key]
    if (!id) continue
    map.set(id, (map.get(id) ?? 0) + 1)
  }
  return map
}

export async function getBranchEmployeesWithAlerts(
  branchId: string
): Promise<BranchEmployeeWithAlerts[]> {
  const supabase = await createClient()
  const today = ictToday()
  const windowEnd = new Date(
    Date.parse(`${today}T00:00:00Z`) + COMPLIANCE_WINDOW_DAYS * DAY_MS
  )
    .toISOString()
    .slice(0, 10)

  const [
    employeesRes,
    leavesRes,
    attendanceRes,
    overtimeRes,
  ] = await Promise.all([
    supabase
      .from("hr_employees")
      .select(
        "id, name, department, position, status, role, probation_end, visa_expiry, work_permit_expiry"
      )
      .eq("branch_id", branchId)
      .in("role", ["employee", "branch_manager"])
      .order("name"),
    supabase
      .from("hr_leaves")
      .select("employee_id, hr_employees!inner(branch_id)")
      .eq("hr_employees.branch_id", branchId)
      .eq("status", "pending"),
    supabase
      .from("hr_attendance_submissions")
      .select("employee_id, hr_employees!inner(branch_id)")
      .eq("hr_employees.branch_id", branchId)
      .in("approval_status", ["pending_manager", "pending_hr"]),
    supabase
      .from("hr_overtime_requests")
      .select("employee_id, hr_employees!inner(branch_id)")
      .eq("hr_employees.branch_id", branchId)
      .in("approval_status", ["pending_manager", "pending_hr"]),
  ])

  if (employeesRes.error) throw employeesRes.error
  if (leavesRes.error) throw leavesRes.error
  if (attendanceRes.error) throw attendanceRes.error
  if (overtimeRes.error) throw overtimeRes.error

  const leaveCounts = countByEmployee(
    (leavesRes.data ?? []).map((r) => ({
      employee_id: r.employee_id as string,
    }))
  )
  const attCounts = countByEmployee(
    (attendanceRes.data ?? []).map((r) => ({
      employee_id: r.employee_id as string,
    }))
  )
  const otCounts = countByEmployee(
    (overtimeRes.data ?? []).map((r) => ({
      employee_id: r.employee_id as string,
    }))
  )

  return (employeesRes.data ?? []).map((row) => {
    const probation = row.probation_end as string | null
    const visa = row.visa_expiry as string | null
    const permit = row.work_permit_expiry as string | null
    const complianceDue = [probation, visa, permit].some(
      (d) => d && d >= today && d <= windowEnd
    )

    return {
      id: row.id as string,
      name: row.name as string,
      department: row.department as string | null,
      position: row.position as string | null,
      status: row.status as string,
      role: row.role as string,
      alerts: {
        pendingLeave: leaveCounts.get(row.id as string) ?? 0,
        pendingAttendance: attCounts.get(row.id as string) ?? 0,
        pendingOvertime: otCounts.get(row.id as string) ?? 0,
        pendingApproval:
          row.status === "inactive" && row.role === "employee",
        complianceDue,
      },
    }
  })
}

