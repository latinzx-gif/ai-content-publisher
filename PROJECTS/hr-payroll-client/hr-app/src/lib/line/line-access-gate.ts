import type { messagingApi } from "@line/bot-sdk"

import {
  notRegisteredFlex,
  pendingApprovalFlex,
} from "@/lib/line/flex/menu-guide"
import { resolveLineEmployee } from "@/lib/line/resolve-line-employee"
import type { RichMenuPostbackAction } from "@/lib/line/types"

const OPEN_ACTIONS = new Set<RichMenuPostbackAction>([
  "contact_hr",
  "contact_hr_notify",
])

export async function lineAccessGateMessages(
  lineUserId: string | undefined,
  action: RichMenuPostbackAction
): Promise<messagingApi.Message[] | null> {
  if (OPEN_ACTIONS.has(action)) {
    return null
  }
  if (!lineUserId) {
    return [
      {
        type: "text",
        text: "ไม่สามารถระบุผู้ใช้ได้ กรุณาใช้เมนูจากแชทส่วนตัวกับ OA",
      },
    ]
  }

  const lookup = await resolveLineEmployee(lineUserId)
  if (lookup.state === "none") return [notRegisteredFlex()]
  if (lookup.state === "pending") return [pendingApprovalFlex()]
  return null
}
