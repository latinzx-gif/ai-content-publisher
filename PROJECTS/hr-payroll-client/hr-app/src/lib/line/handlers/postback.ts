import type { messagingApi, webhook } from "@line/bot-sdk"

import { getLineClient } from "@/lib/line/client"
import { buildActionMessages } from "@/lib/line/handlers/actions"
import {
  handleRegistrationPostback,
  tryParseRegistrationPostback,
} from "@/lib/line/handlers/registration-postback"
import { lineAccessGateMessages } from "@/lib/line/line-access-gate"
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

  const lineUserId =
    event.source?.type === "user" ? event.source.userId : undefined

  const registration = tryParseRegistrationPostback(event.postback.data)
  const action = parsePostbackAction(event.postback.data)

  let messages: messagingApi.Message[]
  if (registration) {
    messages = await handleRegistrationPostback(
      registration.action,
      registration.employeeId,
      lineUserId
    )
  } else if (!action) {
    messages = [fallbackText()]
  } else {
    const blocked = await lineAccessGateMessages(lineUserId, action)
    messages = blocked ?? (await buildActionMessages(action, { lineUserId }))
  }

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
