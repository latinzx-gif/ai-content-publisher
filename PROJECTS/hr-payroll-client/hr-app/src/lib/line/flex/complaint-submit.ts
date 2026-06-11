import type { messagingApi } from "@line/bot-sdk"

import { BRAND_RED } from "@/lib/line/brand"
import { flexMessage, simpleBubble } from "@/lib/line/flex/base"

export function complaintSubmitConfirmFlex(options: {
  ticketCode: string
  isAnonymous: boolean
}): messagingApi.FlexMessage {
  return flexMessage(
    "รับเรื่องร้องเรียนแล้ว",
    simpleBubble({
      title: "รับเรื่องร้องเรียนแล้ว",
      accentColor: "#F57C00",
      rows: [
        { label: "เลขที่", value: options.ticketCode },
        {
          label: "โหมด",
          value: options.isAnonymous ? "ไม่เปิดเผยตัวตน" : "ระบุตัวตน",
        },
        { label: "สถานะ", value: "เปิดเรื่อง", valueColor: "#F59E0B" },
      ],
      footerNote: "เก็บเลขที่ไว้สำหรับติดตาม — HR จะตอบกลับทาง LINE",
    })
  )
}

export function complaintSubmitHrNotifyFlex(options: {
  ticketCode: string
  subject: string
  isAnonymous: boolean
  employeeName?: string
  adminUrl?: string
}): messagingApi.FlexMessage {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const adminUrl =
    options.adminUrl ?? (baseUrl ? `${baseUrl}/admin/complaints` : undefined)

  return flexMessage(
    `เรื่องร้องเรียนใหม่: ${options.ticketCode}`,
    simpleBubble({
      title: "เรื่องร้องเรียนใหม่",
      accentColor: BRAND_RED,
      rows: [
        { label: "เลขที่", value: options.ticketCode },
        { label: "หัวข้อ", value: options.subject },
        {
          label: "ผู้แจ้ง",
          value: options.isAnonymous
            ? "ไม่เปิดเผยตัวตน"
            : (options.employeeName ?? "—"),
        },
      ],
      button: adminUrl
        ? { label: "เปิดคิวร้องเรียน", uri: adminUrl }
        : undefined,
    })
  )
}

export function complaintReplyFlex(options: {
  ticketCode: string
  subject: string
  message: string
  closed: boolean
}): messagingApi.FlexMessage {
  return flexMessage(
    `ตอบกลับเรื่อง ${options.ticketCode}`,
    simpleBubble({
      title: "ตอบกลับจาก HR",
      accentColor: "#F57C00",
      rows: [
        { label: "เลขที่", value: options.ticketCode },
        { label: "หัวข้อ", value: options.subject },
        { label: "ข้อความ", value: options.message },
        {
          label: "สถานะ",
          value: options.closed ? "ปิดเรื่อง" : "ตอบแล้ว",
        },
      ],
    })
  )
}
