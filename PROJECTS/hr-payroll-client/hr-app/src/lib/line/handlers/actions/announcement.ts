import type { messagingApi } from "@line/bot-sdk"

import { getAdminClient } from "@/lib/auth/admin-client"
import { announcementListFlex } from "@/lib/line/flex/announcement-list"
import { announcementGuideFlex } from "@/lib/line/flex/menu-guide"

export async function announcementAction(): Promise<messagingApi.Message[]> {
  try {
    const { data, error } = await getAdminClient()
      .from("hr_announcements")
      .select("title, body, sent_at")
      .eq("status", "sent")
      .order("sent_at", { ascending: false })
      .limit(5)

    if (!error && data && data.length > 0) {
      return [
        announcementListFlex(
          data.map((row) => ({
            title: row.title as string,
            body: row.body as string,
            sentAt: (row.sent_at as string) ?? new Date().toISOString(),
          }))
        ),
      ]
    }
  } catch (err) {
    console.error("announcement list failed:", err)
  }

  return [announcementGuideFlex()]
}
