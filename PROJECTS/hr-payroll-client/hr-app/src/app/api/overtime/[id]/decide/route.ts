import { NextResponse, type NextRequest } from "next/server"

import { getCurrentEmployee } from "@/lib/auth/session"
import { overtimeResultFlex } from "@/lib/line/flex/overtime-request"
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

  const status = body.action === "approve" ? "approved" : "rejected"
  const supabase = await createClient()

  const { data: ot, error: fetchError } = await supabase
    .from("hr_overtime_requests")
    .select("id, work_date, hr_employees(line_user_id)")
    .eq("id", id)
    .maybeSingle()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }
  if (!ot) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  const { error: updateError } = await supabase
    .from("hr_overtime_requests")
    .update({ status, decision_note: note || null })
    .eq("id", id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
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
