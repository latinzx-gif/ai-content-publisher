import { NextResponse, type NextRequest } from "next/server"

import {
  canRequestLeave,
  insufficientBalanceMessage,
  snapshotFromRow,
} from "@/features/leave/balance"
import {
  countLeaveDays,
  LEAVE_TYPES,
  type LeaveType,
} from "@/features/leave/types"
import { getCurrentEmployee } from "@/lib/auth/session"
import {
  leaveSubmitConfirmFlex,
  leaveSubmitHrNotifyFlex,
} from "@/lib/line/flex/leave-request"
import { notifyHr, pushToLineUser } from "@/lib/line/notify-hr"
import { createClient } from "@/lib/supabase/server"

const MAX_FILE_BYTES = 5 * 1024 * 1024
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"]

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120)
}

export async function POST(request: NextRequest) {
  const employee = await getCurrentEmployee()
  if (!employee || employee.status !== "active") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const form = await request.formData()
  const type = form.get("type")
  const startDate = form.get("startDate")
  const endDate = form.get("endDate")
  const reason = form.get("reason")
  const file = form.get("attachment")

  if (
    typeof type !== "string" ||
    !LEAVE_TYPES.includes(type as LeaveType) ||
    typeof startDate !== "string" ||
    typeof endDate !== "string" ||
    typeof reason !== "string" ||
    reason.trim().length < 5
  ) {
    return NextResponse.json({ error: "invalid fields" }, { status: 400 })
  }

  const days = countLeaveDays(startDate, endDate)
  if (days === null || days < 1) {
    return NextResponse.json({ error: "invalid date range" }, { status: 400 })
  }

  if (file instanceof File && file.size > 0) {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "invalid file type" }, { status: 400 })
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "file too large" }, { status: 400 })
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { data: balanceRow, error: balanceError } = await supabase
    .from("hr_leave_balances")
    .select("total_days, used_days")
    .eq("employee_id", employee.id)
    .eq("leave_type", type)
    .maybeSingle()

  if (balanceError) {
    return NextResponse.json({ error: balanceError.message }, { status: 500 })
  }
  if (!balanceRow) {
    return NextResponse.json(
      {
        error: "no_balance",
        message: "ไม่พบยอดลาสำหรับประเภทนี้ กรุณาติดต่อ HR",
      },
      { status: 400 }
    )
  }

  const balance = snapshotFromRow(balanceRow)
  if (!canRequestLeave(balance.remaining, days)) {
    return NextResponse.json(
      {
        error: "insufficient_balance",
        message: insufficientBalanceMessage(balance.remaining, days),
      },
      { status: 400 }
    )
  }

  const { data: leave, error: insertError } = await supabase
    .from("hr_leaves")
    .insert({
      employee_id: employee.id,
      type,
      start_date: startDate,
      end_date: endDate,
      reason: reason.trim(),
      status: "pending",
    })
    .select("id")
    .single()

  if (insertError || !leave) {
    return NextResponse.json(
      { error: insertError?.message ?? "insert failed" },
      { status: 500 }
    )
  }

  let attachmentPath: string | null = null
  if (file instanceof File && file.size > 0) {
    const path = `${user.id}/${leave.id}/${sanitizeFilename(file.name)}`
    const { error: uploadError } = await supabase.storage
      .from("leave-attachments")
      .upload(path, file, { contentType: file.type, upsert: false })

    if (uploadError) {
      await supabase.from("hr_leaves").delete().eq("id", leave.id)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    attachmentPath = path
    await supabase
      .from("hr_leaves")
      .update({ attachment_url: path })
      .eq("id", leave.id)
  }

  const leaveType = type as LeaveType

  try {
    if (employee.line_user_id) {
      await pushToLineUser(employee.line_user_id, [
        leaveSubmitConfirmFlex({
          employeeName: employee.name,
          type: leaveType,
          startDate,
          endDate,
          balanceRemaining: balance.remaining,
        }),
      ])
    }

    await notifyHr([
      leaveSubmitHrNotifyFlex({
        employeeName: employee.name,
        department: employee.department,
        type: leaveType,
        startDate,
        endDate,
        reason: reason.trim(),
      }),
    ])
  } catch (lineError) {
    console.error("leave request LINE notify failed:", lineError)
  }

  return NextResponse.json({
    id: leave.id,
    status: "pending",
    days,
    attachment_url: attachmentPath,
    balance,
  })
}
