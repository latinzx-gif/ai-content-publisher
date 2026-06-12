import { NextResponse, type NextRequest } from "next/server"

import { applyBranchManagerAssignment } from "@/lib/branches/assign-manager"
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

  const supabase = await createClient()

  const { data: currentBranch } = await supabase
    .from("hr_branches")
    .select("manager_employee_id")
    .eq("id", id)
    .maybeSingle()

  if (!currentBranch) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
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

  if (body.managerEmployeeId !== undefined) {
    const assignment = await applyBranchManagerAssignment(
      supabase,
      id,
      body.managerEmployeeId || null,
      (currentBranch.manager_employee_id as string | null) ?? null
    )
    if (!assignment.ok) {
      return NextResponse.json(
        { error: assignment.error },
        { status: assignment.status }
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

  return NextResponse.json(data)
}
