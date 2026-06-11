import type { messagingApi } from "@line/bot-sdk"

import { announcementGuideFlex } from "@/lib/line/flex/menu-guide"

export function announcementAction(): messagingApi.Message[] {
  return [announcementGuideFlex()]
}
