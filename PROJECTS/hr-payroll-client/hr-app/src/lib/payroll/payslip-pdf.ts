import React from "react"
import { renderToBuffer } from "@react-pdf/renderer"
import type { PayslipPdfInput } from "@/lib/payroll/payslip-pdf-types"
import { PayslipPdf } from "./payslip-pdf-renderer"

export async function generatePayslipPdf(input: PayslipPdfInput): Promise<Uint8Array> {
  const element = React.createElement(PayslipPdf, { input }) as Parameters<
    typeof renderToBuffer
  >[0]
  const buffer = await renderToBuffer(element)
  return new Uint8Array(buffer)
}

export const PAYROLL_PDF_BUCKET = "payroll-payslips"

export function payslipStoragePath(employeeId: string, runId: string): string {
  return `${employeeId}/${runId}.pdf`
}

export { PayslipPdf } from "./payslip-pdf-renderer"
