import type { messagingApi } from "@line/bot-sdk"

import { flexMessage, simpleBubble } from "@/lib/line/flex/base"

// Standalone late notice (T09). No caller yet — the T10 morning cron and
// HR alerts reuse this template.
export function lateReminderFlex({
  name,
  lateMinutes,
  dateText,
}: {
  name: string
  lateMinutes: number
  dateText?: string
}): messagingApi.FlexMessage {
  const rows = [
    { label: "พนักงาน", value: name },
    {
      label: "สถานะ",
      value: `สาย ${lateMinutes} นาที`,
      valueColor: "#F39C12",
    },
    ...(dateText ? [{ label: "วันที่", value: dateText }] : []),
  ]

  return flexMessage(
    `แจ้งเตือนมาสาย ${lateMinutes} นาที`,
    simpleBubble({
      title: "แจ้งเตือนมาสาย",
      accentColor: "#F39C12",
      rows,
    })
  )
}
