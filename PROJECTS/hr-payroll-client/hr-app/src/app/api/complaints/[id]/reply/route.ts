import { NextResponse, type NextRequest } from "next/server"

import { canManageHr } from "@/lib/auth/roles"
import { getCurrentEmployee } from "@/lib/auth/session"
import { coerceLocale } from "@/lib/i18n/types"
import { t } from "@/lib/i18n/translate"
import { complaintReplyFlex } from "@/lib/line/flex/complaint-submit"
import { pushToLineUser } from "@/lib/line/notify-hr"
import { createClient } from "@/lib/supabase/server"

type ReplyBody = {
  message?: string
  close?: boolean
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const caller = await getCurrentEmployee()
  if (!caller || !canManageHr(caller.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const { id } = await context.params
  let body: ReplyBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 })
  }

  const rawMessage = typeof body.message === "string" ? body.message.trim() : ""
  const supabase = await createClient()
  const { data: complaint, error: fetchError } = await supabase
    .from("hr_complaints")
    .select(
      "id, ticket_code, subject, is_anonymous, status, employee_id, hr_employees(line_user_id, preferred_locale)"
    )
    .eq("id", id)
    .maybeSingle()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }
  if (!complaint) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  type EmpJoin = { line_user_id: string | null; preferred_locale?: unknown }
  const empRaw = complaint.hr_employees as EmpJoin | EmpJoin[] | null
  const emp = empRaw ? (Array.isArray(empRaw) ? empRaw[0] : empRaw) : null
  const locale = coerceLocale(emp?.preferred_locale)
  const message =
    rawMessage.length >= 3
      ? rawMessage
      : body.close
        ? t("line.complaintReply.defaultCloseMessage", locale)
        : ""
  if (message.length < 3) {
    return NextResponse.json({ error: "message required" }, { status: 400 })
  }

  const { error: replyError } = await supabase.from("hr_complaint_replies").insert({
    complaint_id: id,
    author_employee_id: caller.id,
    message,
  })

  if (replyError) {
    return NextResponse.json({ error: replyError.message }, { status: 500 })
  }

  const newStatus = body.close ? "closed" : "replied"
  await supabase
    .from("hr_complaints")
    .update({ status: newStatus })
    .eq("id", id)

  if (!complaint.is_anonymous && complaint.employee_id) {
    try {
      if (emp?.line_user_id) {
        await pushToLineUser(emp.line_user_id, [
          complaintReplyFlex({
            ticketCode: complaint.ticket_code,
            subject: complaint.subject,
            message,
            closed: body.close === true,
            locale,
          }),
        ])
      }
    } catch (lineError) {
      console.error("complaint reply LINE notify failed:", lineError)
    }
  }

  return NextResponse.json({ id, status: newStatus })
}
