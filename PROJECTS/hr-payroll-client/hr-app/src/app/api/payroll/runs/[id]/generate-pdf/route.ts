import { NextResponse } from "next/server"

import { getAdminClient } from "@/lib/auth/admin-client"
import { getCurrentEmployee } from "@/lib/auth/session"
import {
  generatePayslipPdf,
  payslipStoragePath,
  PAYROLL_PDF_BUCKET,
} from "@/lib/payroll/payslip-pdf"
import { formatPayslipPeriodLabel } from "@/lib/payroll/payslip-pdf-types"
import { getPayrollConfig } from "@/lib/payroll/config"
import { getRunWithPayslips } from "@/lib/payroll/run"
import { getYtdForEmployee } from "@/lib/payroll/ytd"

function canManagePayroll(role: string): boolean {
  return ["hr", "dev"].includes(role)
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = await getCurrentEmployee()
    if (!caller || !canManagePayroll(caller.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const payrollConfig = await getPayrollConfig()
    const run = await getRunWithPayslips(id)
    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 })
    }

    if (run.status === "draft") {
      return NextResponse.json(
        { error: "ต้อง lock รอบก่อนสร้าง PDF" },
        { status: 400 }
      )
    }

    const admin = getAdminClient()
    const results: Array<{ payslip_id: string; pdf_path: string; success: boolean; error?: string }> = []
    const employeeIds = [...new Set(run.payslips.map((slip) => slip.employee_id))]
    const { data: employees } = employeeIds.length
      ? await admin
          .from("hr_employees")
          .select("id, name, employee_code, department, branch_id")
          .in("id", employeeIds)
      : { data: [] }

    const branchIds = [...new Set((employees ?? []).map((employee) => employee.branch_id).filter(Boolean))]
    const { data: branches } = branchIds.length
      ? await admin.from("hr_branches").select("id, name").in("id", branchIds)
      : { data: [] }

    const employeeMap = new Map((employees ?? []).map((employee) => [employee.id as string, employee]))
    const branchMap = new Map((branches ?? []).map((branch) => [branch.id as string, branch.name as string]))
    const periodLabel = formatPayslipPeriodLabel(
      run.period,
      payrollConfig.payslip_default_lang
    )

    for (const slip of run.payslips) {
      try {
        const { data: lines } = await admin
          .from("hr_payslip_lines")
          .select("label, code, amount, note, sort_order")
          .eq("payslip_id", slip.id)
          .order("sort_order")

        const employee = employeeMap.get(slip.employee_id)
        const year = new Date(run.period_start).getFullYear()
        const ytd = await getYtdForEmployee(slip.employee_id, year, slip.run_id).catch(() => null)

        const pdfBytes = await generatePayslipPdf({
          companyName: payrollConfig.company_name,
          companyLegalName: payrollConfig.company_legal_name,
          companyTaxId: payrollConfig.company_tax_id,
          companyAddress: payrollConfig.company_address,
          employeeName: employee?.name ?? slip.employee_name ?? slip.employee_id,
          employeeCode: employee?.employee_code ?? "-",
          branchName: branchMap.get(employee?.branch_id ?? "") ?? "-",
          departmentName: employee?.department ?? "-",
          payType: slip.pay_type,
          periodLabel,
          periodStart: run.period_start,
          periodEnd: run.period_end,
          paymentDate: slip.payment_date,
          lines: (lines ?? []).map((l) => ({
            label: l.label as string,
            code: (l.code as string | null) ?? undefined,
            amount: Number(l.amount),
            note: (l.note as string | null) ?? undefined,
          })),
          grossAmount: slip.gross_amount,
          ssoDeduction: slip.sso_deduction,
          taxDeduction: slip.tax_deduction,
          netAmount: slip.net_amount,
          regularHours: slip.regular_hours,
          otHours: slip.ot_hours,
          ytdGross: ytd?.ytdGross,
          ytdTax: ytd?.ytdTax,
          ytdSso: ytd?.ytdSso,
          lang: payrollConfig.payslip_default_lang,
          showDepartment: payrollConfig.payslip_show_department,
          showBranch: payrollConfig.payslip_show_branch,
          showYtd: payrollConfig.payslip_show_ytd,
          showSignature: payrollConfig.payslip_show_signature,
          showHours: payrollConfig.payslip_show_hours,
        })

        const path = payslipStoragePath(slip.employee_id, run.id)
        const { error: uploadError } = await admin.storage
          .from(PAYROLL_PDF_BUCKET)
          .upload(path, pdfBytes, {
            contentType: "application/pdf",
            upsert: true,
          })

        if (uploadError) throw new Error(uploadError.message)

        await admin.from("hr_payslips").update({ pdf_path: path }).eq("id", slip.id)

        results.push({ payslip_id: slip.id, pdf_path: path, success: true })
      } catch (err) {
        results.push({
          payslip_id: slip.id,
          pdf_path: "",
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        })
      }
    }

    const successful = results.filter((r) => r.success).length
    return NextResponse.json({
      success: successful > 0,
      generated: successful,
      total: run.payslips.length,
      results,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
