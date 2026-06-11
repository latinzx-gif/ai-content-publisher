import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

import { AdminShell } from "@/components/admin/AdminShell"
import {
  getNavItemsForRole,
  withBranchPendingBadges,
} from "@/components/admin/branch-nav"
import { getBranchPendingCounts } from "@/features/manager/branch-pending-counts"
import { getUrgentAlertCount } from "@/features/alerts/data"
import {
  DEV_VIEW_COOKIE,
  getDevNavItems,
  getDevNavMode,
  parseDevViewAs,
} from "@/lib/auth/dev-view"
import {
  canAccessAdminPortal,
  isBranchManager,
  isCeo,
  isCeoAllowedPath,
  isDev,
} from "@/lib/auth/roles"
import { getCurrentEmployee } from "@/lib/auth/session"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const employee = await getCurrentEmployee()
  if (!employee) redirect("/login?error=session_failed")
  if (!canAccessAdminPortal(employee.role)) {
    redirect("/login?error=forbidden")
  }

  const pathname = (await headers()).get("x-pathname") ?? ""
  const dev = isDev(employee.role)
  const branchManager = !dev && isBranchManager(employee.role)
  const ceo = !dev && isCeo(employee.role)

  if (!dev) {
    if (
      branchManager &&
      pathname.startsWith("/admin") &&
      !pathname.startsWith("/admin/branch")
    ) {
      redirect("/admin/branch")
    }

    if (ceo && pathname.startsWith("/admin") && !isCeoAllowedPath(pathname)) {
      redirect("/admin/ceo")
    }

    if (!ceo && !branchManager && pathname.startsWith("/admin/ceo")) {
      redirect("/admin")
    }
  }

  const devView = dev
    ? parseDevViewAs((await cookies()).get(DEV_VIEW_COOKIE)?.value)
    : null
  const navMode = dev && devView ? getDevNavMode(devView) : null

  const alertBadge =
    dev || branchManager || ceo ? 0 : await getUrgentAlertCount()
  let navItems =
    dev && devView ? getDevNavItems(devView) : getNavItemsForRole(employee.role)

  if (branchManager || (dev && devView === "branch")) {
    const counts = await getBranchPendingCounts(employee)
    navItems = withBranchPendingBadges(navItems, counts)
  }

  return (
    <AdminShell
      alertBadge={alertBadge}
      branchMode={navMode?.branchMode ?? branchManager}
      ceoMode={navMode?.ceoMode ?? ceo}
      devAllMode={navMode?.devAllMode ?? false}
      devView={devView}
      navItems={navItems}
      user={{
        name: employee.name,
        role: employee.role,
        position: employee.position,
      }}
    >
      {children}
    </AdminShell>
  )
}
