import type { messagingApi } from "@line/bot-sdk"

import { checkoutGuideFlex } from "@/lib/line/flex/menu-guide"
import type { ActionContext } from "@/lib/line/handlers/actions"

function checkoutGuideWithLocationQuickReply(): messagingApi.Message {
  return {
    ...checkoutGuideFlex(),
    quickReply: {
      items: [
        {
          type: "action",
          action: { type: "location", label: "📍 แชร์ตำแหน่ง" },
        },
      ],
    },
  }
}

export function checkoutAction(): messagingApi.Message[] {
  return [checkoutGuideWithLocationQuickReply()]
}

/** Legacy postback — route to location share (geofence enforced on location message). */
export async function checkoutConfirmAction(
  ctx: ActionContext
): Promise<messagingApi.Message[]> {
  void ctx
  return checkoutAction()
}
