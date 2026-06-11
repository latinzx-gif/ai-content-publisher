import { NextResponse, type NextRequest } from "next/server"

import { canManageHr, isCeo, isDev } from "@/lib/auth/roles"
import { getCurrentEmployee } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const caller = await getCurrentEmployee()
  if (!caller || (!canManageHr(caller.role) && !isCeo(caller.role) && !isDev(caller.role))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("hr_branches")
    .select("id, name, code, manager_employee_id")
    .order("name")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ branches: data ?? [] })
}

export async function POST(request: NextRequest) {
  const caller = await getCurrentEmployee()
  if (!caller || !canManageHr(caller.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  let body: { name?: string; code?: string; managerEmployeeId?: string | null }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 })
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 })
  }

  const supabase = await createClient()

  if (body.managerEmployeeId) {
    const { data: mgr } = await supabase
      .from("hr_employees")
      .select("id, role")
      .eq("id", body.managerEmployeeId)
      .maybeSingle()

    if (!mgr || mgr.role !== "branch_manager") {
      return NextResponse.json({ error: "manager must be branch_manager role" }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from("hr_branches")
      .select("id")
      .eq("manager_employee_id", body.managerEmployeeId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "manager already assigned to a branch" }, { status: 409 })
    }
  }

  const { data, error } = await supabase
    .from("hr_branches")
    .insert({
      name: body.name.trim(),
      code: body.code?.trim() || null,
      manager_employee_id: body.managerEmployeeId || null,
    })
    .select("id")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (body.managerEmployeeId) {
    await supabase
      .from("hr_employees")
      .update({ branch_id: data.id })
      .eq("id", body.managerEmployeeId)
  }

  return NextResponse.json({ id: data.id })
}
