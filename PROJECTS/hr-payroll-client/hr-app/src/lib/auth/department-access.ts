/** Head Office department — ทุกคนใช้ Dashboard ได้ (สิทธิ์ตาม Role) */
export const MANAGEMENT_DEPARTMENT_NAME = "Management"

/** แผนก HR Office — เข้า Admin Portal ได้เมื่อ active */
export const HR_OFFICER_DEPARTMENT_NAME = "HR Officer"

/** แผนกคลังสินค้า — เข้า Admin Portal แบบจำกัด (inventory only) */
export const INVENTORY_DEPARTMENT_NAME = "Inventory"

export function isManagementDepartment(
  department: string | null | undefined
): boolean {
  if (!department) return false
  return department.trim().toLowerCase() === MANAGEMENT_DEPARTMENT_NAME.toLowerCase()
}

export function isHrOfficerDepartment(
  department: string | null | undefined
): boolean {
  if (!department) return false
  return (
    department.trim().toLowerCase() === HR_OFFICER_DEPARTMENT_NAME.toLowerCase()
  )
}

export function isInventoryDepartment(
  department: string | null | undefined
): boolean {
  if (!department) return false
  return (
    department.trim().toLowerCase() === INVENTORY_DEPARTMENT_NAME.toLowerCase()
  )
}

export function isHeadOfficeAdminDepartment(
  department: string | null | undefined
): boolean {
  return (
    isManagementDepartment(department) ||
    isHrOfficerDepartment(department) ||
    isInventoryDepartment(department)
  )
}
