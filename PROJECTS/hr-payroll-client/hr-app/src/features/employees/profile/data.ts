import { ictToday } from "@/features/employees/data"
import {
  expiryStatusLabel,
  type ExpiryStatusLabel,
} from "@/features/employees/profile/visa-status"
import { createClient } from "@/lib/supabase/server"

export type ContractType = "full_time" | "part_time" | "contract" | null

export type EmployeeProfile = {
  id: string
  line_user_id: string | null
  name: string
  date_of_birth: string | null
  phone: string | null
  email: string | null
  position: string | null
  department: string | null
  salary: number | null
  contract_start: string | null
  contract_type: ContractType
  probation_end: string | null
  visa_expiry: string | null
  work_permit_expiry: string | null
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
      "id, line_user_id, name, date_of_birth, phone, email, position, department, salary, contract_start, contract_type, probation_end, visa_expiry, work_permit_expiry, role, status"
    )
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const status = data.status as "active" | "inactive"

  return {
    ...data,
    contract_type: (data.contract_type as ContractType) ?? null,
    status,
    probationStatus: deriveProbationStatus(status, data.probation_end, today),
    visaStatus: expiryStatusLabel(data.visa_expiry, today),
    workPermitStatus: expiryStatusLabel(data.work_permit_expiry, today),
  }
}
