import { redirect } from "next/navigation"

import { PendingRegistrationCard } from "@/components/auth/PendingRegistrationCard"
import { isPendingRegistration } from "@/lib/auth/employee-access"
import { getCurrentEmployee } from "@/lib/auth/session"

export default async function LiffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const employee = await getCurrentEmployee()
  if (!employee) {
    return children
  }

  if (isPendingRegistration(employee)) {
    return <PendingRegistrationCard name={employee.name} />
  }

  if (employee.status !== "active") {
    redirect("/login?error=session_failed")
  }

  return children
}
