import { redirect } from "next/navigation"

import { RegisterForm, RegisterShell } from "@/features/auth/RegisterForm"
import { isPendingRegistration } from "@/lib/auth/employee-access"
import { adminLoginPath } from "@/lib/auth/roles"
import { getCurrentEmployee } from "@/lib/auth/session"

export default async function RegisterPage() {
  const employee = await getCurrentEmployee()
  if (employee) {
    if (isPendingRegistration(employee)) {
      redirect("/register/pending")
    }
    if (employee.status === "active") {
      redirect(adminLoginPath(employee.role, employee.status, employee.department))
    }
  }

  return (
    <RegisterShell>
      <RegisterForm />
    </RegisterShell>
  )
}
