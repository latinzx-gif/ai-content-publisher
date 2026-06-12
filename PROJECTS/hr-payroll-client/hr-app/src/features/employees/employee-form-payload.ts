import type { ContractType } from "@/features/employees/profile/data"
import type { SalaryPaymentMethod } from "@/features/employees/profile/payment-method"
import type { AssignableRole } from "@/lib/auth/employee-roles"

type BankFields = {
  salary_payment_method: SalaryPaymentMethod | "" | null
  bank_name: string
  bank_account_name: string
  bank_account_number: string
  bank_branch: string
}

export function buildBankPatchFields(form: BankFields): Record<string, unknown> {
  const method = form.salary_payment_method
  if (method === "cash") {
    return {
      salary_payment_method: "cash",
      bank_name: null,
      bank_account_name: null,
      bank_account_number: null,
      bank_branch: null,
    }
  }
  if (method === "bank" && form.bank_account_number.trim()) {
    return {
      salary_payment_method: "bank",
      bank_name: form.bank_name.trim() || null,
      bank_account_name: form.bank_account_name.trim() || null,
      bank_account_number: form.bank_account_number.trim(),
      bank_branch: form.bank_branch.trim() || null,
    }
  }
  if (method === null || method === "") {
    return { salary_payment_method: null }
  }
  return {}
}

export type ProfilePatchInput = {
  name: string
  date_of_birth: string
  phone: string
  email: string
  position: string
  department: string
  salary: string
  contract_start: string
  contract_type: ContractType
  probation_end: string
  visa_expiry: string
  work_permit_expiry: string
  status: "active" | "inactive"
  role: AssignableRole
  employee_code: string
  branch_id: string
  work_shift_id: string
} & BankFields

export function buildProfilePatchBody(form: ProfilePatchInput): Record<string, unknown> {
  return {
    name: form.name.trim(),
    date_of_birth: form.date_of_birth || null,
    phone: form.phone.trim() || null,
    email: form.email.trim() || null,
    position: form.position.trim() || null,
    department: form.department.trim() || null,
    salary: form.salary ? Number.parseFloat(form.salary) : null,
    contract_start: form.contract_start || null,
    contract_type: form.contract_type,
    probation_end: form.probation_end || null,
    visa_expiry: form.visa_expiry || null,
    work_permit_expiry: form.work_permit_expiry || null,
    status: form.status,
    role: form.role,
    employee_code: form.employee_code.trim() || null,
    branch_id: form.branch_id || null,
    work_shift_id: form.work_shift_id || null,
    ...buildBankPatchFields(form),
  }
}

export type AddEmployeeFormState = {
  name: string
  line_user_id: string
  work_email: string
  work_phone: string
  personal_email: string
  department: string
  position: string
  contract_type: ContractType
  contract_start: string
  probation_end: string
  salary: string
  visa_expiry: string
  work_permit_expiry: string
  status: "active" | "inactive"
  role: AssignableRole
  employee_code: string
  date_of_birth: string
  work_shift_id: string
} & BankFields

export function buildAddEmployeeBody(form: AddEmployeeFormState): Record<string, unknown> {
  const email = form.work_email.trim() || form.personal_email.trim() || null
  return {
    name: form.name.trim(),
    line_user_id: form.line_user_id.trim() || null,
    email,
    phone: form.work_phone.trim() || null,
    date_of_birth: form.date_of_birth || null,
    department: form.department.trim() || null,
    position: form.position.trim() || null,
    contract_type: form.contract_type,
    contract_start: form.contract_start || null,
    probation_end: form.probation_end || null,
    salary: form.salary ? Number.parseFloat(form.salary) : null,
    visa_expiry: form.visa_expiry || null,
    work_permit_expiry: form.work_permit_expiry || null,
    status: form.status,
    role: form.role,
    employee_code: form.employee_code.trim() || null,
    work_shift_id: form.work_shift_id || null,
    ...buildBankPatchFields(form),
  }
}
