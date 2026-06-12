import type { AdminNavItem } from "@/components/admin/admin-nav-types"

export type HrApprovalCounts = {
  registration: number
  onboarding: number
  leave: number
  attendance: number
  overtime: number
  document: number
  complaint: number
}

export type NavAlertBadgeMap = Record<string, number>

export function hrApprovalCountsTotal(counts: HrApprovalCounts): number {
  return (
    counts.registration +
    counts.onboarding +
    counts.leave +
    counts.attendance +
    counts.overtime +
    counts.document +
    counts.complaint
  )
}

/** Map notification counts → sidebar href badges (HR admin nav). */
export function buildHrNavBadges(
  counts: HrApprovalCounts,
  complianceTotal: number
): NavAlertBadgeMap {
  const badges: NavAlertBadgeMap = {}
  const approvalTotal = hrApprovalCountsTotal(counts)

  const managerQueueTotal =
    counts.leave + counts.attendance + counts.overtime

  if (approvalTotal > 0) {
    badges["/admin"] = approvalTotal
  }
  if (managerQueueTotal > 0) {
    badges["/admin/manager"] = managerQueueTotal
  }

  const employees = counts.registration + counts.onboarding + complianceTotal
  if (employees > 0) {
    badges["/admin/employees"] = employees
  }

  if (counts.attendance > 0) badges["/admin/attendance"] = counts.attendance
  if (counts.leave > 0) badges["/admin/leaves"] = counts.leave
  if (counts.overtime > 0) badges["/admin/overtime"] = counts.overtime
  if (counts.document > 0) badges["/admin/documents"] = counts.document
  if (counts.complaint > 0) badges["/admin/complaints"] = counts.complaint

  return badges
}

export type BranchNavAlertCounts = {
  attendance: number
  leaves: number
  overtime: number
  total: number
}

export function buildBranchNavBadges(counts: BranchNavAlertCounts): NavAlertBadgeMap {
  const badges: NavAlertBadgeMap = {}
  if (counts.total > 0) badges["/admin/branch"] = counts.total
  if (counts.attendance > 0) badges["/admin/branch/attendance"] = counts.attendance
  if (counts.leaves > 0) badges["/admin/branch/leaves"] = counts.leaves
  if (counts.overtime > 0) badges["/admin/branch/overtime"] = counts.overtime
  return badges
}

export function withNavAlertBadges(
  items: AdminNavItem[],
  badges: NavAlertBadgeMap
): AdminNavItem[] {
  return items.map((item) => {
    const count = badges[item.href]
    if (count && count > 0) {
      return { ...item, badge: count }
    }
    return item.badge ? { ...item, badge: undefined } : item
  })
}
