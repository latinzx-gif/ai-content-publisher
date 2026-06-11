#!/usr/bin/env node
import { createAssert } from "../test-helpers/assert.mjs"
import { cleanupE2eData, rest } from "../test-helpers/supabase-admin.mjs"
import "../test-helpers/env.mjs"

const { ok, summary } = createAssert("flow-announcements")

export async function runFlowAnnouncements() {
  await cleanupE2eData()

  const { data: row, error } = await rest("POST", "/rest/v1/hr_announcements", {
    title: "E2E Announcement",
    body: "Test broadcast body",
    target_type: "all",
    status: "sent",
    sent_at: new Date().toISOString(),
  })

  ok(!error && row?.length === 1, "insert announcement")
  ok(row[0].status === "sent", "status sent")

  return summary()
}
