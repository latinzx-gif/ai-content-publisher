import { redirect } from "next/navigation"

import { PORTAL_NAV_ITEMS } from "@/components/portal/portal-nav"
import { PortalShell } from "@/components/portal/PortalShell"
import {
  adminLoginPath,
  canAccessEmployeePortal,
} from "@/lib/auth/roles"
import { getCurrentEmployee } from "@/lib/auth/session"

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const employee = await getCurrentEmployee()
  if (!employee) redirect("/login?error=session_failed")
  if (!canAccessEmployeePortal(employee.role)) {
    redirect(adminLoginPath(employee.role))
  }

  return (
    <PortalShell
      navItems={PORTAL_NAV_ITEMS}
      user={{
        name: employee.name,
        role: employee.role,
        position: employee.position,
      }}
    >
      {children}
    </PortalShell>
  )
}
