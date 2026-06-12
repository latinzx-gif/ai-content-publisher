import type { messagingApi } from "@line/bot-sdk"

import { inventoryGuideFlex } from "@/lib/line/flex/menu-guide"

export function inventoryAction(): messagingApi.Message[] {
  const base = process.env.NEXT_PUBLIC_BASE_URL
  const portalUrl = base ? `${base}/portal/inbound` : undefined
  return [inventoryGuideFlex(portalUrl)]
}
