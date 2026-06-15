import type { messagingApi } from "@line/bot-sdk"

import { checkStockGuideFlex } from "@/lib/line/flex/menu-guide"
import { isStockCommandEnabled, stockCommandDisabledMessage } from "@/lib/line/slash-commands"

export function checkStockAction(): messagingApi.Message[] {
  if (!isStockCommandEnabled()) {
    return [stockCommandDisabledMessage()]
  }
  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "")
  const stockUrl = base ? `${base}/admin/inventory/stock` : undefined
  const inboundUrl = base ? `${base}/portal/inbound` : undefined
  return [checkStockGuideFlex({ stockUrl, inboundUrl })]
}
