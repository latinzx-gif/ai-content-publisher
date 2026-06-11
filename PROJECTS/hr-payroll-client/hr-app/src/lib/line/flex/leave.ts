import type { messagingApi } from "@line/bot-sdk"

import { leaveGuideFlex } from "@/lib/line/flex/menu-guide"

/** @deprecated Use leaveGuideFlex — kept for existing imports */
export function leaveFlex(liffId?: string): messagingApi.FlexMessage {
  return leaveGuideFlex(liffId)
}
