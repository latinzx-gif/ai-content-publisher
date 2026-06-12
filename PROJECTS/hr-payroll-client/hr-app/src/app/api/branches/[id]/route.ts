import { NextResponse, type NextRequest } from "next/server"

import { canManageHr } from "@/lib/auth/roles"
import { getCurrentEmployee } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"

type PatchBody = {
  name?: string
  code?: string | null
  address?: string | null
  managerEmployeeId?: string | null
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const caller = await getCurrentEmployee()
  if (!caller || !canManageHr(caller.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const { id } = await context.params
  let body: PatchBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (body.name !== undefined) {
    const name = body.name.trim()
    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 })
    updates.name = name
  }
  if (body.code !== undefined) {
    updates.code =
      typeof body.code === "string" && body.code.trim() ? body.code.trim() : null
  }
  if (body.address !== undefined) {
    updates.address =
      typeof body.address === "string" && body.address.trim()
        ? body.address.trim()
        : null
  }
  if (body.managerEmployeeId !== undefined) {
    updates.manager_employee_id = body.managerEmployeeId || null
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "no changes" }, { status: 400 })
  }

  const supabase = await createClient()

  if (body.managerEmployeeId) {
    const { data: mgr } = await supabase
      .from("hr_employees")
      .select("id, role")
      .eq("id", body.managerEmployeeId)
      .maybeSingle()

    if (!mgr || mgr.role !== "branch_manager") {
      return NextResponse.json(
        { error: "manager must be branch_manager role" },
        { status: 400 }
      )
    }

    const { data: existing } = await supabase
      .from("hr_branches")
      .select("id")
      .eq("manager_employee_id", body.managerEmployeeId)
      .neq("id", id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "manager already assigned to another branch" },
        { status: 409 }
      )
    }
  }

  const { data, error } = await supabase
    .from("hr_branches")
    .update(updates)
    .eq("id", id)
    .select("id, name, code, address, manager_employee_id")
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 })

  if (body.managerEmployeeId) {
    await supabase
      .from("hr_employees")
      .update({ branch_id: id })
      .eq("id", body.managerEmployeeId)
  }

  return NextResponse.json(data)
}
