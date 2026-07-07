"use client"

import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { WidgetCard } from "@/components/brand/WidgetCard"
import type { PayrollConfig } from "@/lib/payroll/config"
import { salaryFieldLabel } from "@/lib/payroll/pay-type"
import { NATIONALITY_OPTIONS, payDayLabel } from "@/lib/payroll/pay-day"

type BoolToggleProps = {
  value: "true" | "false"
  field: keyof FormState
  trueLabel: string
  falseLabel: string
  setField: (key: keyof FormState, value: string) => void
}

function BoolToggle({ value, field, trueLabel, falseLabel, setField }: BoolToggleProps) {
  return (
    <div className="inline-flex rounded-md border p-1">
      <button
        type="button"
        className={`rounded-md px-3 py-1 text-xs ${value === "true" ? "bg-brand-red text-white" : "hover:bg-muted"}`}
        onClick={() => setField(field, "true")}
      >
        {trueLabel}
      </button>
      <button
        type="button"
        className={`rounded-md px-3 py-1 text-xs ${value !== "true" ? "bg-brand-red text-white" : "hover:bg-muted"}`}
        onClick={() => setField(field, "false")}
      >
        {falseLabel}
      </button>
    </div>
  )
}

type FormState = {
  monthly_std_hours: string
  ot_multiplier: string
  sso_cap: string
  sso_rate: string
  sso_enabled: string
  work_entry_regular: string
  work_entry_ot: string
  work_entry_sick: string
  work_entry_annual: string
  payroll_cutoff_day: string
  tax_enabled: string
  tax_rate: string
  leave_sick_deduct_enabled: string
  company_name: string
  company_legal_name: string
  company_tax_id: string
  company_address: string
  payslip_default_lang: string
  payslip_show_department: string
  payslip_show_branch: string
  payslip_show_ytd: string
  payslip_show_signature: string
  payslip_show_hours: string
}

function toFormState(config: PayrollConfig): FormState {
  return {
    monthly_std_hours: String(config.monthly_std_hours),
    ot_multiplier: String(config.ot_multiplier),
    sso_cap: String(config.sso_cap),
    sso_rate: String(config.sso_rate),
    sso_enabled: config.sso_enabled ? "true" : "false",
    work_entry_regular: config.work_entry_regular,
    work_entry_ot: config.work_entry_ot,
    work_entry_sick: config.work_entry_sick,
    work_entry_annual: config.work_entry_annual,
    payroll_cutoff_day: String(config.payroll_cutoff_day),
    tax_enabled: config.tax_enabled ? "true" : "false",
    tax_rate: String(config.tax_rate),
    leave_sick_deduct_enabled: config.leave_sick_deduct_enabled ? "true" : "false",
    company_name: config.company_name,
    company_legal_name: config.company_legal_name,
    company_tax_id: config.company_tax_id,
    company_address: config.company_address,
    payslip_default_lang: config.payslip_default_lang,
    payslip_show_department: config.payslip_show_department ? "true" : "false",
    payslip_show_branch: config.payslip_show_branch ? "true" : "false",
    payslip_show_ytd: config.payslip_show_ytd ? "true" : "false",
    payslip_show_signature: config.payslip_show_signature ? "true" : "false",
    payslip_show_hours: config.payslip_show_hours ? "true" : "false",
  }
}

export function PayrollSettingsPanel({ initialConfig }: { initialConfig: PayrollConfig }) {
  const [form, setForm] = useState<FormState>(() => toFormState(initialConfig))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch("/api/payroll/config", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      })
      const body = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) throw new Error(body?.error ?? "บันทึกไม่สำเร็จ")
      setMessage("บันทึกการตั้งค่าแล้ว")
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ")
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    "mt-1 h-9 w-full max-w-xs rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
  const textAreaClass =
    "mt-1 min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

  return (
    <div className="flex flex-col gap-6">
      <WidgetCard title="คู่มือเงื่อนไขเงินเดือน">
        <p className="mb-4 text-sm text-muted-foreground">
          กำหนดประเภทการจ่ายและอัตราในโปรไฟล์พนักงาน — ระบบจะใช้ค่าดังนี้ตอนคำนวณเงินเดือน
        </p>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-3 py-2">pay_type</th>
                <th className="px-3 py-2">ฟิลด์ salary</th>
                <th className="px-3 py-2">ชม.ที่นำมาคำนวณ</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-3 py-2 font-medium">monthly (Office)</td>
                <td className="px-3 py-2">{salaryFieldLabel("monthly")}</td>
                <td className="px-3 py-2">เงินเดือนเต็ม + OT + ลา (บันทึกชม.)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium">hourly (หน้าร้าน)</td>
                <td className="px-3 py-2">{salaryFieldLabel("hourly")}</td>
                <td className="px-3 py-2">ชม.จาก ledger ที่อนุมัติแล้ว</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>
            <strong>วันจ่ายเงินเดือน:</strong> ไทย + พม่า → วันที่ <strong>4</strong> ·
            จีน → วันที่ <strong>5</strong> (จ่ายเดือนถัดไป) — ตั้งในโปรไฟล์พนักงาน
          </li>
          <li>
            คำนวณแล้วแยก batch วันจ่าย <strong>4</strong> / <strong>5</strong> อัตโนมัติ
          </li>
          <li>
            สัญชาติที่รองรับ:{" "}
            {NATIONALITY_OPTIONS.map((o) => `${o.label} (${payDayLabel(o.payDay)})`).join(" · ")}
          </li>
          <li>
            สาขา Head Office (รหัส <strong>000</strong>) → default{" "}
            <strong>monthly</strong> · สาขาอื่น → default <strong>hourly</strong>
          </li>
          <li>
            หลัง Lock รอบ → สร้าง PDF สลิป → พนักงานดูที่{" "}
            <Link href="/portal/payslips" className="font-medium text-brand-red hover:underline">
              Portal → สลิปเงินเดือน
            </Link>
          </li>
          <li>
            โหมด payroll ปัจจุบันใช้โครงสร้างสากลแบบ <strong>Earnings / Net Pay</strong> โดยยัง
            <strong>ไม่หักภาษี</strong> และ <strong>ไม่หักประกันสังคม</strong>
          </li>
        </ul>
      </WidgetCard>

      <form onSubmit={onSave}>
        <WidgetCard title="ค่าที่ใช้คำนวณ (แก้ไขได้)">
          <p className="mb-4 text-sm text-muted-foreground">
            ค่าเหล่านี้ใช้ตอนคำนวณเงินเดือนรอบถัดไป — SSO และ Tax คุมด้วยปุ่มเปิด/ปิดด้านล่าง
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-muted-foreground">ชม.มาตรฐาน/เดือน (OT สูตร monthly)</span>
              <input
                type="number"
                min="0"
                step="1"
                className={inputClass}
                value={form.monthly_std_hours}
                onChange={(e) => setField("monthly_std_hours", e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">OT multiplier</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={form.ot_multiplier}
                onChange={(e) => setField("ot_multiplier", e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Work entry — ชม.ปกติ</span>
              <input
                className={inputClass}
                value={form.work_entry_regular}
                onChange={(e) => setField("work_entry_regular", e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Work entry — OT</span>
              <input
                className={inputClass}
                value={form.work_entry_ot}
                onChange={(e) => setField("work_entry_ot", e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Work entry — ลาป่วย</span>
              <input
                className={inputClass}
                value={form.work_entry_sick}
                onChange={(e) => setField("work_entry_sick", e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Work entry — ลาพักร้อน</span>
              <input
                className={inputClass}
                value={form.work_entry_annual}
                onChange={(e) => setField("work_entry_annual", e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">วันตัดรอบ default (1–31)</span>
              <input
                type="number"
                min="1"
                max="31"
                step="1"
                className={inputClass}
                value={form.payroll_cutoff_day}
                onChange={(e) => setField("payroll_cutoff_day", e.target.value)}
              />
            </label>
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-muted-foreground/40 p-4">
            <h4 className="text-sm font-semibold">ข้อมูลบริษัทที่แสดงในสลิป</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              ตั้งชื่อบริษัทและที่อยู่บริษัทที่ต้องการให้ขึ้นใน PDF
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-muted-foreground">ชื่อบริษัท</span>
                <input
                  className={inputClass}
                  value={form.company_name}
                  onChange={(e) => setField("company_name", e.target.value)}
                />
              </label>
              <label className="block text-sm">
                <span className="text-muted-foreground">ชื่อทางกฎหมาย</span>
                <input
                  className={inputClass}
                  value={form.company_legal_name}
                  onChange={(e) => setField("company_legal_name", e.target.value)}
                />
              </label>
              <label className="block text-sm">
                <span className="text-muted-foreground">Tax ID / เลขประจำตัวผู้เสียภาษี</span>
                <input
                  className={inputClass}
                  value={form.company_tax_id}
                  onChange={(e) => setField("company_tax_id", e.target.value)}
                />
              </label>
              <label className="col-span-full block text-sm">
                <span className="text-muted-foreground">ที่อยู่บริษัท</span>
                <textarea
                  className={textAreaClass}
                  value={form.company_address}
                  onChange={(e) => setField("company_address", e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-muted-foreground/40 p-4">
            <h4 className="text-sm font-semibold">เลย์เอาท์สลิปเงินเดือน</h4>
            <div className="mt-3 space-y-3">
              <label className="block text-sm">
                <span className="text-muted-foreground">ภาษา default ของสลิป</span>
                <select
                  className={`${inputClass} max-w-xs`}
                  value={form.payslip_default_lang}
                  onChange={(e) => setField("payslip_default_lang", e.target.value)}
                >
                  <option value="th">ไทย</option>
                  <option value="zh">中文</option>
                  <option value="en">English</option>
                </select>
              </label>
              <div className="rounded-lg border p-3">
                <p className="mb-3 text-sm">เลือกเฉพาะข้อมูลที่ต้องการแสดง</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center justify-between gap-3">
                    <span>แสดงแผนก</span>
                    <BoolToggle
                      field="payslip_show_department"
                      value={form.payslip_show_department as "true" | "false"}
                      trueLabel="แสดง"
                      falseLabel="ซ่อน"
                      setField={setField}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>แสดงสาขา</span>
                    <BoolToggle
                      field="payslip_show_branch"
                      value={form.payslip_show_branch as "true" | "false"}
                      trueLabel="แสดง"
                      falseLabel="ซ่อน"
                      setField={setField}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>แสดง YTD</span>
                    <BoolToggle
                      field="payslip_show_ytd"
                      value={form.payslip_show_ytd as "true" | "false"}
                      trueLabel="แสดง"
                      falseLabel="ซ่อน"
                      setField={setField}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>แสดงลายเซ็นต์</span>
                    <BoolToggle
                      field="payslip_show_signature"
                      value={form.payslip_show_signature as "true" | "false"}
                      trueLabel="แสดง"
                      falseLabel="ซ่อน"
                      setField={setField}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>แสดงชม.ใน pay type</span>
                    <BoolToggle
                      field="payslip_show_hours"
                      value={form.payslip_show_hours as "true" | "false"}
                      trueLabel="แสดง"
                      falseLabel="ซ่อน"
                      setField={setField}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-muted-foreground/40 p-4">
            <h4 className="text-sm font-semibold">เปิดใช้งานการหักเงิน</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              เปิดปุ่มเพื่อเริ่มหัก SSO/ภาษีในการคำนวณ และซ่อนการตั้งค่าเมื่อปิด
            </p>
            <div className="mt-3 space-y-4">
              <div className="rounded-lg border p-3">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <span className="text-sm">ปิด/เปิด SSO</span>
                  <div className="inline-flex rounded-md border p-1">
                    <button
                      type="button"
                      className={`rounded-md px-3 py-1 text-xs ${
                        form.sso_enabled === "true" ? "bg-brand-red text-white" : "hover:bg-muted"
                      }`}
                      onClick={() => setField("sso_enabled", "true")}
                    >
                      เปิด
                    </button>
                    <button
                      type="button"
                      className={`rounded-md px-3 py-1 text-xs ${
                        form.sso_enabled !== "true" ? "bg-brand-red text-white" : "hover:bg-muted"
                      }`}
                      onClick={() => setField("sso_enabled", "false")}
                    >
                      ปิด
                    </button>
                  </div>
                </div>
                <div className={`grid gap-4 sm:grid-cols-2 ${form.sso_enabled === "true" ? "block" : "hidden"}`}>
                  <label className="block text-sm">
                    <span className="text-muted-foreground">SSO cap (บาท)</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className={inputClass}
                      value={form.sso_cap}
                      onChange={(e) => setField("sso_cap", e.target.value)}
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-muted-foreground">SSO rate</span>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.001"
                      className={inputClass}
                      value={form.sso_rate}
                      onChange={(e) => setField("sso_rate", e.target.value)}
                    />
                  </label>
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <span className="text-sm">ปิด/เปิด Tax</span>
                  <div className="inline-flex rounded-md border p-1">
                    <button
                      type="button"
                      className={`rounded-md px-3 py-1 text-xs ${
                        form.tax_enabled === "true" ? "bg-brand-red text-white" : "hover:bg-muted"
                      }`}
                      onClick={() => setField("tax_enabled", "true")}
                    >
                      เปิด
                    </button>
                    <button
                      type="button"
                      className={`rounded-md px-3 py-1 text-xs ${
                        form.tax_enabled !== "true" ? "bg-brand-red text-white" : "hover:bg-muted"
                      }`}
                      onClick={() => setField("tax_enabled", "false")}
                    >
                      ปิด
                    </button>
                  </div>
                </div>
                <div className={`grid gap-4 sm:grid-cols-2 ${form.tax_enabled === "true" ? "block" : "hidden"}`}>
                  <label className="block text-sm">
                    <span className="text-muted-foreground">tax_rate</span>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.001"
                      className={inputClass}
                      value={form.tax_rate}
                      onChange={(e) => setField("tax_rate", e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={saving} className="bg-brand-red hover:bg-brand-red/90">
              {saving ? "กำลังบันทึก…" : "บันทึกการตั้งค่า"}
            </Button>
            <Link href="/admin/payroll/runs" className="text-sm font-medium text-brand-red hover:underline">
              ไปคำนวณเงินเดือน
            </Link>
            {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        </WidgetCard>
      </form>
    </div>
  )
}
