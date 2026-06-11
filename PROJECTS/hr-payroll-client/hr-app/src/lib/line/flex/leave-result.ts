import type { messagingApi } from "@line/bot-sdk"

import {
  countLeaveDays,
  LEAVE_TYPE_LABELS,
  type LeaveType,
} from "@/features/leave/types"
import { flexMessage, simpleBubble } from "@/lib/line/flex/base"

export function leaveApprovedFlex(options: {
  type: LeaveType
  startDate: string
  endDate: string
  remainingDays: number | null
  note?: string | null
}): messagingApi.FlexMessage {
  const days = countLeaveDays(options.startDate, options.endDate) ?? 0
  const rows = [
    { label: "ผลการพิจารณา", value: "อนุมัติ", valueColor: "#16A34A" },
    { label: "ประเภท", value: LEAVE_TYPE_LABELS[options.type] },
    { label: "วันที่", value: `${options.startDate} – ${options.endDate}` },
    { label: "จำนวนวัน", value: `${days} วัน` },
  ]
  if (options.remainingDays !== null) {
    rows.push({
      label: "คงเหลือ",
      value: `${options.remainingDays} วัน`,
    })
  }
  if (options.note) {
    rows.push({ label: "หมายเหตุ HR", value: options.note })
  }

  return flexMessage(
    "คำขอลาได้รับการอนุมัติ",
    simpleBubble({
      title: "อนุมัติการลา",
      accentColor: "#16A34A",
      rows,
    })
  )
}

export function leaveRejectedFlex(options: {
  type: LeaveType
  startDate: string
  endDate: string
  reason: string
}): messagingApi.FlexMessage {
  const days = countLeaveDays(options.startDate, options.endDate) ?? 0
  return flexMessage(
    "คำขอลาไม่ได้รับการอนุมัติ",
    simpleBubble({
      title: "ไม่อนุมัติการลา",
      accentColor: "#DC2626",
      rows: [
        { label: "ผลการพิจารณา", value: "ไม่อนุมัติ", valueColor: "#DC2626" },
        { label: "ประเภท", value: LEAVE_TYPE_LABELS[options.type] },
        { label: "วันที่", value: `${options.startDate} – ${options.endDate}` },
        { label: "จำนวนวัน", value: `${days} วัน` },
        { label: "เหตุผล", value: options.reason },
      ],
    })
  )
}
