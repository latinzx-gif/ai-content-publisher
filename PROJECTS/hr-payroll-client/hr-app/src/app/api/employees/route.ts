import { NextResponse } from "next/server"

import type { ContractType } from "@/features/employees/profile/data"
import { getCurrentEmployee } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type CreateBody = {
  name?: string
  line_user_id?: string | null
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
  role?: "employee" | "hr" | "admin"
}

export async function POST(request: Request) {
  const caller = await getCurrentEmployee()
  if (!caller || (caller.role !== "hr" && caller.role !== "admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  let body: CreateBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 })
  }

  const name = body.name?.trim()
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 })
  }

  if (body.email && typeof body.email === "string" && body.email.trim()) {
    if (!EMAIL_RE.test(body.email.trim())) {
      return NextResponse.json({ error: "invalid email" }, { status: 400 })
    }
  }

  const allowedContract: ContractType[] = ["full_time", "part_time", "contract", null]
  if (body.contract_type !== undefined && !allowedContract.includes(body.contract_type)) {
    return NextResponse.json({ error: "invalid contract_type" }, { status: 400 })
  }

  const role = body.role ?? "employee"
  if (!["employee", "hr", "admin"].includes(role)) {
    return NextResponse.json({ error: "invalid role" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("hr_employees")
    .insert({
      name,
      line_user_id: body.line_user_id?.trim() || null,
      date_of_birth: body.date_of_birth || null,
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
      position: body.position?.trim() || null,
      department: body.department?.trim() || null,
      salary: body.salary ?? null,
      contract_start: body.contract_start || null,
      contract_type: body.contract_type ?? null,
      probation_end: body.probation_end || null,
      visa_expiry: body.visa_expiry || null,
      work_permit_expiry: body.work_permit_expiry || null,
      status: body.status === "inactive" ? "inactive" : "active",
      role,
    })
    .select("id")
    .single()

  if (error) {
    const msg =
      error.code === "23505"
        ? "LINE user ID นี้มีในระบบแล้ว"
        : error.message
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}
