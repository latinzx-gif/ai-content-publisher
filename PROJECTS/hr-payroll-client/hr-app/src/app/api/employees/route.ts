import { NextResponse } from "next/server"

import type { ContractType } from "@/features/employees/profile/data"
import type { SalaryPaymentMethod } from "@/features/employees/profile/payment-method"
import {
  isAssignableRole,
  type AssignableRole,
} from "@/lib/auth/employee-roles"
import { canManageHr } from "@/lib/auth/roles"
import { getCurrentEmployee } from "@/lib/auth/session"
import { validateEmployeeDepartmentRole } from "@/lib/employees/validate-department-role"
import { normalizeBankFields } from "@/lib/employees/bank-fields"
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
  branch_id?: string | null
  salary?: number | null
  contract_start?: string | null
  contract_type?: ContractType
  probation_end?: string | null
  visa_expiry?: string | null
  work_permit_expiry?: string | null
  status?: "active" | "inactive"
  role?: string
  employee_code?: string | null
  salary_payment_method?: SalaryPaymentMethod
  bank_name?: string | null
  bank_account_name?: string | null
  bank_account_number?: string | null
  bank_branch?: string | null
}

export async function POST(request: Request) {
  const caller = await getCurrentEmployee()
  if (!caller || !canManageHr(caller.role)) {
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
  if (!isAssignableRole(role)) {
    return NextResponse.json({ error: "invalid role" }, { status: 400 })
  }

  const roleMismatch = validateEmployeeDepartmentRole(
    body.department,
    role as AssignableRole,
    caller
  )
  if (roleMismatch) {
    return NextResponse.json({ error: roleMismatch }, { status: 400 })
  }

  const supabase = await createClient()

  if (body.branch_id) {
    const { data: branch } = await supabase
      .from("hr_branches")
      .select("id")
      .eq("id", body.branch_id)
      .maybeSingle()
    if (!branch) {
      return NextResponse.json({ error: "branch not found" }, { status: 400 })
    }
  }

  const employeeCode =
    typeof body.employee_code === "string" && body.employee_code.trim()
      ? body.employee_code.trim()
      : null

  const bank = normalizeBankFields(body)
  if (bank.error) {
    return NextResponse.json({ error: bank.error }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("hr_employees")
    .insert({
      name,
      employee_code: employeeCode,
      line_user_id: body.line_user_id?.trim() || null,
      date_of_birth: body.date_of_birth || null,
      phone: body.phone?.trim() || null,
      email: body.email?.trim() || null,
      position: body.position?.trim() || null,
      department: body.department?.trim() || null,
      branch_id: body.branch_id || null,
      salary: body.salary ?? null,
      contract_start: body.contract_start || null,
      contract_type: body.contract_type ?? null,
      probation_end: body.probation_end || null,
      visa_expiry: body.visa_expiry || null,
      work_permit_expiry: body.work_permit_expiry || null,
      status: body.status === "inactive" ? "inactive" : "active",
      role,
      ...bank.updates,
    })
    .select("id")
    .single()

  if (error) {
    const msg =
      error.code === "23505"
        ? error.message.includes("employee_code")
          ? "รหัสพนักงานนี้มีในระบบแล้ว"
          : "LINE user ID นี้มีในระบบแล้ว"
        : error.message
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}
