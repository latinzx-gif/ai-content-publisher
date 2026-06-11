import { NextResponse, type NextRequest } from "next/server"

import { getCurrentEmployee } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const caller = await getCurrentEmployee()
  if (!caller || (caller.role !== "hr" && caller.role !== "admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const { id } = await context.params
  let body: {
    action?: string
    outcome?: string
    note?: string
    extendedUntil?: string
    visaExpiry?: string | null
    workPermitExpiry?: string | null
    contractEnd?: string | null
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 })
  }

  const supabase = await createClient()

  if (body.action === "probation") {
    const outcome = body.outcome
    if (!outcome || !["passed", "failed", "extended"].includes(outcome)) {
      return NextResponse.json({ error: "invalid outcome" }, { status: 400 })
    }

    const patch: Record<string, string | null> = {
      probation_outcome: outcome,
      probation_outcome_note: body.note?.trim() || null,
    }
    if (outcome === "extended" && body.extendedUntil) {
      patch.probation_extended_until = body.extendedUntil
      patch.probation_end = body.extendedUntil
    }
    if (outcome === "passed") {
      patch.probation_end = null
    }

    const { error } = await supabase.from("hr_employees").update(patch).eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (body.note?.trim()) {
      await supabase.from("hr_compliance_notes").insert({
        employee_id: id,
        category: "probation",
        note: body.note.trim(),
        created_by: caller.id,
      })
    }

    return NextResponse.json({ ok: true })
  }

  if (body.action === "renewal") {
    const { error } = await supabase
      .from("hr_employees")
      .update({
        visa_expiry: body.visaExpiry || null,
        work_permit_expiry: body.workPermitExpiry || null,
        contract_end: body.contractEnd || null,
      })
      .eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (body.note?.trim()) {
      await supabase.from("hr_compliance_notes").insert({
        employee_id: id,
        category: "visa",
        note: body.note.trim(),
        created_by: caller.id,
      })
    }

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 })
}
