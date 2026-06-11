import { NextResponse, type NextRequest } from "next/server"

import { recordPayrollHours } from "@/lib/approval/payroll-ledger"
import { getCurrentEmployeeWithBranch, isHrOrAdmin } from "@/lib/auth/branch"
import { overtimeResultFlex } from "@/lib/line/flex/overtime-request"
import { pushToLineUser } from "@/lib/line/notify-hr"
import { createClient } from "@/lib/supabase/server"

type DecideBody = {
  action?: "approve" | "reject"
  note?: string
}

function otHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number)
  const [eh, em] = endTime.split(":").map(Number)
  return Math.max(0, eh + em / 60 - (sh + sm / 60))
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const caller = await getCurrentEmployeeWithBranch()
  if (!caller || !isHrOrAdmin(caller.role)) {
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

  const status = body.action === "approve" ? "approved" : "rejected"
  const supabase = await createClient()

  const { data: ot, error: fetchError } = await supabase
    .from("hr_overtime_requests")
    .select(
      "id, work_date, start_time, end_time, approval_status, employee_id, hr_employees!employee_id(line_user_id, branch_id)"
    )
    .eq("id", id)
    .maybeSingle()

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })
  if (!ot) return NextResponse.json({ error: "not found" }, { status: 404 })
  if (ot.approval_status !== "pending_hr") {
    return NextResponse.json({ error: "already decided" }, { status: 409 })
  }

  const { error: updateError } = await supabase
    .from("hr_overtime_requests")
    .update({
      status,
      approval_status: status,
      decision_note: note || null,
      hr_decided_by: caller.id,
      hr_decided_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  if (status === "approved") {
    const emp = Array.isArray(ot.hr_employees) ? ot.hr_employees[0] : ot.hr_employees
    const hours = otHours(String(ot.start_time), String(ot.end_time))
    await recordPayrollHours({
      employeeId: ot.employee_id as string,
      branchId: (emp as { branch_id?: string })?.branch_id ?? null,
      workDate: ot.work_date as string,
      hours,
      lineType: "overtime",
      sourceType: "overtime",
      sourceId: id,
    })
  }

  type Emp = { line_user_id: string | null }
  const empRaw = ot.hr_employees as Emp | Emp[]
  const emp = Array.isArray(empRaw) ? empRaw[0] : empRaw

  try {
    if (emp?.line_user_id) {
      await pushToLineUser(emp.line_user_id, [
        overtimeResultFlex({
          workDate: ot.work_date as string,
          approved: status === "approved",
          note: note || undefined,
        }),
      ])
    }
  } catch (lineError) {
    console.error("overtime decide LINE notify failed:", lineError)
  }

  return NextResponse.json({ id, status })
}
