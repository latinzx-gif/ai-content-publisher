import type { messagingApi } from "@line/bot-sdk"

import { documentGuideFlex } from "@/lib/line/flex/menu-guide"

export function documentAction(): messagingApi.Message[] {
  const base = process.env.NEXT_PUBLIC_BASE_URL
  const formUrl = base ? `${base}/liff/documents` : undefined
  return [documentGuideFlex(formUrl)]
}
