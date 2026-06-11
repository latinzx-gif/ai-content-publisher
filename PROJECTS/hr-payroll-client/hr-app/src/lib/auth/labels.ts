import type { Employee } from "@/lib/auth/session"

export function roleDisplayLabel(role: Employee["role"]): string {
  if (role === "admin") return "Owner"
  if (role === "hr") return "Manager"
  return "Employee"
}
