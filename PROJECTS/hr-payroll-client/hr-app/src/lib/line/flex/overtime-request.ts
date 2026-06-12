import type { messagingApi } from "@line/bot-sdk"

import { BRAND_RED } from "@/lib/line/brand"
import { flexMessage, simpleBubble } from "@/lib/line/flex/base"

export function overtimeSubmitConfirmFlex(options: {
  employeeName: string
  workDate: string
  startTime: string
  endTime: string
  stage?: "manager" | "hr"
}): messagingApi.FlexMessage {
  const waiting =
    options.stage === "hr"
      ? "รอ HR อนุมัติ"
      : "รอหัวหน้าสาขาอนุมัติ"
  return flexMessage(
    "ส่งคำขอ OT แล้ว",
    simpleBubble({
      title: "ส่งคำขอ OT แล้ว",
      accentColor: "#E65100",
      rows: [
        { label: "พนักงาน", value: options.employeeName },
        { label: "วันที่", value: options.workDate },
        { label: "เวลา", value: `${options.startTime} – ${options.endTime}` },
        { label: "สถานะ", value: waiting, valueColor: "#F59E0B" },
      ],
      footerNote:
        options.stage === "hr"
          ? "HR จะแจ้งผลการอนุมัติทาง LINE"
          : "หัวหน้าสาขาอนุมัติแล้วส่งต่อ HR",
    })
  )
}

export function overtimeSubmitHrNotifyFlex(options: {
  employeeName: string
  department: string | null
  workDate: string
  startTime: string
  endTime: string
  reason: string
}): messagingApi.FlexMessage {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const adminUrl = baseUrl ? `${baseUrl}/admin/overtime` : undefined

  return flexMessage(
    `คำขอ OT ใหม่: ${options.employeeName}`,
    simpleBubble({
      title: "คำขอ OT ใหม่",
      accentColor: BRAND_RED,
      rows: [
        { label: "พนักงาน", value: options.employeeName },
        { label: "แผนก", value: options.department ?? "—" },
        { label: "วันที่", value: options.workDate },
        { label: "เวลา", value: `${options.startTime} – ${options.endTime}` },
        { label: "เหตุผล", value: options.reason },
      ],
      button: adminUrl ? { label: "เปิดคิว OT", uri: adminUrl } : undefined,
    })
  )
}

export function overtimeResultFlex(options: {
  workDate: string
  approved: boolean
  note?: string
}): messagingApi.FlexMessage {
  return flexMessage(
    options.approved ? "อนุมัติ OT แล้ว" : "ไม่อนุมัติ OT",
    simpleBubble({
      title: options.approved ? "อนุมัติ OT" : "ไม่อนุมัติ OT",
      accentColor: "#E65100",
      rows: [
        { label: "วันที่", value: options.workDate },
        {
          label: "ผล",
          value: options.approved ? "อนุมัติ" : "ไม่อนุมัติ",
          valueColor: options.approved ? "#16A34A" : "#DC2626",
        },
        ...(options.note ? [{ label: "หมายเหตุ", value: options.note }] : []),
      ],
    })
  )
}
