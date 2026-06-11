import type { messagingApi } from "@line/bot-sdk"

import { BRAND_RED } from "@/lib/line/brand"
import { flexMessage, simpleBubble } from "@/lib/line/flex/base"
import {
  countLeaveDays,
  LEAVE_TYPE_LABELS,
  type LeaveType,
} from "@/features/leave/types"

export function leaveSubmitConfirmFlex(options: {
  employeeName: string
  type: LeaveType
  startDate: string
  endDate: string
  balanceRemaining?: number | null
}): messagingApi.FlexMessage {
  const days = countLeaveDays(options.startDate, options.endDate) ?? 0
  const rows = [
    { label: "พนักงาน", value: options.employeeName },
    { label: "ประเภท", value: LEAVE_TYPE_LABELS[options.type] },
    { label: "วันที่", value: `${options.startDate} – ${options.endDate}` },
    { label: "จำนวนวัน", value: `${days} วัน` },
    ...(options.balanceRemaining != null
      ? [
          {
            label: "ยอดคงเหลือ",
            value: `${options.balanceRemaining} วัน`,
          },
        ]
      : []),
    { label: "สถานะ", value: "รออนุมัติ", valueColor: "#F59E0B" },
  ]
  return flexMessage(
    "ส่งคำขอลาแล้ว",
    simpleBubble({
      title: "ส่งคำขอลาแล้ว",
      accentColor: BRAND_RED,
      rows,
      footerNote: "HR จะแจ้งผลการอนุมัติทาง LINE เมื่อดำเนินการแล้ว",
    })
  )
}

export function leaveSubmitHrNotifyFlex(options: {
  employeeName: string
  department: string | null
  type: LeaveType
  startDate: string
  endDate: string
  reason: string
  adminUrl?: string
}): messagingApi.FlexMessage {
  const days = countLeaveDays(options.startDate, options.endDate) ?? 0
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const adminUrl =
    options.adminUrl ?? (baseUrl ? `${baseUrl}/admin/leaves` : undefined)

  return flexMessage(
    `คำขอลาใหม่: ${options.employeeName}`,
    simpleBubble({
      title: "คำขอลาใหม่",
      accentColor: "#2563EB",
      rows: [
        { label: "พนักงาน", value: options.employeeName },
        { label: "แผนก", value: options.department ?? "—" },
        { label: "ประเภท", value: LEAVE_TYPE_LABELS[options.type] },
        { label: "วันที่", value: `${options.startDate} – ${options.endDate}` },
        { label: "จำนวนวัน", value: `${days} วัน` },
        { label: "เหตุผล", value: options.reason },
      ],
      footerNote: "อนุมัติ/ปฏิเสธได้ที่ Web Admin → Leaves",
      button: adminUrl
        ? { label: "เปิดหน้าจัดการลา", uri: adminUrl }
        : undefined,
    })
  )
}
