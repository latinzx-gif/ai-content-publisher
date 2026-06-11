import type { messagingApi } from "@line/bot-sdk"

import { leaveGuideFlex } from "@/lib/line/flex/menu-guide"

export function leaveAction(): messagingApi.Message[] {
  return [leaveGuideFlex(process.env.NEXT_PUBLIC_LINE_LIFF_ID)]
}
