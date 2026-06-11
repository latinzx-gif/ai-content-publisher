import type { messagingApi } from "@line/bot-sdk"

import { overtimeGuideFlex } from "@/lib/line/flex/menu-guide"

export function overtimeAction(): messagingApi.Message[] {
  return [overtimeGuideFlex()]
}
