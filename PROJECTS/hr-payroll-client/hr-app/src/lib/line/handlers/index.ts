import type { webhook } from "@line/bot-sdk"

import { getLineClient } from "@/lib/line/client"
import { welcomeFlex } from "@/lib/line/flex/menu-guide"
import { handleMessage } from "@/lib/line/handlers/message"
import { handlePostback } from "@/lib/line/handlers/postback"

async function handleFollow(event: webhook.FollowEvent): Promise<void> {
  if (!event.replyToken) {
    return
  }

  await getLineClient().replyMessage({
    replyToken: event.replyToken,
    messages: [welcomeFlex()],
  })
}

async function handleEvent(event: webhook.Event): Promise<void> {
  switch (event.type) {
    case "postback":
      return handlePostback(event)
    case "message":
      return handleMessage(event)
    case "follow":
      return handleFollow(event)
    default:
      return
  }
}

// A failing reply must never bubble up: the webhook still answers 200,
// otherwise LINE keeps retrying the whole batch.
export async function handleEvents(events: webhook.Event[]): Promise<void> {
  for (const event of events) {
    try {
      await handleEvent(event)
    } catch (error) {
      console.error("LINE event handler failed", {
        type: event.type,
        error,
      })
    }
  }
}
