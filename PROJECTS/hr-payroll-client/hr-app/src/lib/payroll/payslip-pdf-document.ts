import React from "react"
import { renderToBuffer } from "@react-pdf/renderer"
import { getAdminClient } from "@/lib/auth/admin-client"
import { PayslipPdf } from "@/lib/payroll/payslip-pdf"
import { getYtdForEmployee } from "@/lib/payroll/ytd"
import { formatPayslipPeriodLabel } from "@/lib/payroll/payslip-pdf-types"
import type { PayslipPdfInput, PdfLang } from "@/lib/payroll/payslip-pdf-types"

export type PayslipRenderConfig = {
  lang?: PdfLang
  companyName?: string
  companyLegalName?: string
  companyTaxId?: string
  companyAddress?: string
  showDepartment?: boolean
  showBranch?: boolean
  showYtd?: boolean
  showSignature?: boolean
  showHours?: boolean
}

const DEFAULT_RENDER_CONFIG = {
  lang: "en" as PdfLang,
  companyName: "ChineseVibe",
  companyLegalName: "บริษัท ไชนีส ไวบ์ จำกัด",
  companyTaxId: "0105565142805",
  companyAddress:
    "99/15 ซอยเนียมอุทิศ ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพมหานคร 10400",
  showDepartment: true,
  showBranch: true,
  showYtd: true,
  showSignature: true,
  showHours: true,
}

export async function renderPayslipPdfDocument(
  payslipId: string,
  renderConfig: PayslipRenderConfig = {}
): Promise<{ filename: string; bytes: Uint8Array }> {
  const admin = getAdminClient()
  const {
    lang = "en",
    companyName,
    companyLegalName,
    companyTaxId,
    companyAddress,
    showDepartment,
    showBranch,
    showYtd,
    showSignature,
    showHours,
  } = { ...DEFAULT_RENDER_CONFIG, ...renderConfig }

  const { data: payslip, error: payslipError } = await admin
    .from("hr_payslips")
    .select(
      `id, run_id, employee_id, pay_type, pay_day, payment_date,
       gross_amount, sso_deduction, tax_deduction, net_amount,
       regular_hours, ot_hours, base_rate, monthly_salary,
       hr_payroll_runs!inner(period, period_start, period_end)`
    )
    .eq("id", payslipId)
    .single()

  if (payslipError || !payslip) {
    throw new Error("payslip not found")
  }

  const { data: lines } = await admin
    .from("hr_payslip_lines")
    .select("label, code, amount, note, source, sort_order")
    .eq("payslip_id", payslipId)
    .order("sort_order", { ascending: true })

  const { data: employee } = await admin
    .from("hr_employees")
    .select("name, employee_code, department, branch_id")
    .eq("id", payslip.employee_id)
    .single()

  const empBranchId = (employee as { branch_id?: string | null } | null)?.branch_id
  const { data: branch } = empBranchId
    ? await admin.from("hr_branches").select("name").eq("id", empBranchId).single()
    : { data: null }

  const runRaw = payslip.hr_payroll_runs
  const run = (Array.isArray(runRaw) ? runRaw[0] : runRaw) as unknown as {
    period: string
    period_start: string
    period_end: string
  }

  const year = new Date(run.period_start).getFullYear()
  const ytd = await getYtdForEmployee(payslip.employee_id, year, payslip.run_id).catch(
    () => null
  )

  const periodLabel = formatPayslipPeriodLabel(run.period, lang)
  const emp = employee as { name?: string; employee_code?: string; department?: string | null } | null
  const branchData = branch as { name?: string } | null

  const input: PayslipPdfInput = {
    companyName,
    companyLegalName,
    companyTaxId,
    companyAddress,
    employeeName: emp?.name ?? "-",
    employeeCode: emp?.employee_code ?? "-",
    branchName: branchData?.name ?? "-",
    departmentName: emp?.department ?? "-",
    payType: (payslip.pay_type as "hourly" | "monthly") ?? "hourly",
    paymentDate: payslip.payment_date,
    periodLabel,
    periodStart: run.period_start,
    periodEnd: run.period_end,
    lines: (lines ?? []).map((line) => ({
      label: line.label,
      code: line.code ?? undefined,
      amount: Number(line.amount),
      note: line.note ?? undefined,
    })),
    grossAmount: Number(payslip.gross_amount),
    ssoDeduction: Number(payslip.sso_deduction),
    taxDeduction: Number(payslip.tax_deduction),
    netAmount: Number(payslip.net_amount),
    regularHours: payslip.regular_hours != null ? Number(payslip.regular_hours) : undefined,
    otHours: payslip.ot_hours != null ? Number(payslip.ot_hours) : undefined,
    ytdGross: ytd?.ytdGross,
    ytdTax: ytd?.ytdTax,
    ytdSso: ytd?.ytdSso,
    lang,
    showDepartment,
    showBranch,
    showYtd,
    showSignature,
    showHours,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(PayslipPdf, { input }) as any
  const buffer = await renderToBuffer(element)
  const bytes = new Uint8Array(buffer)
  const filename = `payslip_${employee?.employee_code ?? payslipId}_${run.period}_${lang}.pdf`

  return { filename, bytes }
}
