import { NextResponse, type NextRequest } from "next/server"
import type { messagingApi } from "@line/bot-sdk"

import { ANNOUNCEMENT_TARGET_TYPES } from "@/features/announcements/types"
import {
  announcementImagePublicUrl,
  isAllowedAnnouncementImage,
} from "@/lib/announcements/image"
import { uploadAnnouncementImage } from "@/lib/announcements/upload-image"
import { getAdminClient } from "@/lib/auth/admin-client"
import { canManageHr } from "@/lib/auth/roles"
import { getCurrentEmployee } from "@/lib/auth/session"
import { announcementBroadcastFlex } from "@/lib/line/flex/announcement-list"
import { getLineClient } from "@/lib/line/client"
import { createClient } from "@/lib/supabase/server"

const MULTICAST_LIMIT = 500

type CreatePayload = {
  title: string
  body: string
  targetType: string
  targetValue: string | null
  send: boolean
  schedule: boolean
  scheduledAt: Date | null
  imageFile: File | null
}

async function parseCreatePayload(request: NextRequest): Promise<CreatePayload | Response> {
  const contentType = request.headers.get("content-type") ?? ""

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData()
    const title = String(form.get("title") ?? "").trim()
    const body = String(form.get("body") ?? "").trim()
    const targetType = String(form.get("targetType") ?? "all")
    const targetValue = String(form.get("targetValue") ?? "").trim() || null
    const send = form.get("send") === "true"
    const schedule = form.get("schedule") === "true"
    const scheduledRaw = String(form.get("scheduledAt") ?? "").trim()
    const scheduledAt = scheduledRaw ? new Date(scheduledRaw) : null
    const imageField = form.get("image")
    const imageFile =
      imageField instanceof File && imageField.size > 0 ? imageField : null

    return { title, body, targetType, targetValue, send, schedule, scheduledAt, imageFile }
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

  return {
    title: typeof body.title === "string" ? body.title.trim() : "",
    body: typeof body.body === "string" ? body.body.trim() : "",
    targetType: body.targetType ?? "all",
    targetValue:
      typeof body.targetValue === "string" ? body.targetValue.trim() || null : null,
    send: body.send === true,
    schedule: body.schedule === true,
    scheduledAt:
      typeof body.scheduledAt === "string" && body.scheduledAt
        ? new Date(body.scheduledAt)
        : null,
    imageFile: null,
  }
}

export async function GET() {
  const caller = await getCurrentEmployee()
  if (!caller || !canManageHr(caller.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("hr_announcements")
    .select(
      "id, title, body, image_path, target_type, target_value, status, sent_at, scheduled_at, created_at"
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
  if (!caller || !canManageHr(caller.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const parsed = await parseCreatePayload(request)
  if (parsed instanceof Response) return parsed

  const {
    title,
    body: text,
    targetType,
    targetValue,
    send: shouldSend,
    schedule: shouldSchedule,
    scheduledAt,
    imageFile,
  } = parsed

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

  if (imageFile && !isAllowedAnnouncementImage(imageFile)) {
    return NextResponse.json(
      { error: "รูปภาพต้องเป็น JPEG, PNG, WebP หรือ GIF ไม่เกิน 5 MB" },
      { status: 400 }
    )
  }

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

  const supabase = await createClient()

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

  let imagePath: string | null = null
  if (imageFile) {
    try {
      imagePath = await uploadAnnouncementImage(supabase, row.id as string, imageFile)
      const { error: imageUpdateError } = await supabase
        .from("hr_announcements")
        .update({ image_path: imagePath })
        .eq("id", row.id)

      if (imageUpdateError) throw imageUpdateError
    } catch (uploadError) {
      await supabase.from("hr_announcements").delete().eq("id", row.id)
      const message =
        uploadError instanceof Error ? uploadError.message : "อัปโหลดรูปไม่สำเร็จ"
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }

  if (shouldSend) {
    try {
      await broadcastAnnouncement({
        title,
        body: text,
        targetType,
        targetValue,
        imagePath,
      })
    } catch (broadcastError) {
      console.error("announcement broadcast failed:", broadcastError)
      return NextResponse.json(
        { error: "broadcast failed", id: row.id },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ id: row.id, status, imagePath })
}

export { broadcastAnnouncement }

async function broadcastAnnouncement(options: {
  title: string
  body: string
  targetType: string
  targetValue: string | null
  imagePath?: string | null
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

  const imageUrl = announcementImagePublicUrl(options.imagePath)
  const messages: messagingApi.Message[] = []

  if (imageUrl) {
    messages.push({
      type: "image",
      originalContentUrl: imageUrl,
      previewImageUrl: imageUrl,
    })
  }

  messages.push(
    announcementBroadcastFlex({
      title: options.title,
      body: options.body,
      hasImage: Boolean(imageUrl),
    })
  )

  const line = getLineClient()
  for (let i = 0; i < targets.length; i += MULTICAST_LIMIT) {
    const chunk = targets.slice(i, i + MULTICAST_LIMIT)
    await line.multicast({ to: chunk, messages })
  }
}
