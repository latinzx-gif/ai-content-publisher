import { NextResponse, type NextRequest } from "next/server"

import { ANNOUNCEMENT_TARGET_TYPES } from "@/features/announcements/types"
import { getAdminClient } from "@/lib/auth/admin-client"
import { getCurrentEmployee } from "@/lib/auth/session"
import { announcementBroadcastFlex } from "@/lib/line/flex/announcement-list"
import { getLineClient } from "@/lib/line/client"
import { createClient } from "@/lib/supabase/server"

const MULTICAST_LIMIT = 500

export async function GET() {
  const caller = await getCurrentEmployee()
  if (!caller || (caller.role !== "hr" && caller.role !== "admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("hr_announcements")
    .select(
      "id, title, body, target_type, target_value, status, sent_at, scheduled_at, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ rows: data ?? [] })
}

export async function POST(request: NextRequest) {
  const caller = await getCurrentEmployee()
  if (!caller || (caller.role !== "hr" && caller.role !== "admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  let body: {
    title?: string
    body?: string
    targetType?: string
    targetValue?: string
    send?: boolean
    schedule?: boolean
    scheduledAt?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 })
  }

  const title = typeof body.title === "string" ? body.title.trim() : ""
  const text = typeof body.body === "string" ? body.body.trim() : ""
  const targetType = body.targetType ?? "all"
  const targetValue =
    typeof body.targetValue === "string" ? body.targetValue.trim() : null

  if (
    title.length < 3 ||
    text.length < 5 ||
    !ANNOUNCEMENT_TARGET_TYPES.includes(
      targetType as (typeof ANNOUNCEMENT_TARGET_TYPES)[number]
    )
  ) {
    return NextResponse.json({ error: "invalid fields" }, { status: 400 })
  }

  if (targetType === "department" && !targetValue) {
    return NextResponse.json({ error: "department required" }, { status: 400 })
  }

  const supabase = await createClient()
  const shouldSend = body.send === true
  const shouldSchedule = body.schedule === true
  const scheduledAt =
    typeof body.scheduledAt === "string" && body.scheduledAt
      ? new Date(body.scheduledAt)
      : null

  if (shouldSchedule) {
    if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
      return NextResponse.json({ error: "invalid schedule time" }, { status: 400 })
    }
    if (scheduledAt.getTime() <= Date.now()) {
      return NextResponse.json({ error: "schedule must be future" }, { status: 400 })
    }
  }

  let status: "draft" | "scheduled" | "sent" = "draft"
  if (shouldSend) status = "sent"
  else if (shouldSchedule) status = "scheduled"

  const { data: row, error } = await supabase
    .from("hr_announcements")
    .insert({
      title,
      body: text,
      target_type: targetType,
      target_value: targetType === "department" ? targetValue : null,
      status,
      sent_at: shouldSend ? new Date().toISOString() : null,
      scheduled_at: shouldSchedule && scheduledAt ? scheduledAt.toISOString() : null,
      created_by: caller.id,
    })
    .select("id")
    .single()

  if (error || !row) {
    return NextResponse.json({ error: error?.message ?? "insert failed" }, { status: 500 })
  }

  if (shouldSend) {
    try {
      await broadcastAnnouncement({ title, body: text, targetType, targetValue })
    } catch (broadcastError) {
      console.error("announcement broadcast failed:", broadcastError)
      return NextResponse.json(
        { error: "broadcast failed", id: row.id },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ id: row.id, status })
}

export { broadcastAnnouncement }

async function broadcastAnnouncement(options: {
  title: string
  body: string
  targetType: string
  targetValue: string | null
}) {
  const admin = getAdminClient()
  let query = admin
    .from("hr_employees")
    .select("line_user_id")
    .eq("status", "active")
    .not("line_user_id", "is", null)

  if (options.targetType === "department" && options.targetValue) {
    query = query.eq("department", options.targetValue)
  }

  const { data: rows, error } = await query
  if (error) throw error

  const targets = (rows ?? []).map((r) => r.line_user_id as string)
  if (targets.length === 0) return

  const messages = [
    announcementBroadcastFlex({
      title: options.title,
      body: options.body,
    }),
  ]

  const line = getLineClient()
  for (let i = 0; i < targets.length; i += MULTICAST_LIMIT) {
    const chunk = targets.slice(i, i + MULTICAST_LIMIT)
    await line.multicast({ to: chunk, messages })
  }
}
