import { redirect } from "next/navigation"

import { PORTAL_NAV_ITEMS } from "@/components/portal/portal-nav"
import { PortalShell } from "@/components/portal/PortalShell"
import {
  canUseWorkerFeatures,
  isPendingRegistration,
  PENDING_REGISTRATION_PATH,
} from "@/lib/auth/employee-access"
import { getCurrentEmployee } from "@/lib/auth/session"
import { adminLoginPath, canAccessEmployeePortal } from "@/lib/auth/roles"

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const employee = await getCurrentEmployee()
  if (!employee) redirect("/login?error=session_failed")

  if (isPendingRegistration(employee)) {
    redirect(PENDING_REGISTRATION_PATH)
  }

  if (!canUseWorkerFeatures(employee)) {
    redirect("/login?error=session_failed")
  }

  if (!canAccessEmployeePortal(employee.role)) {
    redirect(adminLoginPath(employee.role, employee.status, employee.department))
  }

  return (
    <PortalShell
      navItems={PORTAL_NAV_ITEMS}
      user={{
        name: employee.name,
        role: employee.role,
        position: employee.position,
        avatarUrl: employee.avatarUrl,
      }}
    >
      {children}
    </PortalShell>
  )
}
