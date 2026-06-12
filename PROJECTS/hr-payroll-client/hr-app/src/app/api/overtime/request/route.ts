import { NextResponse, type NextRequest } from "next/server"

import { expiresAtFrom } from "@/lib/approval/types"
import {
  getCurrentEmployeeWithBranch,
  getManagedBranchId,
  isBranchManager,
} from "@/lib/auth/branch"
import { getCurrentEmployee } from "@/lib/auth/session"
import {
  overtimeSubmitConfirmFlex,
  overtimeSubmitHrNotifyFlex,
} from "@/lib/line/flex/overtime-request"
import { notifyBranchManager } from "@/lib/line/notify-branch-manager"
import { notifyHr, pushToLineUser } from "@/lib/line/notify-hr"
import { createClient } from "@/lib/supabase/server"

function otHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number)
  const [eh, em] = endTime.split(":").map(Number)
  return Math.max(0, eh + em / 60 - (sh + sm / 60))
}

export async function POST(request: NextRequest) {
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

  const caller = await getCurrentEmployee()
  if (!caller || caller.status !== "active") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const supabase = await createClient()
  const submittedAt = new Date()

  // Employee self-submit → pending_manager → BM → HR
  if (caller.role === "employee") {
    const { data: row, error } = await supabase
      .from("hr_overtime_requests")
      .insert({
        employee_id: caller.id,
        work_date: workDate,
        start_time: startTime,
        end_time: endTime,
        reason,
        status: "pending",
        approval_status: "pending_manager",
        submitted_by: caller.id,
        submitted_at: submittedAt.toISOString(),
        expires_at: expiresAtFrom(submittedAt).toISOString(),
      })
      .select("id")
      .single()

    if (error || !row) {
      return NextResponse.json({ error: error?.message ?? "insert failed" }, { status: 500 })
    }

    try {
      if (caller.line_user_id) {
        await pushToLineUser(caller.line_user_id, [
          overtimeSubmitConfirmFlex({
            employeeName: caller.name,
            workDate,
            startTime,
            endTime,
            stage: "manager",
          }),
        ])
      }
      await notifyBranchManager({
        employeeId: caller.id,
        kind: "overtime",
        employeeName: caller.name,
        detail: `${workDate} ${startTime}–${endTime}`,
      })
    } catch (lineError) {
      console.error("overtime LINE notify failed:", lineError)
    }

    return NextResponse.json({
      id: row.id,
      approval_status: "pending_manager",
      hours: otHours(startTime, endTime),
    })
  }

  // Branch manager proxy submit (optional) → skip BM step → pending_hr
  const callerWithBranch = await getCurrentEmployeeWithBranch()
  if (!callerWithBranch || !isBranchManager(callerWithBranch.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const employeeId = body.employeeId
  if (typeof employeeId !== "string") {
    return NextResponse.json({ error: "employeeId required" }, { status: 400 })
  }

  const managedBranch = await getManagedBranchId(callerWithBranch.id)
  if (!managedBranch) {
    return NextResponse.json({ error: "ไม่พบสาขาที่ดูแล" }, { status: 400 })
  }

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
      submitted_by: callerWithBranch.id,
      submitted_at: submittedAt.toISOString(),
      expires_at: expiresAtFrom(submittedAt).toISOString(),
      manager_decided_by: callerWithBranch.id,
      manager_decided_at: submittedAt.toISOString(),
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
          stage: "hr",
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
