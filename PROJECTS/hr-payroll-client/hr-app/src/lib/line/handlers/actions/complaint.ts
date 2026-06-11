import type { messagingApi } from "@line/bot-sdk"

import { complaintGuideFlex } from "@/lib/line/flex/menu-guide"

export function complaintAction(): messagingApi.Message[] {
  const base = process.env.NEXT_PUBLIC_BASE_URL
  const formUrl = base ? `${base}/liff/complaint` : undefined
  return [complaintGuideFlex(formUrl)]
}
