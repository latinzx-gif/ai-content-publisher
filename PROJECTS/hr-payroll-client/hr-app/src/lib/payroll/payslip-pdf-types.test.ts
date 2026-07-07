import assert from "node:assert/strict"
import test from "node:test"
import { formatPayslipPeriodLabel, type PayslipPdfInput } from "@/lib/payroll/payslip-pdf-types"

test("formatPayslipPeriodLabel uses localized month labels", () => {
  assert.equal(formatPayslipPeriodLabel("2026-07", "en"), "Jul 2026")
  assert.equal(formatPayslipPeriodLabel("2026-07", "th"), "ก.ค. 2026")
  assert.equal(formatPayslipPeriodLabel("2026-07", "zh"), "七月 2026")
})

test("stored payslip config keeps the updated company header", () => {
  const input: PayslipPdfInput = {
    companyName: "ChineseVibe",
    companyLegalName: "บริษัท ไชนีส ไวบ์ จำกัด",
    companyTaxId: "0105565142805",
    companyAddress: "99/15 ซอยเนียมอุทิศ ถนนรัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพมหานคร 10400",
    employeeName: "A",
    employeeCode: "E01",
    branchName: "HQ",
    departmentName: "Ops",
    payType: "hourly",
    paymentDate: "2026-07-01",
    periodLabel: "Jul 2026",
    periodStart: "2026-07-01",
    periodEnd: "2026-07-31",
    lines: [],
    grossAmount: 0,
    ssoDeduction: 0,
    taxDeduction: 0,
    netAmount: 0,
    lang: "en",
    showDepartment: false,
    showBranch: false,
    showYtd: true,
    showSignature: false,
    showHours: true,
  }
  assert.equal(input.companyName, "ChineseVibe")
  assert.equal(input.companyTaxId, "0105565142805")
})
