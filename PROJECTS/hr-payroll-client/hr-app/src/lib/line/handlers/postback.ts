import type { messagingApi, webhook } from "@line/bot-sdk"

import { getLineClient } from "@/lib/line/client"
import { buildActionMessages } from "@/lib/line/handlers/actions"
import { parsePostbackAction } from "@/lib/line/types"

function fallbackText(): messagingApi.Message {
  return {
    type: "text",
    text: "ขออภัย ไม่รู้จักเมนูนี้ กรุณาลองใหม่จากเมนูด้านล่าง",
  }
}

export async function handlePostback(
  event: webhook.PostbackEvent
): Promise<void> {
  if (!event.replyToken) {
    return
  }

  const action = parsePostbackAction(event.postback.data)
  const lineUserId =
    event.source?.type === "user" ? event.source.userId : undefined
  const messages = action
    ? await buildActionMessages(action, { lineUserId })
    : [fallbackText()]

  try {
    await getLineClient().replyMessage({
      replyToken: event.replyToken,
      messages,
    })
  } catch (error) {
    // Re-throw with the routed action so handleEvents logs useful context.
    throw new Error(`postback reply failed (action=${action ?? "unknown"})`, {
      cause: error,
    })
  }
}
