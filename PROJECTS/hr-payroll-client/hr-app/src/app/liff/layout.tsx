import { redirect } from "next/navigation"

import { PendingRegistrationCard } from "@/components/auth/PendingRegistrationCard"
import { LiffLocaleSync } from "@/components/liff/LiffLocaleSync"
import { isPendingRegistration } from "@/lib/auth/employee-access"
import { getCurrentEmployee } from "@/lib/auth/session"

export default async function LiffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const employee = await getCurrentEmployee()

  if (employee && isPendingRegistration(employee)) {
    return (
      <>
        <LiffLocaleSync />
        <PendingRegistrationCard name={employee.name} />
      </>
    )
  }

  if (employee && employee.status !== "active") {
    redirect("/login?error=session_failed")
  }

  return (
    <>
      <LiffLocaleSync />
      {children}
    </>
  )
}
