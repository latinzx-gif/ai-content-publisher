import type { Employee } from "@/lib/auth/session"

export function roleDisplayLabel(role: Employee["role"]): string {
  if (role === "dev") return "Developer"
  if (role === "ceo") return "CEO"
  if (role === "admin") return "Owner"
  if (role === "hr") return "HR Admin"
  if (role === "branch_manager") return "Branch Manager"
  return "Employee"
}
