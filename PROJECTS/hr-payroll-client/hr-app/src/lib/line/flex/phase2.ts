import type { messagingApi } from "@line/bot-sdk"

import {
  announcementGuideFlex,
  complaintGuideFlex,
  documentGuideFlex,
} from "@/lib/line/flex/menu-guide"

/** @deprecated Use *GuideFlex — kept for existing imports */
export function phase2Flex(title: string): messagingApi.FlexMessage {
  switch (title) {
    case "ขอเอกสาร":
      return documentGuideFlex()
    case "ร้องเรียน":
      return complaintGuideFlex()
    case "ประกาศ":
      return announcementGuideFlex()
    default:
      return documentGuideFlex()
  }
}
