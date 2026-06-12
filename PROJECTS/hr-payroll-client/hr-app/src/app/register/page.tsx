import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { RegisterForm, RegisterShell } from "@/features/auth/RegisterForm"
import { isPendingRegistration } from "@/lib/auth/employee-access"
import { adminLoginPath } from "@/lib/auth/roles"
import { LINE_REGISTER_COOKIE } from "@/lib/auth/register-cookie"
import { getCurrentEmployee } from "@/lib/auth/session"

export default async function RegisterPage() {
  const employee = await getCurrentEmployee()
  if (employee) {
    if (isPendingRegistration(employee)) {
      redirect("/register/pending")
    }
    if (employee.status === "active") {
      redirect(adminLoginPath(employee.role, employee.status))
    }
  }

  const cookieStore = await cookies()
  const pending = cookieStore.get(LINE_REGISTER_COOKIE)?.value
  if (!pending) {
    redirect("/login")
  }

  return (
    <RegisterShell>
      <RegisterForm />
    </RegisterShell>
  )
}
