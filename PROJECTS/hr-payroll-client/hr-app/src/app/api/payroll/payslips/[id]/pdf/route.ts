import { NextRequest, NextResponse } from "next/server"
import { renderPayslipPdfDocument } from "@/lib/payroll/payslip-pdf-document"
import { getPayrollConfig } from "@/lib/payroll/config"
import type { PdfLang } from "@/lib/payroll/payslip-pdf-types"

type Params = { params: Promise<{ id: string }> }

const VALID_LANGS: PdfLang[] = ["zh", "th", "en"]

export async function GET(req: NextRequest, { params }: Params) {
  const payrollConfig = await getPayrollConfig()
  const { id: payslipId } = await params
  const requestedLang = req.nextUrl.searchParams.get("lang")
  const langParam = requestedLang ?? payrollConfig.payslip_default_lang
  const lang: PdfLang = VALID_LANGS.includes(langParam as PdfLang)
    ? (langParam as PdfLang)
    : payrollConfig.payslip_default_lang
  try {
    const { filename, bytes } = await renderPayslipPdfDocument(payslipId, {
      lang,
      companyName: payrollConfig.company_name,
      companyLegalName: payrollConfig.company_legal_name,
      companyTaxId: payrollConfig.company_tax_id,
      companyAddress: payrollConfig.company_address,
      showDepartment: payrollConfig.payslip_show_department,
      showBranch: payrollConfig.payslip_show_branch,
      showYtd: payrollConfig.payslip_show_ytd,
      showSignature: payrollConfig.payslip_show_signature,
      showHours: payrollConfig.payslip_show_hours,
    })
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(bytes.byteLength),
      },
    })
  } catch {
    return NextResponse.json({ error: "payslip not found" }, { status: 404 })
  }
}
