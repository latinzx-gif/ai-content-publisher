import type { messagingApi } from "@line/bot-sdk"

import { submitDailyAttendance } from "@/lib/attendance/submit-daily"
import type { ActionContext } from "@/lib/line/handlers/actions"
import {
  notRegisteredFlex,
  pendingApprovalFlex,
} from "@/lib/line/flex/menu-guide"

export async function submitAttendanceAction(
  ctx: ActionContext
): Promise<messagingApi.Message[]> {
  if (!ctx.lineUserId) {
    return [{ type: "text", text: "ไม่สามารถระบุผู้ใช้ได้" }]
  }

  const result = await submitDailyAttendance({ lineUserId: ctx.lineUserId })

  switch (result.status) {
    case "success":
      return [{ type: "text", text: "บันทึกเวลาเรียบร้อยแล้ว" }]
    case "not_checked_in":
      return [{ type: "text", text: "ยังไม่มีการเช็คอินวันนี้" }]
    case "not_checked_out":
      return [{ type: "text", text: "กรุณาเช็คเอาท์ก่อนบันทึกเวลา" }]
    case "already_submitted":
      return [
        {
          type: "text",
          text: "บันทึกเวลาเรียบร้อยแล้ว ไม่ต้องยื่นซ้ำ",
        },
      ]
    case "pending_approval":
      return [pendingApprovalFlex()]
    case "not_registered":
      return [notRegisteredFlex()]
  }
}
