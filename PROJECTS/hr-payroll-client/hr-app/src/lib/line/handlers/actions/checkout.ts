import type { messagingApi } from "@line/bot-sdk"

import { checkOut } from "@/lib/attendance/check-out"
import { formatIctTime } from "@/lib/attendance/late"
import { checkoutSummaryFlex } from "@/lib/line/flex/checkout"
import {
  alreadyCheckedOutFlex,
  checkoutGuideFlex,
  notCheckedInFlex,
  notRegisteredFlex,
  pendingApprovalFlex,
} from "@/lib/line/flex/menu-guide"
import type { ActionContext } from "@/lib/line/handlers/actions"

export function checkoutAction(): messagingApi.Message[] {
  return [checkoutGuideFlex()]
}

export async function checkoutConfirmAction(
  ctx: ActionContext
): Promise<messagingApi.Message[]> {
  if (!ctx.lineUserId) {
    return [
      {
        type: "text",
        text: "ไม่สามารถระบุผู้ใช้ได้ กรุณาเลิกงานจากแชทส่วนตัวกับ OA",
      },
    ]
  }

  const result = await checkOut({ lineUserId: ctx.lineUserId })

  switch (result.status) {
    case "success":
      return [
        checkoutSummaryFlex({
          name: result.employeeName,
          inText: formatIctTime(result.checkInAt),
          outText: formatIctTime(result.checkOutAt),
          workMinutes: result.workMinutes,
          overtimeMinutes: result.overtimeMinutes,
        }),
      ]
    case "not_checked_in":
      return [notCheckedInFlex()]
    case "already_checked_out":
      return [alreadyCheckedOutFlex(formatIctTime(result.checkOutAt))]
    case "pending_approval":
      return [pendingApprovalFlex()]
    case "not_registered":
      return [notRegisteredFlex()]
  }
}
