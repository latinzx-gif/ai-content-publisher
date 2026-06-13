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
import { useCallback, useMemo, useRef, useState } from "react"

import { EmployeeAvatar } from "@/components/brand/EmployeeAvatar"
import { StatusPill } from "@/components/brand/StatusPill"
import { Button, buttonVariants } from "@/components/ui/button"
import { AutoSaveIndicator } from "@/features/employees/AutoSaveIndicator"
import { buildAddEmployeeBody } from "@/features/employees/employee-form-payload"
import { useDebouncedAutoSave } from "@/features/employees/use-debounced-auto-save"
import type {
  OrgDepartment,
  OrgPosition,
} from "@/features/organization/master-data"
import type { ContractType } from "@/features/employees/profile/data"
import { PAYMENT_METHOD_OPTIONS, type SalaryPaymentMethod } from "@/features/employees/profile/payment-method"
import { ProfileSectionCard } from "@/features/employees/profile/ProfileSectionCard"
import { suggestShiftId } from "@/features/shifts/helpers"
import type { WorkShiftSummary } from "@/features/shifts/types"
import { WorkShiftField } from "@/features/shifts/WorkShiftField"
import {
  allowedRolesForDepartment,
  defaultRoleForDepartment,
} from "@/lib/auth/department-role-defaults"
import {
  ASSIGNABLE_ROLES,
  type AssignableRole,
} from "@/lib/auth/employee-roles"
import { roleDisplayLabel } from "@/lib/auth/labels"
import { ictToday } from "@/lib/datetime/thailand"
import { cn } from "@/lib/utils"

const inputClassName =
  "mt-0.5 h-7 w-full rounded-md border border-input bg-transparent px-2 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"

type ManualAttendanceState = {
  date: string
  checkInTime: string
  checkOutTime: string
  workShiftId: string
}

const initialManualAttendance = (): ManualAttendanceState => ({
  date: ictToday(),
  checkInTime: "",
  checkOutTime: "",
  workShiftId: "",
})

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

export function AddEmployeeForm({
  departments,
  positions,
  workShifts,
}: {
  departments: OrgDepartment[]
  positions: OrgPosition[]
  workShifts: WorkShiftSummary[]
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [attendance, setAttendance] = useState<ManualAttendanceState>(
    initialManualAttendance
  )
  const [attendanceSaving, setAttendanceSaving] = useState(false)
  const [attendanceFeedback, setAttendanceFeedback] = useState<string | null>(
    null
  )
  const draftIdRef = useRef<string | null>(null)
  const attendanceSavedKeyRef = useRef<string | null>(null)
  const savedAttendanceEmployeeIdRef = useRef<string | null>(null)

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
    work_shift_id: "",
  })

  function suggestShiftForAddForm(input: {
    role: AssignableRole
    department: string
  }): string {
    const branchId =
      departments.find((d) => d.name === input.department)?.branch_id ?? null
    return suggestShiftId(workShifts, {
      role: input.role,
      department: input.department || null,
      branchId,
    })
  }

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setAttendanceField<K extends keyof ManualAttendanceState>(
    key: K,
    value: ManualAttendanceState[K]
  ) {
    setAttendance((prev) => ({ ...prev, [key]: value }))
    setAttendanceFeedback(null)
    attendanceSavedKeyRef.current = null
    savedAttendanceEmployeeIdRef.current = null
  }

  const selectedManualShiftId = attendance.workShiftId || form.work_shift_id

  function buildAttendancePayload(employeeId: string) {
    const date = attendance.date.trim()
    const checkInTime = attendance.checkInTime.trim()
    const checkOutTime = attendance.checkOutTime.trim()
    return {
      employeeId,
      date,
      checkInTime,
      checkOutTime: checkOutTime || null,
      workShiftId: selectedManualShiftId,
    }
  }

  function attendancePayloadKey(employeeId: string) {
    const payload = buildAttendancePayload(employeeId)
    return JSON.stringify(payload)
  }

  async function saveManualAttendance(employeeId: string, options?: { silent?: boolean }) {
    if (!attendance.date.trim()) {
      throw new Error("กรุณาระบุวันที่บันทึกเวลา")
    }

    const checkInTime = attendance.checkInTime.trim()
    const checkOutTime = attendance.checkOutTime.trim()
    if (!checkInTime) {
      if (!checkOutTime) {
        return
      }
      throw new Error("กรุณาระบุเวลาเข้าเมื่อจะใส่เวลาเลิกงาน")
    }

    const requestBody = {
      employeeId,
      date: attendance.date.trim(),
      checkInTime,
      checkOutTime: checkOutTime || null,
      workShiftId: selectedManualShiftId,
    }

    const hasInput = checkInTime || checkOutTime
    const payloadKey = attendancePayloadKey(employeeId)
    if (attendanceSavedKeyRef.current === payloadKey) {
      if (!options?.silent) {
        setAttendanceFeedback("บันทึกเวลาเข้า/ออกแล้ว")
      }
      return
    }

    setAttendanceSaving(true)
    if (!options?.silent) {
      setAttendanceFeedback(null)
    }
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? "บันทึกเวลาไม่สำเร็จ")
      }

      if (hasInput) {
        attendanceSavedKeyRef.current = payloadKey
        savedAttendanceEmployeeIdRef.current = employeeId
      }
      if (!options?.silent) {
        setAttendanceFeedback("บันทึกเวลาเข้า/ออกเรียบร้อย")
      }
    } finally {
      setAttendanceSaving(false)
    }
  }

  const roleOptions = useMemo(() => {
    const allowed = allowedRolesForDepartment(form.department)
    return ASSIGNABLE_ROLES.filter((role) => allowed.includes(role))
  }, [form.department])

  const selectedDepartmentId = useMemo(() => {
    return departments.find((d) => d.name === form.department)?.id ?? null
  }, [departments, form.department])

  const departmentPositions = useMemo(() => {
    if (!selectedDepartmentId) return []
    return positions.filter((p) => p.department_id === selectedDepartmentId)
  }, [positions, selectedDepartmentId])

  const formSnapshot = useMemo(() => JSON.stringify(form), [form])

  const persistDraft = useCallback(async (): Promise<string | null> => {
    if (form.name.trim().length < 2) {
      return draftIdRef.current
    }

    const payload = buildAddEmployeeBody(form)
    const currentId = draftIdRef.current

    if (!currentId) {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
      const body = (await res.json().catch(() => null)) as
        | { id?: string; error?: string }
        | null
      if (!res.ok) {
        throw new Error(body?.error ?? "บันทึกร่างไม่สำเร็จ")
      }
      if (body?.id) {
        draftIdRef.current = body.id
        setDraftId(body.id)
        return body.id
      }
      return null
    }

    const res = await fetch(`/api/employees/${currentId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null
      throw new Error(body?.error ?? "บันทึกไม่สำเร็จ")
    }
    return currentId
  }, [form])

  const { status: autoSaveStatus, error: autoSaveError, markSaved } =
    useDebouncedAutoSave({
      snapshot: formSnapshot,
      enabled: form.name.trim().length >= 2,
      onSave: async () => {
        await persistDraft()
      },
    })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError("กรุณากรอกชื่อ-นามสกุล")
      return
    }

    setSaving(true)
    setError(null)
    try {
      const id = await persistDraft()
      markSaved(formSnapshot)
      if (id) {
        const hasAttendanceInput =
          Boolean(attendance.checkInTime.trim() || attendance.checkOutTime.trim())
        const shouldSaveAttendance =
          hasAttendanceInput &&
          (savedAttendanceEmployeeIdRef.current !== id ||
            attendanceSavedKeyRef.current !== attendancePayloadKey(id))

        if (shouldSaveAttendance) {
          await saveManualAttendance(id, { silent: true })
        }
        router.push(`/admin/employees/${id}`)
      } else {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "สร้างพนักงานไม่สำเร็จ")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2"
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
                    : draftId
                      ? "บันทึกร่างแล้ว — แก้ไขต่อได้"
                      : "กรอกชื่อ 2 ตัวอักษรขึ้นไปเพื่อบันทึกอัตโนมัติ"}
                </p>
                <AutoSaveIndicator
                  status={autoSaveStatus}
                  error={autoSaveError}
                  className="text-white/80"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="bg-white text-brand-red hover:bg-white/90"
              >
                {saving
                  ? "Saving…"
                  : draftId
                    ? "ไปที่โปรไฟล์"
                    : "Create Employee"}
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

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
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
                setForm((prev) => {
                  const nextRole = e.target.value as AssignableRole
                  const next = { ...prev, role: nextRole }
                  return {
                    ...next,
                    work_shift_id: suggestShiftForAddForm(next),
                  }
                })
              }
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {roleDisplayLabel(role)}
                </option>
              ))}
            </select>
          </FormField>
        </ProfileSectionCard>

        <ProfileSectionCard title="Work Information" icon={Building2}>
          <FormField label="Department">
            <select
              className={inputClassName}
              value={form.department}
              onChange={(e) => {
                const nextDept = e.target.value
                setForm((prev) => {
                  const stillValid = positions.some(
                    (p) =>
                      p.name === prev.position &&
                      departments.find((d) => d.name === nextDept)?.id ===
                        p.department_id
                  )
                  const nextRole = defaultRoleForDepartment(nextDept)
                  const allowed = allowedRolesForDepartment(nextDept)
                  const role = allowed.includes(prev.role) ? prev.role : nextRole
                  const next = {
                    ...prev,
                    department: nextDept,
                    position: stillValid ? prev.position : "",
                    role,
                  }
                  return {
                    ...next,
                    work_shift_id: suggestShiftForAddForm(next),
                  }
                })
              }}
            >
              <option value="">— เลือกแผนก —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-muted-foreground">
              จาก Organization — เพิ่มแผนกที่{" "}
              <Link href="/admin/organization" className="text-brand-red hover:underline">
                /admin/organization
              </Link>
            </p>
          </FormField>
          <FormField label="Position">
            <select
              className={inputClassName}
              value={form.position}
              onChange={(e) => setField("position", e.target.value)}
              disabled={!form.department}
            >
              <option value="">
                {form.department ? "— เลือกตำแหน่ง —" : "— เลือกแผนกก่อน —"}
              </option>
              {departmentPositions.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="กะทำงาน" className="sm:col-span-2">
            <WorkShiftField
              shifts={workShifts}
              value={form.work_shift_id}
              onChange={(shiftId) => setField("work_shift_id", shiftId)}
              inputClassName={inputClassName}
              hint="แนะนำอัตโนมัติจากแผนก/Role — แก้ได้ด้วยตนเอง"
            />
          </FormField>
          <FormField label="กะสำหรับคำนวณสาย (ทางเลือก)" className="sm:col-span-2">
            <select
              className={inputClassName}
              value={selectedManualShiftId}
              onChange={(e) => setAttendanceField("workShiftId", e.target.value)}
            >
              <option value="">ใช้กะที่เลือกในหน้าแล้ว</option>
              {workShifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="วันที่ (ICT)" className="sm:col-span-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1">
                <input
                  type="date"
                  className={inputClassName}
                  value={attendance.date}
                  onChange={(e) => setAttendanceField("date", e.target.value)}
                />
              </div>
              <div className="grid gap-1">
                <span className="text-[10px] text-muted-foreground">สถานะ</span>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {draftId ? "รอบันทึกหลังกดบันทึกพนักงาน" : "ยังไม่มีรหัสพนักงาน"}
                </p>
              </div>
            </div>
          </FormField>
          <FormField label="เวลาเข้า" className="col-span-2 sm:col-span-1">
            <input
              type="time"
              className={inputClassName}
              value={attendance.checkInTime}
              onChange={(e) => setAttendanceField("checkInTime", e.target.value)}
              required={!!attendance.checkOutTime}
            />
          </FormField>
          <FormField label="เวลาเลิกงาน" className="col-span-2 sm:col-span-1">
            <input
              type="time"
              className={inputClassName}
              value={attendance.checkOutTime}
              onChange={(e) => setAttendanceField("checkOutTime", e.target.value)}
            />
          </FormField>
          <div className="sm:col-span-2 flex items-center justify-between gap-2">
            <p className="text-[11px] text-muted-foreground">
              ใส่ได้หลังจากมีรหัสพนักงานแล้ว — ถ้าใส่เวลาเข้าแล้วจะบันทึกพร้อม
              Create Employee
            </p>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (!draftId) {
                  setAttendanceFeedback("ยังไม่มีรหัสพนักงานให้บันทึกเวลา")
                  return
                }
                saveManualAttendance(draftId).catch((err) => {
                  setAttendanceFeedback(
                    err instanceof Error ? err.message : "บันทึกเวลาไม่สำเร็จ"
                  )
                })
              }}
              disabled={attendanceSaving || !draftId || !attendance.checkInTime}
            >
              บันทึกเวลาเข้า/ออกตอนนี้
            </Button>
          </div>
          {attendanceFeedback ? (
            <p className="sm:col-span-2 text-xs text-muted-foreground">{attendanceFeedback}</p>
          ) : null}
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
