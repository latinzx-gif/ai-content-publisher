import type { messagingApi } from "@line/bot-sdk"

import { flexMessage, simpleBubble } from "@/lib/line/flex/base"

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} ชม. ${m} นาที` : `${h} ชม.`
}

// Daily work summary after a successful check-out (T08, polished in T09).
// OT line is display-only — no pay calculation (Phase 1).
export function checkoutSummaryFlex({
  name,
  inText,
  outText,
  workMinutes,
  overtimeMinutes,
}: {
  name: string
  inText: string
  outText: string
  workMinutes: number
  overtimeMinutes: number
}): messagingApi.FlexMessage {
  return flexMessage(
    `เลิกงานสำเร็จ ${outText}`,
    simpleBubble({
      title: "🔴 เลิกงานสำเร็จ",
      accentColor: "#1E6FD9",
      rows: [
        { label: "พนักงาน", value: name },
        { label: "เข้างาน", value: `${inText} น.` },
        { label: "เลิกงาน", value: `${outText} น.` },
        { label: "รวมเวลา", value: formatDuration(workMinutes) },
      ],
      footerNote:
        overtimeMinutes > 0
          ? `เกินเวลามาตรฐาน ${formatDuration(overtimeMinutes)} — กดปุ่มด้านล่างยื่นสรุปวัน`
          : "กดปุ่มด้านล่างเพื่อยื่นสรุปวันให้หัวหน้าสาขาอนุมัติ (ภายใน 48 ชม.)",
      postbackButton: {
        label: "ยื่นสรุปวัน",
        data: "action=submit_attendance",
      },
    })
  )
}
