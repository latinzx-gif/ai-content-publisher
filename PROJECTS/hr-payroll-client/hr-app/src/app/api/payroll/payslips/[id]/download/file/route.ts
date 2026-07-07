import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/auth/admin-client"
import { getCurrentEmployee } from "@/lib/auth/session"
import { renderPayslipPdfDocument } from "@/lib/payroll/payslip-pdf-document"
import { getPayrollConfig } from "@/lib/payroll/config"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = await getCurrentEmployee()
    if (!caller) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const admin = getAdminClient()
    const payrollConfig = await getPayrollConfig()

    const { data: slip, error } = await admin
      .from("hr_payslips")
      .select("id, employee_id, status")
      .eq("id", id)
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!slip) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const isOwner = slip.employee_id === caller.id
    const isHr = ["hr", "dev"].includes(caller.role)
    if (!isOwner && !isHr) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (slip.status !== "final" && !isHr) {
      return NextResponse.json({ error: "Payslip not available" }, { status: 403 })
    }

    const { filename, bytes } = await renderPayslipPdfDocument(id, {
      lang: payrollConfig.payslip_default_lang,
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
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
