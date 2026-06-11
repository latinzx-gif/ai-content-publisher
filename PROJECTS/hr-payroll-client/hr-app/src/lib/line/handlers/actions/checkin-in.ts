import type { messagingApi } from "@line/bot-sdk"

import { checkinGuideFlex } from "@/lib/line/flex/menu-guide"

// Step 1 of check-in: guide card + location quick reply.
export function checkinInAction(): messagingApi.Message[] {
  return [
    {
      ...checkinGuideFlex(),
      quickReply: {
        items: [
          {
            type: "action",
            action: { type: "location", label: "📍 แชร์ตำแหน่ง" },
          },
        ],
      },
    },
  ]
}
