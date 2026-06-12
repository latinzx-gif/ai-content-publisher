import { isManagementDepartment } from "@/lib/auth/department-access"
import {
  EMPLOYEE_INFO_PATH,
  PENDING_REGISTRATION_PATH,
} from "@/lib/auth/employee-access"
import type { Employee } from "@/lib/auth/session"

export type AppRole = Employee["role"]

export function isDev(role: AppRole): boolean {
  return role === "dev"
}

export function isCeo(role: AppRole): boolean {
  return role === "ceo"
}

export function isHrAdmin(role: AppRole): boolean {
  return role === "hr" || role === "admin"
}

export function isBranchManager(role: AppRole): boolean {
  return role === "branch_manager"
}

export function canAccessAdminPortal(role: AppRole): boolean {
  return isHrAdmin(role) || isCeo(role) || isBranchManager(role) || isDev(role)
}

/** Dashboard access — role-based; แผนก Management (active) เข้าได้ทุกคน สิทธิ์ภายในตาม Role */
export function canEmployeeAccessAdminPortal(employee: Employee): boolean {
  if (employee.status !== "active") return false
  if (canAccessAdminPortal(employee.role)) return true
  return isManagementDepartment(employee.department)
}

/** แผนก Management + role Employee — full admin nav (no longer dashboard-only) */
export function isManagementDashboardEmployee(employee: Employee): boolean {
  return (
    employee.role === "employee" &&
    isManagementDepartment(employee.department)
  )
}

/** Worker web portal disabled — employees use LINE OA only. */
export function canAccessEmployeePortal(role: AppRole): boolean {
  return isDev(role)
}

export function canManageHr(role: AppRole): boolean {
  return isHrAdmin(role) || isDev(role)
}

/** Dev + HR Admin — เข้าถึงข้อมูลและจัดการได้ทั้งหมด */
export function hasFullDataAccess(role: AppRole): boolean {
  return isDev(role) || canManageHr(role)
}

/** Edit employee records (profile, lifecycle) — HR, Dev, CEO */
export function canEditEmployeeRecord(role: AppRole): boolean {
  return canManageHr(role) || isCeo(role)
}

/** CEO — open all admin routes (no path prison) */
export function isCeoAllowedPath(pathname: string): boolean {
  return pathname.startsWith("/admin")
}

export function adminLoginPath(
  role: AppRole,
  status: Employee["status"] = "active",
  department: string | null = null
): string {
  if (status === "inactive") return PENDING_REGISTRATION_PATH
  if (role === "dev") return "/admin"
  if (role === "branch_manager") return "/admin/branch"
  if (role === "ceo") return "/admin/report"
  if (isHrAdmin(role) || isManagementDepartment(department)) return "/admin"
  return EMPLOYEE_INFO_PATH
}
