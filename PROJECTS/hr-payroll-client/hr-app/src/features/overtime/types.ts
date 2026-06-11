export const OT_STATUSES = ["pending", "approved", "rejected"] as const

export type OtStatus = (typeof OT_STATUSES)[number]

export const OT_STATUS_LABELS: Record<OtStatus, string> = {
  pending: "รออนุมัติ",
  approved: "อนุมัติ",
  rejected: "ไม่อนุมัติ",
}
