export const DOC_TYPES = [
  "employment_cert",
  "salary_cert",
  "tax_cert",
  "other",
] as const

export type DocType = (typeof DOC_TYPES)[number]

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  employment_cert: "หนังสือรับรองการทำงาน",
  salary_cert: "หนังสือรับรองเงินเดือน",
  tax_cert: "หนังสือรับรองภาษี",
  other: "เอกสารอื่นๆ",
}

export const DOC_STATUSES = [
  "pending",
  "processing",
  "ready",
  "completed",
] as const

export type DocStatus = (typeof DOC_STATUSES)[number]

export const DOC_STATUS_LABELS: Record<DocStatus, string> = {
  pending: "รอดำเนินการ",
  processing: "กำลังจัดทำ",
  ready: "พร้อมรับ",
  completed: "เสร็จสิ้น",
}
