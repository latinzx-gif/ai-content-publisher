import type { messagingApi } from "@line/bot-sdk"

import { getAdminClient } from "@/lib/auth/admin-client"
import type { ActionContext } from "@/lib/line/handlers/actions"
import { notifyHr } from "@/lib/line/notify-hr"

export async function contactHrNotifyAction(
  ctx: ActionContext
): Promise<messagingApi.Message[]> {
  const lineUserId = ctx.lineUserId
  if (!lineUserId) {
    return [
      {
        type: "text",
        text: "ไม่สามารถระบุบัญชี LINE ได้ กรุณาลองใหม่อีกครั้ง",
      },
    ]
  }

  const { data: employee } = await getAdminClient()
    .from("hr_employees")
    .select("name, department, position")
    .eq("line_user_id", lineUserId)
    .maybeSingle()

  const name = employee?.name ?? "ไม่ทราบชื่อ"
  const department = employee?.department ?? "—"
  const position = employee?.position ?? "—"

  const { pushed } = await notifyHr([
    {
      type: "text",
      text: [
        "📩 คำขอติดต่อ HR",
        `ชื่อ: ${name}`,
        `แผนก: ${department}`,
        `ตำแหน่ง: ${position}`,
        `LINE ID: ${lineUserId}`,
        "",
        "กรุณาติดต่อกลับผ่าน OA",
      ].join("\n"),
    },
  ])

  if (pushed === 0) {
    return [
      {
        type: "text",
        text: "ขณะนี้ยังไม่ได้ตั้งค่ากลุ่ม HR — กรุณาแจ้งหัวหน้างานหรือ HR โดยตรง",
      },
    ]
  }

  return [
    {
      type: "text",
      text: "ส่งคำขอถึงทีม HR แล้ว — HR จะติดต่อกลับทางแชท LINE นี้",
    },
  ]
}
