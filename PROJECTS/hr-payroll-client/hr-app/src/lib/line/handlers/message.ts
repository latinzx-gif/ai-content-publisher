import type { messagingApi, webhook } from "@line/bot-sdk"

import { checkIn, type CheckInLocation } from "@/lib/attendance/check-in"
import { checkOut } from "@/lib/attendance/check-out"
import { formatIctTime } from "@/lib/attendance/late"
import { getLineTodayAttendanceState } from "@/lib/attendance/today-state"
import { getLineClient } from "@/lib/line/client"
import { checkinConfirmFlex } from "@/lib/line/flex/checkin"
import { checkoutSummaryFlex } from "@/lib/line/flex/checkout"
import {
  alreadyCheckedInFlex,
  alreadyCheckedOutFlex,
  menuHintFlex,
  notCheckedInFlex,
  notRegisteredFlex,
  outsideGeofenceFlex,
  pendingApprovalFlex,
} from "@/lib/line/flex/menu-guide"
import { buildActionMessages } from "@/lib/line/handlers/actions"
import { isOneOnOneUserSource } from "@/lib/line/handlers/source"
import {
  isStockCommandEnabled,
  parseSlashCommand,
  stockCommandDisabledMessage,
} from "@/lib/line/slash-commands"
import type { RichMenuPostbackAction } from "@/lib/line/types"

/** Free-text chat is off by default — Rich Menu + postback + location only. */
function isUserChatEnabled(): boolean {
  return process.env.LINE_USER_CHAT_ENABLED === "true"
}

function locationFromMessage(
  message: webhook.LocationMessageContent
): CheckInLocation {
  return {
    latitude: message.latitude,
    longitude: message.longitude,
    ...(message.address ? { address: message.address } : {}),
  }
}

function checkInMessages(result: Awaited<ReturnType<typeof checkIn>>): messagingApi.Message[] {
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
    case "outside_geofence":
      return [
        outsideGeofenceFlex({
          distanceM: result.distanceM,
          limitM: result.limitM,
        }),
      ]
    case "pending_approval":
      return [pendingApprovalFlex()]
    case "not_registered":
      return [notRegisteredFlex()]
  }
}

function checkOutMessages(result: Awaited<ReturnType<typeof checkOut>>): messagingApi.Message[] {
  switch (result.status) {
    case "success":
      return [
        checkoutSummaryFlex({
          name: result.employeeName,
          inText: formatIctTime(result.checkInAt),
          outText: formatIctTime(result.checkOutAt),
          workMinutes: result.workMinutes,
          overtimeMinutes: result.overtimeMinutes,
        }),
      ]
    case "already_checked_out":
      return [alreadyCheckedOutFlex(formatIctTime(result.checkOutAt))]
    case "outside_geofence":
      return [
        outsideGeofenceFlex({
          distanceM: result.distanceM,
          limitM: result.limitM,
        }),
      ]
    case "not_checked_in":
      return [notCheckedInFlex()]
    case "pending_approval":
      return [pendingApprovalFlex()]
    case "not_registered":
      return [notRegisteredFlex()]
  }
}

async function locationMessages(
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

  const location = locationFromMessage(event.message)
  const now = new Date()
  const today = await getLineTodayAttendanceState(lineUserId, now)

  switch (today.kind) {
    case "not_registered":
      return [notRegisteredFlex()]
    case "none": {
      const result = await checkIn({ lineUserId, location, now })
      return checkInMessages(result)
    }
    case "checked_in": {
      const result = await checkOut({ lineUserId, location, now })
      if (result.status === "not_checked_in") {
        return [alreadyCheckedInFlex(formatIctTime(today.checkInAt))]
      }
      return checkOutMessages(result)
    }
    case "checked_out":
      return [alreadyCheckedOutFlex(formatIctTime(today.checkOutAt))]
  }
}

export async function handleMessage(
  event: webhook.MessageEvent
): Promise<void> {
  if (!event.replyToken || !isOneOnOneUserSource(event.source)) {
    return
  }

  if (event.message.type === "location") {
    const messages = await locationMessages(
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

  const text = event.message.text.trim()
  const slashAction = parseSlashCommand(text)
  if (slashAction) {
    const lineUserId =
      event.source?.type === "user" ? event.source.userId : undefined
    if (
      (slashAction === "check_stock" || slashAction === "inventory") &&
      !isStockCommandEnabled()
    ) {
      await getLineClient().replyMessage({
        replyToken: event.replyToken,
        messages: [stockCommandDisabledMessage()],
      })
      return
    }
    const messages = await buildActionMessages(slashAction, { lineUserId })
    await getLineClient().replyMessage({
      replyToken: event.replyToken,
      messages,
    })
    return
  }

  if (!isUserChatEnabled()) {
    return
  }

  const textActions: Record<string, RichMenuPostbackAction> = {
    คลังสินค้า: "inventory",
    สแกนรับเข้า: "inventory",
    รับเข้า: "inventory",
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
