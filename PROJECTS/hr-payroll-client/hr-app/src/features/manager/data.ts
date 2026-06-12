import { getManagedBranchId } from "@/lib/auth/branch"
import { canManageHr } from "@/lib/auth/roles"
import type { Employee } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"

export type ManagerQueueScope = "hr" | "branch"

export async function getManagerScope(
  caller: Employee,
  scope: ManagerQueueScope = "branch"
) {
  if (scope === "hr" && canManageHr(caller.role)) {
    return { branchId: null as string | null, isHr: true }
  }

  if (caller.role === "dev") {
    const branchId = await getManagedBranchId(caller.id)
    return { branchId, isHr: false }
  }

  if (canManageHr(caller.role)) {
    return { branchId: null as string | null, isHr: scope === "hr" }
  }

  const branchId = await getManagedBranchId(caller.id)
  return { branchId, isHr: false }
}

export async function getManagerAttendanceQueue(
  caller: Employee,
  scope: ManagerQueueScope = "branch"
) {
  const { branchId, isHr } = await getManagerScope(caller, scope)
  const supabase = await createClient()

  const query = supabase
    .from("hr_attendance_submissions")
    .select("id, work_date, submitted_at, hr_employees!employee_id(name, branch_id)")
    .eq("approval_status", isHr ? "pending_hr" : "pending_manager")
    .order("submitted_at", { ascending: true })
    .limit(50)

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).filter((row) => {
    if (isHr) return true
    const emp = Array.isArray(row.hr_employees) ? row.hr_employees[0] : row.hr_employees
    return (emp as { branch_id?: string })?.branch_id === branchId
  })
}

export async function getManagerLeaveQueue(
  caller: Employee,
  scope: ManagerQueueScope = "branch"
) {
  const { branchId, isHr } = await getManagerScope(caller, scope)
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("hr_leaves")
    .select(
      "id, type, start_date, end_date, leave_unit, leave_hours, hr_employees!employee_id(name, branch_id)"
    )
    .eq("approval_status", isHr ? "pending_hr" : "pending_manager")
    .order("submitted_at", { ascending: true })
    .limit(50)

  if (error) throw error

  return (data ?? []).filter((row) => {
    if (isHr) return true
    const emp = Array.isArray(row.hr_employees) ? row.hr_employees[0] : row.hr_employees
    return (emp as { branch_id?: string })?.branch_id === branchId
  })
}

export async function getManagerOvertimeQueue(
  caller: Employee,
  scope: ManagerQueueScope = "branch"
) {
  const { branchId, isHr } = await getManagerScope(caller, scope)
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("hr_overtime_requests")
    .select(
      "id, work_date, start_time, end_time, hr_employees!employee_id(name, branch_id)"
    )
    .eq("approval_status", isHr ? "pending_hr" : "pending_manager")
    .order("submitted_at", { ascending: true })
    .limit(50)

  if (error) throw error

  return (data ?? []).filter((row) => {
    if (isHr) return true
    const emp = Array.isArray(row.hr_employees) ? row.hr_employees[0] : row.hr_employees
    return (emp as { branch_id?: string })?.branch_id === branchId
  })
}

export async function getBranchEmployees(caller: Employee) {
  const branchId = await getManagedBranchId(caller.id)
  if (!branchId) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("hr_employees")
    .select("id, name, department")
    .eq("branch_id", branchId)
    .eq("status", "active")
    .eq("role", "employee")
    .order("name")

  if (error) throw error
  return data ?? []
}
