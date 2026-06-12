import { canManageHr } from "@/lib/auth/roles"
import { getCurrentEmployee } from "@/lib/auth/session"

export async function assertInventoryManage() {
  const employee = await getCurrentEmployee()
  if (!employee || !canManageHr(employee.role)) {
    throw new Error("ไม่มีสิทธิ์จัดการคลังสินค้า")
  }
  return employee
}

export function formatInventoryError(error: unknown): string {
  if (error instanceof Error) return error.message
  return "เกิดข้อผิดพลาด"
}
