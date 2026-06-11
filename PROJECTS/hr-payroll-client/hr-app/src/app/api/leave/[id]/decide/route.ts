import { NextResponse, type NextRequest } from "next/server"

import { countLeaveDays, type LeaveType } from "@/features/leave/types"
import { getCurrentEmployee } from "@/lib/auth/session"
import {
  leaveApprovedFlex,
  leaveRejectedFlex,
} from "@/lib/line/flex/leave-result"
import { pushToLineUser } from "@/lib/line/notify-hr"
import { createClient } from "@/lib/supabase/server"

type DecideBody = {
  action?: "approve" | "reject"
  note?: string
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const caller = await getCurrentEmployee()
  if (!caller || (caller.role !== "hr" && caller.role !== "admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const { id } = await context.params
  let body: DecideBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 })
  }

  if (body.action !== "approve" && body.action !== "reject") {
    return NextResponse.json({ error: "invalid action" }, { status: 400 })
  }

  const note = typeof body.note === "string" ? body.note.trim() : ""
  if (body.action === "reject" && note.length < 3) {
    return NextResponse.json({ error: "reject reason required" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: leave, error: fetchError } = await supabase
    .from("hr_leaves")
    .select(
      "id, employee_id, type, start_date, end_date, status, hr_employees(line_user_id, name)"
    )
    .eq("id", id)
    .maybeSingle()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }
  if (!leave) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }
  if (leave.status !== "pending") {
    return NextResponse.json({ error: "already decided" }, { status: 409 })
  }

  const employeeJoin = Array.isArray(leave.hr_employees)
    ? leave.hr_employees[0]
    : leave.hr_employees
  const lineUserId = employeeJoin?.line_user_id as string | null | undefined
  const leaveType = leave.type as LeaveType
  const days = countLeaveDays(leave.start_date, leave.end_date) ?? 0

  const newStatus = body.action === "approve" ? "approved" : "rejected"
  const { error: updateError } = await supabase
    .from("hr_leaves")
    .update({
      status: newStatus,
      approved_by: caller.id,
      decision_note: note || null,
    })
    .eq("id", id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  let remainingDays: number | null = null

  if (body.action === "approve" && days > 0) {
    const { data: balance } = await supabase
      .from("hr_leave_balances")
      .select("used_days, total_days")
      .eq("employee_id", leave.employee_id)
      .eq("leave_type", leave.type)
      .maybeSingle()

    if (balance) {
      const nextUsed = Number(balance.used_days) + days
      await supabase
        .from("hr_leave_balances")
        .update({ used_days: nextUsed })
        .eq("employee_id", leave.employee_id)
        .eq("leave_type", leave.type)
      remainingDays = Number(balance.total_days) - nextUsed
    }
  }

  if (lineUserId) {
    try {
      if (body.action === "approve") {
        await pushToLineUser(lineUserId, [
          leaveApprovedFlex({
            type: leaveType,
            startDate: leave.start_date,
            endDate: leave.end_date,
            remainingDays,
            note: note || null,
          }),
        ])
      } else {
        await pushToLineUser(lineUserId, [
          leaveRejectedFlex({
            type: leaveType,
            startDate: leave.start_date,
            endDate: leave.end_date,
            reason: note,
          }),
        ])
      }
    } catch (lineError) {
      console.error("leave decide LINE notify failed:", lineError)
    }
  }

  return NextResponse.json({ id, status: newStatus })
}
