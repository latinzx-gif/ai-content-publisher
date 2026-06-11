import type { messagingApi } from "@line/bot-sdk"

import {
  DOC_STATUS_LABELS,
  DOC_TYPE_LABELS,
  type DocStatus,
  type DocType,
} from "@/features/documents/types"
import { BRAND_RED } from "@/lib/line/brand"
import { flexMessage, simpleBubble } from "@/lib/line/flex/base"

export function documentSubmitConfirmFlex(options: {
  employeeName: string
  docType: DocType
  copies: number
}): messagingApi.FlexMessage {
  return flexMessage(
    "ส่งคำขอเอกสารแล้ว",
    simpleBubble({
      title: "ส่งคำขอเอกสารแล้ว",
      accentColor: "#7B1FA2",
      rows: [
        { label: "พนักงาน", value: options.employeeName },
        { label: "ประเภท", value: DOC_TYPE_LABELS[options.docType] },
        { label: "จำนวนชุด", value: `${options.copies} ชุด` },
        { label: "สถานะ", value: "รอดำเนินการ", valueColor: "#F59E0B" },
      ],
      footerNote: "HR จะแจ้งเมื่อเอกสารพร้อมรับ",
    })
  )
}

export function documentSubmitHrNotifyFlex(options: {
  employeeName: string
  department: string | null
  docType: DocType
  copies: number
  purpose: string
  adminUrl?: string
}): messagingApi.FlexMessage {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const adminUrl =
    options.adminUrl ?? (baseUrl ? `${baseUrl}/admin/documents` : undefined)

  return flexMessage(
    `คำขอเอกสารใหม่: ${options.employeeName}`,
    simpleBubble({
      title: "คำขอเอกสารใหม่",
      accentColor: BRAND_RED,
      rows: [
        { label: "พนักงาน", value: options.employeeName },
        { label: "แผนก", value: options.department ?? "—" },
        { label: "ประเภท", value: DOC_TYPE_LABELS[options.docType] },
        { label: "จำนวน", value: `${options.copies} ชุด` },
        { label: "วัตถุประสงค์", value: options.purpose },
      ],
      button: adminUrl
        ? { label: "เปิดคิวเอกสาร", uri: adminUrl }
        : undefined,
    })
  )
}

export function documentStatusFlex(options: {
  docType: string
  status: DocStatus
  note?: string
}): messagingApi.FlexMessage {
  const typeLabel =
    DOC_TYPE_LABELS[options.docType as DocType] ?? options.docType
  const statusLabel = DOC_STATUS_LABELS[options.status]

  return flexMessage(
    `อัปเดตคำขอเอกสาร: ${statusLabel}`,
    simpleBubble({
      title: "อัปเดตคำขอเอกสาร",
      accentColor: "#7B1FA2",
      rows: [
        { label: "ประเภท", value: typeLabel },
        { label: "สถานะ", value: statusLabel },
        ...(options.note ? [{ label: "หมายเหตุ", value: options.note }] : []),
      ],
      footerNote:
        options.status === "ready"
          ? "กรุณาติดต่อ HR เพื่อรับเอกสาร"
          : undefined,
    })
  )
}
