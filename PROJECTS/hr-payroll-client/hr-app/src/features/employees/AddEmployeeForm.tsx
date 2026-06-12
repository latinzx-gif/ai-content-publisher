"use client"

import {
  Building2,
  CreditCard,
  FileText,
  Heart,
  Mail,
  User,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { EmployeeAvatar } from "@/components/brand/EmployeeAvatar"
import { StatusPill } from "@/components/brand/StatusPill"
import { Button, buttonVariants } from "@/components/ui/button"
import type { ContractType } from "@/features/employees/profile/data"
import { PAYMENT_METHOD_OPTIONS, type SalaryPaymentMethod } from "@/features/employees/profile/payment-method"
import { ProfileSectionCard } from "@/features/employees/profile/ProfileSectionCard"
import {
  ASSIGNABLE_ROLES,
  type AssignableRole,
} from "@/lib/auth/employee-roles"
import { roleDisplayLabel } from "@/lib/auth/labels"
import { cn } from "@/lib/utils"

const inputClassName =
  "mt-0.5 h-7 w-full rounded-md border border-input bg-transparent px-2 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"

const CONTRACT_OPTIONS: Array<{ value: ContractType; label: string }> = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
]

function FormField({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={cn("block min-w-0", className)}>
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

export function AddEmployeeForm() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: "",
    line_user_id: "",
    work_email: "",
    work_phone: "",
    personal_email: "",
    address: "",
    emergency_name: "",
    emergency_relationship: "",
    emergency_phone: "",
    emergency_address: "",
    date_of_birth: "",
    gender: "",
    nationality: "",
    id_number: "",
    department: "",
    position: "",
    contract_type: "full_time" as ContractType,
    contract_start: "",
    probation_end: "",
    salary: "",
    salary_payment_method: "" as "" | Exclude<SalaryPaymentMethod, null>,
    bank_name: "",
    bank_account_name: "",
    bank_account_number: "",
    bank_branch: "",
    tax_status: "",
    social_security_number: "",
    housing_fund_number: "",
    visa_expiry: "",
    work_permit_expiry: "",
    status: "active" as "active" | "inactive",
    role: "employee" as AssignableRole,
    employee_code: "",
  })

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError("กรุณากรอกชื่อ-นามสกุล")
      return
    }

    setSaving(true)
    setError(null)
    try {
      const email = form.work_email.trim() || form.personal_email.trim() || null
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
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
          salary_payment_method: form.salary_payment_method || null,
          bank_name: form.bank_name.trim() || null,
          bank_account_name: form.bank_account_name.trim() || null,
          bank_account_number: form.bank_account_number.trim() || null,
          bank_branch: form.bank_branch.trim() || null,
        }),
      })
      const body = (await res.json().catch(() => null)) as
        | { id?: string; error?: string }
        | null
      if (!res.ok) {
        throw new Error(body?.error ?? "สร้างพนักงานไม่สำเร็จ")
      }
      router.push(`/admin/employees/${body?.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "สร้างพนักงานไม่สำเร็จ")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex h-full min-h-0 flex-col gap-2 overflow-hidden"
    >
      <div className="shrink-0 overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="relative bg-brand-red px-4 py-3 text-white md:px-5">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, #fff 0, transparent 45%), radial-gradient(circle at 80% 70%, #fff 0, transparent 40%)",
            }}
          />
          <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <EmployeeAvatar name={form.name.trim() || "New"} size="lg" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-xl font-bold">
                    {form.name.trim() || "New Employee"}
                  </h1>
                  <StatusPill
                    label={form.status === "active" ? "Active" : "Inactive"}
                    variant={form.status === "active" ? "approved" : "neutral"}
                  />
                </div>
                <p className="text-xs text-white/85">
                  {form.employee_code.trim()
                    ? `รหัสพนักงาน · ${form.employee_code.trim()}`
                    : "รหัสพนักงาน · ระบุในฟอร์มด้านล่าง (ไม่บังคับ)"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="bg-white text-brand-red hover:bg-white/90"
              >
                {saving ? "Saving…" : "Create Employee"}
              </Button>
              <Link
                href="/admin/employees"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                )}
              >
                Cancel
              </Link>
              {error ? (
                <span className="text-xs text-white/95">{error}</span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-2 overflow-hidden xl:grid-cols-3 xl:grid-rows-2">
        <ProfileSectionCard title="Contact Information" icon={Mail}>
          <FormField label="Work Email">
            <input
              type="email"
              className={inputClassName}
              value={form.work_email}
              onChange={(e) => setField("work_email", e.target.value)}
            />
          </FormField>
          <FormField label="Work Phone">
            <input
              type="tel"
              className={inputClassName}
              value={form.work_phone}
              onChange={(e) => setField("work_phone", e.target.value)}
            />
          </FormField>
          <FormField label="Personal Email">
            <input
              type="email"
              className={inputClassName}
              value={form.personal_email}
              onChange={(e) => setField("personal_email", e.target.value)}
            />
          </FormField>
          <FormField label="Address" className="sm:col-span-2">
            <input
              className={inputClassName}
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
            />
          </FormField>
        </ProfileSectionCard>

        <ProfileSectionCard title="Emergency Contact" icon={Heart}>
          <FormField label="Contact Name">
            <input
              className={inputClassName}
              value={form.emergency_name}
              onChange={(e) => setField("emergency_name", e.target.value)}
            />
          </FormField>
          <FormField label="Relationship">
            <input
              className={inputClassName}
              value={form.emergency_relationship}
              onChange={(e) => setField("emergency_relationship", e.target.value)}
            />
          </FormField>
          <FormField label="Phone Number">
            <input
              type="tel"
              className={inputClassName}
              value={form.emergency_phone}
              onChange={(e) => setField("emergency_phone", e.target.value)}
            />
          </FormField>
          <FormField label="Address">
            <input
              className={inputClassName}
              value={form.emergency_address}
              onChange={(e) => setField("emergency_address", e.target.value)}
            />
          </FormField>
        </ProfileSectionCard>

        <ProfileSectionCard title="Personal Information" icon={User}>
          <FormField label="Full Name *">
            <input
              required
              className={inputClassName}
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
            />
          </FormField>
          <FormField label="Date of Birth">
            <input
              type="date"
              className={inputClassName}
              value={form.date_of_birth}
              onChange={(e) => setField("date_of_birth", e.target.value)}
            />
          </FormField>
          <FormField label="Gender">
            <select
              className={inputClassName}
              value={form.gender}
              onChange={(e) => setField("gender", e.target.value)}
            >
              <option value="">—</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </FormField>
          <FormField label="Nationality">
            <input
              className={inputClassName}
              value={form.nationality}
              onChange={(e) => setField("nationality", e.target.value)}
            />
          </FormField>
          <FormField label="ID Number">
            <input
              className={inputClassName}
              value={form.id_number}
              onChange={(e) => setField("id_number", e.target.value)}
            />
          </FormField>
          <FormField label="LINE User ID">
            <input
              className={inputClassName}
              placeholder="Uxxxxxxxx… (optional — หรือให้พนักงาน login LINE เอง)"
              value={form.line_user_id}
              onChange={(e) => setField("line_user_id", e.target.value)}
            />
          </FormField>
          <FormField label="รหัสพนักงาน">
            <input
              className={inputClassName}
              placeholder="เช่น EMP-001"
              value={form.employee_code}
              onChange={(e) => setField("employee_code", e.target.value)}
            />
          </FormField>
          <FormField label="Role">
            <select
              className={inputClassName}
              value={form.role}
              onChange={(e) =>
                setField("role", e.target.value as AssignableRole)
              }
            >
              {ASSIGNABLE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {roleDisplayLabel(role)}
                </option>
              ))}
            </select>
          </FormField>
        </ProfileSectionCard>

        <ProfileSectionCard title="Work Information" icon={Building2}>
          <FormField label="Department">
            <input
              className={inputClassName}
              value={form.department}
              onChange={(e) => setField("department", e.target.value)}
            />
          </FormField>
          <FormField label="Position">
            <input
              className={inputClassName}
              value={form.position}
              onChange={(e) => setField("position", e.target.value)}
            />
          </FormField>
          <FormField label="Employment Type">
            <select
              className={inputClassName}
              value={form.contract_type ?? ""}
              onChange={(e) =>
                setField("contract_type", e.target.value as ContractType)
              }
            >
              {CONTRACT_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value ?? ""}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Start Date">
            <input
              type="date"
              className={inputClassName}
              value={form.contract_start}
              onChange={(e) => setField("contract_start", e.target.value)}
            />
          </FormField>
          <FormField label="Probation End">
            <input
              type="date"
              className={inputClassName}
              value={form.probation_end}
              onChange={(e) => setField("probation_end", e.target.value)}
            />
          </FormField>
          <FormField label="Salary (THB)">
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClassName}
              value={form.salary}
              onChange={(e) => setField("salary", e.target.value)}
            />
          </FormField>
          <FormField label="Status">
            <select
              className={inputClassName}
              value={form.status}
              onChange={(e) =>
                setField("status", e.target.value as "active" | "inactive")
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
        </ProfileSectionCard>

        <ProfileSectionCard title="Bank Account" icon={CreditCard}>
          <FormField label="วิธีรับเงินเดือน" className="sm:col-span-2">
            <select
              className={inputClassName}
              value={form.salary_payment_method}
              onChange={(e) => {
                const value = e.target.value as typeof form.salary_payment_method
                setForm((prev) => ({
                  ...prev,
                  salary_payment_method: value,
                  ...(value === "cash"
                    ? {
                        bank_name: "",
                        bank_account_name: "",
                        bank_account_number: "",
                        bank_branch: "",
                      }
                    : {}),
                }))
              }}
            >
              <option value="">— เลือกวิธีรับเงิน —</option>
              {PAYMENT_METHOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormField>
          {form.salary_payment_method === "bank" ? (
            <>
              <FormField label="Bank Name">
                <input
                  className={inputClassName}
                  value={form.bank_name}
                  onChange={(e) => setField("bank_name", e.target.value)}
                />
              </FormField>
              <FormField label="Account Name">
                <input
                  className={inputClassName}
                  value={form.bank_account_name}
                  onChange={(e) => setField("bank_account_name", e.target.value)}
                />
              </FormField>
              <FormField label="Account Number">
                <input
                  className={inputClassName}
                  value={form.bank_account_number}
                  onChange={(e) => setField("bank_account_number", e.target.value)}
                />
              </FormField>
              <FormField label="Branch">
                <input
                  className={inputClassName}
                  value={form.bank_branch}
                  onChange={(e) => setField("bank_branch", e.target.value)}
                />
              </FormField>
            </>
          ) : form.salary_payment_method === "cash" ? (
            <p className="sm:col-span-2 text-xs text-muted-foreground">
              รับเงินเดือนเป็นเงินสด
            </p>
          ) : null}
        </ProfileSectionCard>

        <ProfileSectionCard title="Tax & Social Security" icon={FileText}>
          <FormField label="Tax Status">
            <input
              className={inputClassName}
              value={form.tax_status}
              onChange={(e) => setField("tax_status", e.target.value)}
            />
          </FormField>
          <FormField label="Social Security No.">
            <input
              className={inputClassName}
              value={form.social_security_number}
              onChange={(e) => setField("social_security_number", e.target.value)}
            />
          </FormField>
          <FormField label="Housing Fund No.">
            <input
              className={inputClassName}
              value={form.housing_fund_number}
              onChange={(e) => setField("housing_fund_number", e.target.value)}
            />
          </FormField>
          <FormField label="Visa Expiry">
            <input
              type="date"
              className={inputClassName}
              value={form.visa_expiry}
              onChange={(e) => setField("visa_expiry", e.target.value)}
            />
          </FormField>
          <FormField label="Work Permit Expiry" className="sm:col-span-2">
            <input
              type="date"
              className={inputClassName}
              value={form.work_permit_expiry}
              onChange={(e) => setField("work_permit_expiry", e.target.value)}
            />
          </FormField>
        </ProfileSectionCard>
      </div>
    </form>
  )
}
