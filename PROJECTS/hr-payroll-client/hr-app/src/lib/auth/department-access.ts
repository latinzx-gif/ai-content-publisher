/** Head Office department — ทุกคนใช้ Dashboard ได้ (สิทธิ์ตาม Role) */
export const MANAGEMENT_DEPARTMENT_NAME = "Management"

export function isManagementDepartment(
  department: string | null | undefined
): boolean {
  if (!department) return false
  return department.trim().toLowerCase() === MANAGEMENT_DEPARTMENT_NAME.toLowerCase()
}
