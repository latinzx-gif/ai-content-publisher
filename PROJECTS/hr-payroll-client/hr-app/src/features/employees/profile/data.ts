import { ictToday } from "@/features/employees/data"
import type { SalaryPaymentMethod } from "@/features/employees/profile/payment-method"
import {
  expiryStatusLabel,
  type ExpiryStatusLabel,
} from "@/features/employees/profile/visa-status"
import { createClient } from "@/lib/supabase/server"

export type { SalaryPaymentMethod } from "@/features/employees/profile/payment-method"

export type ContractType = "full_time" | "part_time" | "contract" | null

export type EmployeeProfile = {
  id: string
  employee_code: string | null
  line_user_id: string | null
  name: string
  date_of_birth: string | null
  phone: string | null
  email: string | null
  position: string | null
  department: string | null
  branch_id: string | null
  salary: number | null
  contract_start: string | null
  contract_type: ContractType
  probation_end: string | null
  probation_outcome: string | null
  probation_outcome_note: string | null
  probation_extended_until: string | null
  contract_end: string | null
  visa_expiry: string | null
  work_permit_expiry: string | null
  salary_payment_method: SalaryPaymentMethod
  bank_name: string | null
  bank_account_name: string | null
  bank_account_number: string | null
  bank_branch: string | null
  role: string
  status: "active" | "inactive"
  probationStatus: "pending" | "passed" | "not_applicable"
  visaStatus: ExpiryStatusLabel
  workPermitStatus: ExpiryStatusLabel
}

export function deriveProbationStatus(
  status: "active" | "inactive",
  probationEnd: string | null,
  today: string
): EmployeeProfile["probationStatus"] {
  if (status !== "active" || !probationEnd) return "not_applicable"
  return probationEnd >= today ? "pending" : "passed"
}

export async function getEmployeeProfile(
  id: string
): Promise<EmployeeProfile | null> {
  const supabase = await createClient()
  const today = ictToday()

  const { data, error } = await supabase
    .from("hr_employees")
    .select(
      "id, employee_code, line_user_id, name, date_of_birth, phone, email, position, department, branch_id, salary, contract_start, contract_type, contract_end, probation_end, probation_outcome, probation_outcome_note, probation_extended_until, visa_expiry, work_permit_expiry, salary_payment_method, bank_name, bank_account_name, bank_account_number, bank_branch, role, status"
    )
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const status = data.status as "active" | "inactive"

  return {
    ...data,
    contract_type: (data.contract_type as ContractType) ?? null,
    salary_payment_method: (data.salary_payment_method as SalaryPaymentMethod) ?? null,
    bank_name: data.bank_name as string | null,
    bank_account_name: data.bank_account_name as string | null,
    bank_account_number: data.bank_account_number as string | null,
    bank_branch: data.bank_branch as string | null,
    probation_outcome: data.probation_outcome as string | null,
    probation_outcome_note: data.probation_outcome_note as string | null,
    probation_extended_until: data.probation_extended_until as string | null,
    contract_end: data.contract_end as string | null,
    status,
    probationStatus: deriveProbationStatus(status, data.probation_end, today),
    visaStatus: expiryStatusLabel(data.visa_expiry, today),
    workPermitStatus: expiryStatusLabel(data.work_permit_expiry, today),
  }
}

export async function getComplianceNotes(employeeId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("hr_compliance_notes")
    .select("id, category, note, created_at")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) throw error
  return data ?? []
}
