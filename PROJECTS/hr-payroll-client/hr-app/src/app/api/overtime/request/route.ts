import { NextResponse, type NextRequest } from "next/server"

import {
  getCurrentEmployeeWithBranch,
  getManagedBranchId,
  isBranchManager,
} from "@/lib/auth/branch"
import {
  overtimeSubmitConfirmFlex,
  overtimeSubmitHrNotifyFlex,
} from "@/lib/line/flex/overtime-request"
import { notifyHr, pushToLineUser } from "@/lib/line/notify-hr"
import { createClient } from "@/lib/supabase/server"

function otHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number)
  const [eh, em] = endTime.split(":").map(Number)
  return Math.max(0, eh + em / 60 - (sh + sm / 60))
}

export async function POST(request: NextRequest) {
  const caller = await getCurrentEmployeeWithBranch()
  if (!caller || !isBranchManager(caller.role)) {
    return NextResponse.json(
      { error: "เฉพาะ Branch Manager เท่านั้นที่ยื่น OT ได้" },
      { status: 403 }
    )
  }

  let body: {
    employeeId?: string
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

  const employeeId = body.employeeId
  const workDate = body.workDate
  const startTime = body.startTime
  const endTime = body.endTime
  const reason = typeof body.reason === "string" ? body.reason.trim() : ""

  if (
    typeof employeeId !== "string" ||
    typeof workDate !== "string" ||
    typeof startTime !== "string" ||
    typeof endTime !== "string" ||
    reason.length < 5 ||
    endTime <= startTime
  ) {
    return NextResponse.json({ error: "invalid fields" }, { status: 400 })
  }

  const managedBranch = await getManagedBranchId(caller.id)
  if (!managedBranch) {
    return NextResponse.json({ error: "ไม่พบสาขาที่ดูแล" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: target } = await supabase
    .from("hr_employees")
    .select("id, name, line_user_id, branch_id, department")
    .eq("id", employeeId)
    .maybeSingle()

  if (!target || target.branch_id !== managedBranch) {
    return NextResponse.json({ error: "พนักงานไม่อยู่ในสาขาที่ดูแล" }, { status: 403 })
  }

  const { data: row, error } = await supabase
    .from("hr_overtime_requests")
    .insert({
      employee_id: employeeId,
      work_date: workDate,
      start_time: startTime,
      end_time: endTime,
      reason,
      status: "pending",
      approval_status: "pending_hr",
      submitted_by: caller.id,
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (error || !row) {
    return NextResponse.json({ error: error?.message ?? "insert failed" }, { status: 500 })
  }

  try {
    if (target.line_user_id) {
      await pushToLineUser(target.line_user_id as string, [
        overtimeSubmitConfirmFlex({
          employeeName: target.name as string,
          workDate,
          startTime,
          endTime,
        }),
      ])
    }
    await notifyHr([
      overtimeSubmitHrNotifyFlex({
        employeeName: target.name as string,
        department: (target.department as string) ?? "—",
        workDate,
        startTime,
        endTime,
        reason,
      }),
    ])
  } catch (lineError) {
    console.error("overtime LINE notify failed:", lineError)
  }

  return NextResponse.json({
    id: row.id,
    approval_status: "pending_hr",
    hours: otHours(startTime, endTime),
  })
}
