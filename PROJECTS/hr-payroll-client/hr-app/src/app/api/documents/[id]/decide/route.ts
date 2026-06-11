import { NextResponse, type NextRequest } from "next/server"

import { DOC_STATUSES, type DocStatus } from "@/features/documents/types"
import { getCurrentEmployee } from "@/lib/auth/session"
import { documentStatusFlex } from "@/lib/line/flex/document-request"
import { pushToLineUser } from "@/lib/line/notify-hr"
import { createClient } from "@/lib/supabase/server"

type DecideBody = {
  status?: DocStatus
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

  if (!body.status || !DOC_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 })
  }

  const note = typeof body.note === "string" ? body.note.trim() : ""

  const supabase = await createClient()
  const { data: doc, error: fetchError } = await supabase
    .from("hr_document_requests")
    .select(
      "id, doc_type, copies, status, hr_employees(line_user_id, name)"
    )
    .eq("id", id)
    .maybeSingle()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }
  if (!doc) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  const { error: updateError } = await supabase
    .from("hr_document_requests")
    .update({ status: body.status, hr_note: note || null })
    .eq("id", id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  type EmpJoin = { line_user_id: string | null; name: string }
  const empRaw = doc.hr_employees as EmpJoin | EmpJoin[]
  const emp = Array.isArray(empRaw) ? empRaw[0] : empRaw

  try {
    if (emp?.line_user_id) {
      await pushToLineUser(emp.line_user_id, [
        documentStatusFlex({
          docType: doc.doc_type,
          status: body.status,
          note: note || undefined,
        }),
      ])
    }
  } catch (lineError) {
    console.error("document decide LINE notify failed:", lineError)
  }

  return NextResponse.json({ id, status: body.status })
}
