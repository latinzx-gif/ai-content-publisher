import type { messagingApi, webhook } from "@line/bot-sdk"

import { checkIn } from "@/lib/attendance/check-in"
import { formatIctTime } from "@/lib/attendance/late"
import { getLineClient } from "@/lib/line/client"
import { checkinConfirmFlex } from "@/lib/line/flex/checkin"
import {
  alreadyCheckedInFlex,
  menuHintFlex,
  notRegisteredFlex,
} from "@/lib/line/flex/menu-guide"

/** Free-text chat is off by default — Rich Menu + postback + location only. */
function isUserChatEnabled(): boolean {
  return process.env.LINE_USER_CHAT_ENABLED === "true"
}

async function checkinMessages(
  event: webhook.MessageEvent & { message: webhook.LocationMessageContent },
): Promise<messagingApi.Message[]> {
  const lineUserId =
    event.source?.type === "user" ? event.source.userId : undefined
  if (!lineUserId) {
    return [
      {
        type: "text",
        text: "ไม่สามารถระบุผู้ใช้ได้ กรุณาเช็คอินจากแชทส่วนตัวกับ OA",
      },
    ]
  }

  const result = await checkIn({
    lineUserId,
    location: {
      latitude: event.message.latitude,
      longitude: event.message.longitude,
      ...(event.message.address ? { address: event.message.address } : {}),
    },
  })

  switch (result.status) {
    case "success":
      return [
        checkinConfirmFlex({
          name: result.employeeName,
          timeText: formatIctTime(result.checkInAt),
          lateMinutes: result.lateMinutes,
        }),
      ]
    case "already_checked_in":
      return [alreadyCheckedInFlex(formatIctTime(result.checkInAt))]
    case "not_registered":
      return [notRegisteredFlex()]
  }
}

export async function handleMessage(
  event: webhook.MessageEvent
): Promise<void> {
  if (!event.replyToken) {
    return
  }

  if (event.message.type === "location") {
    const messages = await checkinMessages(
      event as webhook.MessageEvent & {
        message: webhook.LocationMessageContent
      }
    )
    await getLineClient().replyMessage({
      replyToken: event.replyToken,
      messages,
    })
    return
  }

  if (event.message.type !== "text") {
    return
  }

  if (!isUserChatEnabled()) {
    return
  }

  await getLineClient().replyMessage({
    replyToken: event.replyToken,
    messages: [menuHintFlex()],
  })
}
