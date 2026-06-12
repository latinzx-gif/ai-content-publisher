import type { messagingApi, webhook } from "@line/bot-sdk"

import { checkIn } from "@/lib/attendance/check-in"
import { formatIctTime } from "@/lib/attendance/late"
import { getLineClient } from "@/lib/line/client"
import { checkinConfirmFlex } from "@/lib/line/flex/checkin"
import {
  alreadyCheckedInFlex,
  menuHintFlex,
  notRegisteredFlex,
  pendingApprovalFlex,
} from "@/lib/line/flex/menu-guide"
import { buildActionMessages } from "@/lib/line/handlers/actions"
import { isOneOnOneUserSource } from "@/lib/line/handlers/source"
import type { RichMenuPostbackAction } from "@/lib/line/types"

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
    case "pending_approval":
      return [pendingApprovalFlex()]
    case "not_registered":
      return [notRegisteredFlex()]
  }
}

export async function handleMessage(
  event: webhook.MessageEvent
): Promise<void> {
  if (!event.replyToken || !isOneOnOneUserSource(event.source)) {
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

  const text = event.message.text.trim()
  const textActions: Record<string, RichMenuPostbackAction> = {
    ประกาศ: "announcement",
    ขอเอกสาร: "document",
    เอกสาร: "document",
    ร้องเรียน: "complaint",
    ลา: "leave",
    ot: "overtime",
    ขอot: "overtime",
    เช็คอิน: "checkin",
    "ติดต่อ hr": "contact_hr",
    ติดต่อhr: "contact_hr",
  }
  const action = textActions[text.toLowerCase()] ?? textActions[text]

  if (action) {
    const lineUserId =
      event.source?.type === "user" ? event.source.userId : undefined
    const messages = await buildActionMessages(action, { lineUserId })
    await getLineClient().replyMessage({
      replyToken: event.replyToken,
      messages,
    })
    return
  }

  await getLineClient().replyMessage({
    replyToken: event.replyToken,
    messages: [menuHintFlex()],
  })
}
