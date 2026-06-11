import type { messagingApi } from "@line/bot-sdk"

import { documentGuideFlex } from "@/lib/line/flex/menu-guide"

export function documentAction(): messagingApi.Message[] {
  return [documentGuideFlex()]
}
