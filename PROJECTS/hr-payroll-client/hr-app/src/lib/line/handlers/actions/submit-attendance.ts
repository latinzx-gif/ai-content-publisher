import type { messagingApi } from "@line/bot-sdk"

import { submitDailyAttendance } from "@/lib/attendance/submit-daily"
import type { ActionContext } from "@/lib/line/handlers/actions"
import {
  notRegisteredFlex,
  pendingApprovalFlex,
} from "@/lib/line/flex/menu-guide"
import { formatThaiDateTime } from "@/lib/datetime/thailand"
import { notifyBranchManager } from "@/lib/line/notify-branch-manager"

export async function submitAttendanceAction(
  ctx: ActionContext
): Promise<messagingApi.Message[]> {
  if (!ctx.lineUserId) {
    return [{ type: "text", text: "ไม่สามารถระบุผู้ใช้ได้" }]
  }

  const result = await submitDailyAttendance({ lineUserId: ctx.lineUserId })

  switch (result.status) {
    case "success": {
      await notifyBranchManager({
        employeeId: result.employeeId,
        kind: "attendance",
        employeeName: result.employeeName,
      }).catch((err) => console.error("LINE submit attendance BM notify:", err))
      return [
        {
          type: "text",
          text: `ยื่นสรุปวันแล้ว — รอ Branch Manager อนุมัติภายใน 48 ชม.\nหมดเขต: ${formatThaiDateTime(result.expiresAt)}`,
        },
      ]
    }
    case "not_checked_in":
      return [{ type: "text", text: "ยังไม่มีการเช็คอินวันนี้" }]
    case "not_checked_out":
      return [{ type: "text", text: "กรุณาเช็คเอาท์ก่อนยื่นสรุปวัน" }]
    case "already_submitted":
      return [{ type: "text", text: "ยื่นสรุปวันนี้แล้ว — รอการอนุมัติ" }]
    case "pending_approval":
      return [pendingApprovalFlex()]
    case "not_registered":
      return [notRegisteredFlex()]
  }
}
