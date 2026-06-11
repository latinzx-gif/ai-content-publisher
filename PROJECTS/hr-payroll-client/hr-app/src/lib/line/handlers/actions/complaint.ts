import type { messagingApi } from "@line/bot-sdk"

import { complaintGuideFlex } from "@/lib/line/flex/menu-guide"

export function complaintAction(): messagingApi.Message[] {
  return [complaintGuideFlex()]
}
