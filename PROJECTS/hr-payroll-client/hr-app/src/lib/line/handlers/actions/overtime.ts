import type { messagingApi } from "@line/bot-sdk"

import { overtimeGuideFlex } from "@/lib/line/flex/menu-guide"

export function overtimeAction(): messagingApi.Message[] {
  const base = process.env.NEXT_PUBLIC_BASE_URL
  const formUrl = base ? `${base}/liff/overtime` : undefined
  return [overtimeGuideFlex(formUrl)]
}
