import type { messagingApi } from "@line/bot-sdk"

import { leaveGuideFlex } from "@/lib/line/flex/menu-guide"

export function leaveAction(): messagingApi.Message[] {
  const base = process.env.NEXT_PUBLIC_BASE_URL
  const formUrl = base ? `${base}/liff/leave` : undefined
  return [leaveGuideFlex(formUrl)]
}
