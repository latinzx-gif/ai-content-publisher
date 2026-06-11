import { getAdminClient } from "@/lib/auth/admin-client"
import { getLineClient } from "@/lib/line/client"
import type { messagingApi } from "@line/bot-sdk"

const MULTICAST_LIMIT = 500

export async function notifyHr(
  messages: messagingApi.Message[]
): Promise<{ pushed: number }> {
  const groupId = process.env.HR_LINE_GROUP_ID
  const line = getLineClient()

  if (groupId) {
    await line.pushMessage({ to: groupId, messages })
    return { pushed: 1 }
  }

  const { data: hrRows, error } = await getAdminClient()
    .from("hr_employees")
    .select("line_user_id")
    .in("role", ["hr", "admin"])
    .eq("status", "active")
    .not("line_user_id", "is", null)

  if (error) throw error

  const targets = (hrRows ?? []).map((r) => r.line_user_id as string)
  if (targets.length === 0) {
    return { pushed: 0 }
  }

  let pushed = 0
  for (let i = 0; i < targets.length; i += MULTICAST_LIMIT) {
    const chunk = targets.slice(i, i + MULTICAST_LIMIT)
    await line.multicast({ to: chunk, messages })
    pushed += chunk.length
  }

  return { pushed }
}

export async function pushToLineUser(
  lineUserId: string,
  messages: messagingApi.Message[]
): Promise<void> {
  await getLineClient().pushMessage({ to: lineUserId, messages })
}
