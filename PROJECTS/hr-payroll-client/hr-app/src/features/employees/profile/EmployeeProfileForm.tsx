"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { StatusPill } from "@/components/brand/StatusPill"
import { WidgetCard } from "@/components/brand/WidgetCard"
import { Button } from "@/components/ui/button"
import type { BranchRow } from "@/features/branches/data"
import type { ContractType, EmployeeProfile } from "@/features/employees/profile/data"
import {
  ASSIGNABLE_ROLES,
  type AssignableRole,
} from "@/lib/auth/employee-roles"
import { roleDisplayLabel } from "@/lib/auth/labels"
import { cn } from "@/lib/utils"

const inputClassName =
  "mt-1 h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const PROBATION_LABEL: Record<EmployeeProfile["probationStatus"], string> = {
  pending: "รอประเมิน",
  passed: "ผ่านแล้ว",
  not_applicable: "ไม่มีช่วงทดลองงาน",
}

const PROBATION_VARIANT: Record<
  EmployeeProfile["probationStatus"],
  "pending" | "approved" | "neutral"
> = {
  pending: "pending",
  passed: "approved",
  not_applicable: "neutral",
}

const CONTRACT_OPTIONS: Array<{ value: ContractType; label: string }> = [
  { value: null, label: "— เลือกประเภท —" },
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
]

type FormState = {
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
  branch_id: string
}

function toFormState(profile: EmployeeProfile): FormState {
  return {
    name: profile.name,
    date_of_birth: profile.date_of_birth ?? "",
    phone: profile.phone ?? "",
    email: profile.email ?? "",
    position: profile.position ?? "",
    department: profile.department ?? "",
    salary: profile.salary?.toString() ?? "",
    contract_start: profile.contract_start ?? "",
    contract_type: profile.contract_type,
    probation_end: profile.probation_end ?? "",
    visa_expiry: profile.visa_expiry ?? "",
    work_permit_expiry: profile.work_permit_expiry ?? "",
    status: profile.status,
    role: (ASSIGNABLE_ROLES as readonly string[]).includes(profile.role)
      ? (profile.role as AssignableRole)
      : "employee",
    branch_id: profile.branch_id ?? "",
  }
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

export function EmployeeProfileForm({
  profile,
  branches,
}: {
  profile: EmployeeProfile
  branches: BranchRow[]
}) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(() => toFormState(profile))
  const [saving, setSaving] = useState(false)
  const [probationBusy, setProbationBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function saveProfile() {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch(`/api/employees/${profile.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
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
          branch_id: form.branch_id || null,
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? "บันทึกไม่สำเร็จ")
      }
      setMessage("บันทึกข้อมูลแล้ว")
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ")
    } finally {
      setSaving(false)
    }
  }

  async function probationAction(action: "pass" | "fail" | "extend") {
    setProbationBusy(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch(`/api/employees/${profile.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ probationAction: action }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? "ดำเนินการไม่สำเร็จ")
      }
      const updated = (await res.json()) as { probation_end?: string | null; status?: string }
      if (updated.probation_end !== undefined) {
        setField("probation_end", updated.probation_end ?? "")
      }
      if (updated.status) {
        setField("status", updated.status as "active" | "inactive")
      }
      setMessage(
        action === "pass"
          ? "บันทึกผลทดลองงาน: ผ่าน"
          : action === "fail"
            ? "บันทึกผลทดลองงาน: ไม่ผ่าน"
            : "ขยายระยะทดลองงานแล้ว"
      )
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "ดำเนินการไม่สำเร็จ")
    } finally {
      setProbationBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <WidgetCard title="ข้อมูลส่วนตัว">
          <div className="flex flex-col gap-3">
            <Field label="ชื่อ-นามสกุล">
              <input
                className={inputClassName}
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
              />
            </Field>
            <Field label="วันเกิด">
              <input
                type="date"
                className={inputClassName}
                value={form.date_of_birth}
                onChange={(e) => setField("date_of_birth", e.target.value)}
              />
            </Field>
            <Field label="เบอร์โทร">
              <input
                type="tel"
                className={inputClassName}
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
              />
            </Field>
            <Field label="อีเมล">
              <input
                type="email"
                className={inputClassName}
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
              />
            </Field>
            <Field label="ตำแหน่ง">
              <input
                className={inputClassName}
                value={form.position}
                onChange={(e) => setField("position", e.target.value)}
              />
            </Field>
            <Field label="แผนก">
              <input
                className={inputClassName}
                value={form.department}
                onChange={(e) => setField("department", e.target.value)}
              />
            </Field>
            <Field label="สิทธิ์เข้าใช้งาน (Role)">
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
              <p className="mt-1 text-xs text-muted-foreground">
                Employee = LIFF เท่านั้น · Branch Manager / HR / Admin / CEO =
                Dashboard
              </p>
            </Field>
            <Field label="สาขา">
              <select
                className={inputClassName}
                value={form.branch_id}
                onChange={(e) => setField("branch_id", e.target.value)}
              >
                <option value="">— ไม่ระบุ —</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                    {b.code ? ` (${b.code})` : ""}
                  </option>
                ))}
              </select>
            </Field>
            <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              LINE ID:{" "}
              <span className="font-mono text-foreground">
                {profile.line_user_id ?? "—"}
              </span>
            </p>
          </div>
        </WidgetCard>

        <WidgetCard title="สัญญาจ้าง">
          <div className="flex flex-col gap-3">
            <Field label="วันเริ่มงาน">
              <input
                type="date"
                className={inputClassName}
                value={form.contract_start}
                onChange={(e) => setField("contract_start", e.target.value)}
              />
            </Field>
            <Field label="ประเภทสัญญา">
              <select
                className={inputClassName}
                value={form.contract_type ?? ""}
                onChange={(e) =>
                  setField(
                    "contract_type",
                    (e.target.value || null) as ContractType
                  )
                }
              >
                {CONTRACT_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.value ?? ""}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="เงินเดือน (บาท)">
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClassName}
                value={form.salary}
                onChange={(e) => setField("salary", e.target.value)}
              />
            </Field>
            <Field label="สถานะพนักงาน">
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
            </Field>
          </div>
        </WidgetCard>

        <WidgetCard title="ทดลองงาน">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <StatusPill
                label={PROBATION_LABEL[profile.probationStatus]}
                variant={PROBATION_VARIANT[profile.probationStatus]}
              />
            </div>
            <Field label="วันครบทดลองงาน">
              <input
                type="date"
                className={inputClassName}
                value={form.probation_end}
                onChange={(e) => setField("probation_end", e.target.value)}
              />
            </Field>
            {profile.probationStatus === "pending" ? (
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  className="bg-brand-red hover:bg-brand-red/90"
                  disabled={probationBusy}
                  onClick={() => probationAction("pass")}
                >
                  ผ่านทดลองงาน
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={probationBusy}
                  onClick={() => probationAction("extend")}
                >
                  ขยาย 30 วัน
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={probationBusy}
                  onClick={() => probationAction("fail")}
                >
                  ไม่ผ่าน
                </Button>
              </div>
            ) : null}
          </div>
        </WidgetCard>

        <WidgetCard title="วีซ่า / Work Permit">
          <div className="flex flex-col gap-3">
            <div>
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">วีซ่า</span>
                <StatusPill
                  label={profile.visaStatus.label}
                  variant={profile.visaStatus.variant}
                />
              </div>
              <input
                type="date"
                className={inputClassName}
                value={form.visa_expiry}
                onChange={(e) => setField("visa_expiry", e.target.value)}
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Work Permit</span>
                <StatusPill
                  label={profile.workPermitStatus.label}
                  variant={profile.workPermitStatus.variant}
                />
              </div>
              <input
                type="date"
                className={inputClassName}
                value={form.work_permit_expiry}
                onChange={(e) => setField("work_permit_expiry", e.target.value)}
              />
            </div>
          </div>
        </WidgetCard>
      </div>

      <div
        className={cn(
          "flex flex-wrap items-center gap-3 rounded-xl border border-border/80 bg-card p-4 shadow-sm"
        )}
      >
        <Button
          type="button"
          disabled={saving}
          className="bg-brand-red hover:bg-brand-red/90"
          onClick={saveProfile}
        >
          {saving ? "กำลังบันทึก…" : "บันทึกข้อมูล"}
        </Button>
        <a
          href={`/api/checkin/qr?emp_id=${profile.id}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-brand-red hover:underline"
        >
          ดาวน์โหลด QR เช็คอิน
        </a>
        <a
          href={`/admin/attendance?employee=${profile.id}`}
          className="text-sm font-medium text-brand-red hover:underline"
        >
          ดูประวัติการเข้างาน
        </a>
      </div>

      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
