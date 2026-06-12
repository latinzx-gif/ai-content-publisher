import { NextResponse, type NextRequest } from "next/server"

import { ictToday } from "@/features/employees/data"
import type { ContractType } from "@/features/employees/profile/data"
import { isAssignableRole } from "@/lib/auth/employee-roles"
import { canManageHr } from "@/lib/auth/roles"
import { getCurrentEmployee } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"

const DAY_MS = 86_400_000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function addDays(date: string, days: number): string {
  const t = Date.parse(`${date}T00:00:00Z`) + days * DAY_MS
  return new Date(t).toISOString().slice(0, 10)
}

type PatchBody = {
  name?: string
  date_of_birth?: string | null
  phone?: string | null
  email?: string | null
  position?: string | null
  department?: string | null
  salary?: number | null
  contract_start?: string | null
  contract_type?: ContractType
  probation_end?: string | null
  visa_expiry?: string | null
  work_permit_expiry?: string | null
  status?: "active" | "inactive"
  probationAction?: "pass" | "fail" | "extend"
  role?: string
  branch_id?: string | null
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
  const updates: Record<string, unknown> = {}

  if (body.probationAction) {
    const today = ictToday()
    const { data: row } = await supabase
      .from("hr_employees")
      .select("probation_end, status")
      .eq("id", id)
      .maybeSingle()

    if (!row) {
      return NextResponse.json({ error: "not found" }, { status: 404 })
    }

    if (body.probationAction === "pass") {
      updates.probation_end = addDays(today, -1)
      updates.status = "active"
    } else if (body.probationAction === "fail") {
      updates.status = "inactive"
    } else if (body.probationAction === "extend") {
      const base =
        row.probation_end && row.probation_end >= today ? row.probation_end : today
      updates.probation_end = addDays(base, 30)
      updates.status = "active"
    }
  } else {
    if (typeof body.name === "string" && body.name.trim()) {
      updates.name = body.name.trim()
    }
    if (body.date_of_birth !== undefined) updates.date_of_birth = body.date_of_birth
    if (body.phone !== undefined) {
      updates.phone =
        typeof body.phone === "string" && body.phone.trim()
          ? body.phone.trim()
          : null
    }
    if (body.email !== undefined) {
      if (body.email === null || body.email === "") {
        updates.email = null
      } else if (typeof body.email === "string") {
        const email = body.email.trim()
        if (email && !EMAIL_RE.test(email)) {
          return NextResponse.json({ error: "invalid email" }, { status: 400 })
        }
        updates.email = email || null
      }
    }
    if (body.position !== undefined) updates.position = body.position
    if (body.department !== undefined) updates.department = body.department
    if (body.salary !== undefined) updates.salary = body.salary
    if (body.contract_start !== undefined) updates.contract_start = body.contract_start
    if (body.contract_type !== undefined) {
      const allowed: ContractType[] = ["full_time", "part_time", "contract", null]
      if (!allowed.includes(body.contract_type)) {
        return NextResponse.json({ error: "invalid contract_type" }, { status: 400 })
      }
      updates.contract_type = body.contract_type
    }
    if (body.probation_end !== undefined) updates.probation_end = body.probation_end
    if (body.visa_expiry !== undefined) updates.visa_expiry = body.visa_expiry
    if (body.work_permit_expiry !== undefined) {
      updates.work_permit_expiry = body.work_permit_expiry
    }
    if (body.status === "active" || body.status === "inactive") {
      updates.status = body.status
    }
    if (body.role !== undefined) {
      if (!isAssignableRole(body.role)) {
        return NextResponse.json({ error: "invalid role" }, { status: 400 })
      }
      updates.role = body.role
    }
    if (body.branch_id !== undefined) {
      if (body.branch_id === null || body.branch_id === "") {
        updates.branch_id = null
      } else {
        const { data: branch } = await supabase
          .from("hr_branches")
          .select("id")
          .eq("id", body.branch_id)
          .maybeSingle()
        if (!branch) {
          return NextResponse.json({ error: "branch not found" }, { status: 400 })
        }
        updates.branch_id = body.branch_id
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "no changes" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("hr_employees")
    .update(updates)
    .eq("id", id)
    .select("probation_end, status")
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  return NextResponse.json(data)
}
