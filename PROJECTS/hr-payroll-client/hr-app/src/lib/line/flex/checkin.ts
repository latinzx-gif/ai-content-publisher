import type { messagingApi } from "@line/bot-sdk"

import { flexMessage, simpleBubble } from "@/lib/line/flex/base"

// Check-in confirmation (T07, polished in T09).
export function checkinConfirmFlex({
  name,
  timeText,
  lateMinutes,
}: {
  name: string
  timeText: string
  lateMinutes: number
}): messagingApi.FlexMessage {
  const isLate = lateMinutes > 0

  return flexMessage(
    `เช็คอินสำเร็จ ${timeText}`,
    simpleBubble({
      title: isLate ? "⏰ เข้างานสำเร็จ (มาสาย)" : "✅ เข้างานสำเร็จ",
      accentColor: isLate ? "#F39C12" : "#06C755",
      rows: [
        { label: "พนักงาน", value: name },
        { label: "เวลา", value: `${timeText} น.` },
        {
          label: "สถานะ",
          value: isLate ? `สาย ${lateMinutes} นาที` : "ตรงเวลา",
          valueColor: isLate ? "#F39C12" : "#06C755",
        },
      ],
    })
  )
}
