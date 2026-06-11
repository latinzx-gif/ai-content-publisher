// Leave domain constants — single source for T16/T17/T15.
// Keys are the EN values stored in hr_leaves.type / hr_leave_balances.leave_type
// (Q-T16-2 approved); labels are what the UI shows.

export const LEAVE_TYPES = ["sick", "personal", "annual", "other"] as const

export type LeaveType = (typeof LEAVE_TYPES)[number]

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  sick: "ลาป่วย",
  personal: "ลากิจ",
  annual: "ลาพักร้อน",
  other: "อื่นๆ",
}

const DAY_MS = 86_400_000

// Inclusive day count between two "YYYY-MM-DD" strings (e.g. from
// <input type="date">). Returns null when either date is missing/invalid
// or end is before start — callers treat null as "not computable yet".
export function countLeaveDays(
  startDate: string,
  endDate: string
): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) return null

  const start = Date.parse(`${startDate}T00:00:00Z`)
  const end = Date.parse(`${endDate}T00:00:00Z`)
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null

  return Math.round((end - start) / DAY_MS) + 1
}
