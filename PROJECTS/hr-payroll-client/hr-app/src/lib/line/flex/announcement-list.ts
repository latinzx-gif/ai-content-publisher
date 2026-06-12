import type { messagingApi } from "@line/bot-sdk"

import { formatThaiDate } from "@/lib/datetime/thailand"
import { flexMessage, simpleBubble } from "@/lib/line/flex/base"

const LINE_BODY_MAX = 1200

function announcementBodyLines(body: string): string[] {
  const text =
    body.length > LINE_BODY_MAX ? `${body.slice(0, LINE_BODY_MAX - 1)}…` : body
  const lines = text.split(/\r?\n/)
  return lines.length > 0 ? lines : [text]
}

export function announcementBroadcastFlex(options: {
  title: string
  body: string
  hasImage?: boolean
}): messagingApi.FlexMessage {
  return flexMessage(
    `ประกาศ: ${options.title}`,
    simpleBubble({
      title: options.title,
      accentColor: "#00897B",
      lines: announcementBodyLines(options.body),
      footerNote: options.hasImage ? "ประกาศจาก HR (มีรูปแนบด้านล่าง)" : "ประกาศจาก HR",
      wide: true,
    })
  )
}

export function announcementListFlex(
  items: { title: string; body: string; sentAt: string }[]
): messagingApi.FlexMessage {
  if (items.length === 0) {
    return flexMessage(
      "ไม่มีประกาศ",
      simpleBubble({
        title: "ประกาศบริษัท",
        accentColor: "#00897B",
        rows: [{ label: "สถานะ", value: "ยังไม่มีประกาศล่าสุด" }],
        footerNote: "เมื่อ HR ส่งประกาศ จะแจ้งทาง LINE นี้โดยอัตโนมัติ",
      })
    )
  }

  const latest = items[0]
  const date = formatThaiDate(latest.sentAt, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  const rows = [
    { label: "ล่าสุด", value: latest.title },
    { label: "วันที่", value: date },
    {
      label: "รายละเอียด",
      value:
        latest.body.length > 120
          ? `${latest.body.slice(0, 117)}...`
          : latest.body,
    },
  ]

  if (items.length > 1) {
    rows.push({ label: "เพิ่มเติม", value: `อีก ${items.length - 1} ประกาศ` })
  }

  return flexMessage(
    "ประกาศล่าสุด",
    simpleBubble({
      title: "ประกาศบริษัท",
      accentColor: "#00897B",
      rows,
      footerNote: "ดูประกาศเพิ่มเติมได้ที่ HR Admin",
    })
  )
}
