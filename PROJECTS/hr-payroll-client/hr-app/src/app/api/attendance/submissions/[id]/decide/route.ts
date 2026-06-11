import { NextResponse, type NextRequest } from "next/server"

import { recordPayrollHours } from "@/lib/approval/payroll-ledger"
import { getCurrentEmployeeWithBranch, getManagedBranchId, isBranchManager, isHrOrAdmin } from "@/lib/auth/branch"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const caller = await getCurrentEmployeeWithBranch()
  if (!caller) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { id } = await context.params
  let body: { action?: "approve" | "reject"; note?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 })
  }

  if (body.action !== "approve" && body.action !== "reject") {
    return NextResponse.json({ error: "invalid action" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: row, error: fetchErr } = await supabase
    .from("hr_attendance_submissions")
    .select("*, hr_attendance(work_hours), hr_employees!employee_id(branch_id)")
    .eq("id", id)
    .maybeSingle()

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 })
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 })

  if (row.approval_status === "expired") {
    return NextResponse.json({ error: "คำขอหมดอายุแล้ว" }, { status: 400 })
  }

  const emp = Array.isArray(row.hr_employees) ? row.hr_employees[0] : row.hr_employees
  const branchId = (emp as { branch_id?: string })?.branch_id ?? null

  if (row.approval_status === "pending_manager") {
    if (!isBranchManager(caller.role) && !isHrOrAdmin(caller.role)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }
    if (isBranchManager(caller.role)) {
      const managed = await getManagedBranchId(caller.id)
      if (managed !== branchId) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 })
      }
    }

    if (body.action === "reject") {
      const { error } = await supabase
        .from("hr_attendance_submissions")
        .update({
          approval_status: "rejected",
          manager_decided_by: caller.id,
          manager_decided_at: new Date().toISOString(),
          decision_note: body.note?.trim() || null,
        })
        .eq("id", id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    const { error } = await supabase
      .from("hr_attendance_submissions")
      .update({
        approval_status: "pending_hr",
        manager_decided_by: caller.id,
        manager_decided_at: new Date().toISOString(),
      })
      .eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (row.approval_status === "pending_hr") {
    if (!isHrOrAdmin(caller.role)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    if (body.action === "reject") {
      const { error } = await supabase
        .from("hr_attendance_submissions")
        .update({
          approval_status: "rejected",
          hr_decided_by: caller.id,
          hr_decided_at: new Date().toISOString(),
          decision_note: body.note?.trim() || null,
        })
        .eq("id", id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    const att = Array.isArray(row.hr_attendance) ? row.hr_attendance[0] : row.hr_attendance
    const hours = Number((att as { work_hours?: number })?.work_hours ?? 0)

    const { error } = await supabase
      .from("hr_attendance_submissions")
      .update({
        approval_status: "approved",
        hr_decided_by: caller.id,
        hr_decided_at: new Date().toISOString(),
      })
      .eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await recordPayrollHours({
      employeeId: row.employee_id as string,
      branchId,
      workDate: row.work_date as string,
      hours,
      lineType: "regular",
      sourceType: "attendance_submission",
      sourceId: id,
    })

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "invalid state" }, { status: 400 })
}
