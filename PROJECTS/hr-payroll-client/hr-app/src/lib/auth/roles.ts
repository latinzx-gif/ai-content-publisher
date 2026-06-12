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

export function canAccessEmployeePortal(role: AppRole): boolean {
  return role === "employee" || isDev(role)
}

export function canManageHr(role: AppRole): boolean {
  return isHrAdmin(role) || isDev(role)
}

export const CEO_ALLOWED_PREFIXES = [
  "/admin/ceo",
  "/admin/branches",
  "/admin/employees",
  "/admin/reports",
  "/admin/organization",
] as const

export function isCeoAllowedPath(pathname: string): boolean {
  return CEO_ALLOWED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
}

export function adminLoginPath(role: AppRole): string {
  if (role === "dev") return "/admin/ceo"
  if (role === "branch_manager") return "/admin/branch"
  if (role === "ceo") return "/admin/ceo"
  if (isHrAdmin(role)) return "/admin"
  return "/portal"
}
