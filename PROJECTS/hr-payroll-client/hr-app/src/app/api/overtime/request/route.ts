import { NextResponse, type NextRequest } from "next/server"

import { getCurrentEmployee } from "@/lib/auth/session"
import {
  overtimeSubmitConfirmFlex,
  overtimeSubmitHrNotifyFlex,
} from "@/lib/line/flex/overtime-request"
import { notifyHr, pushToLineUser } from "@/lib/line/notify-hr"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const employee = await getCurrentEmployee()
  if (!employee || employee.status !== "active") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  let body: {
    workDate?: string
    startTime?: string
    endTime?: string
    reason?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 })
  }

  const workDate = body.workDate
  const startTime = body.startTime
  const endTime = body.endTime
  const reason = typeof body.reason === "string" ? body.reason.trim() : ""

  if (
    typeof workDate !== "string" ||
    typeof startTime !== "string" ||
    typeof endTime !== "string" ||
    reason.length < 5 ||
    endTime <= startTime
  ) {
    return NextResponse.json({ error: "invalid fields" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: row, error } = await supabase
    .from("hr_overtime_requests")
    .insert({
      employee_id: employee.id,
      work_date: workDate,
      start_time: startTime,
      end_time: endTime,
      reason,
      status: "pending",
    })
    .select("id")
    .single()

  if (error || !row) {
    return NextResponse.json({ error: error?.message ?? "insert failed" }, { status: 500 })
  }

  try {
    if (employee.line_user_id) {
      await pushToLineUser(employee.line_user_id, [
        overtimeSubmitConfirmFlex({
          employeeName: employee.name,
          workDate,
          startTime,
          endTime,
        }),
      ])
    }
    await notifyHr([
      overtimeSubmitHrNotifyFlex({
        employeeName: employee.name,
        department: employee.department,
        workDate,
        startTime,
        endTime,
        reason,
      }),
    ])
  } catch (lineError) {
    console.error("overtime LINE notify failed:", lineError)
  }

  return NextResponse.json({ id: row.id, status: "pending" })
}
