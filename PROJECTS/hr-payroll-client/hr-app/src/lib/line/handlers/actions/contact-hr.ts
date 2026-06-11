import type { messagingApi } from "@line/bot-sdk"

import { contactHrGuideFlex } from "@/lib/line/flex/menu-guide"

export function contactHrAction(): messagingApi.Message[] {
  return [contactHrGuideFlex()]
}
