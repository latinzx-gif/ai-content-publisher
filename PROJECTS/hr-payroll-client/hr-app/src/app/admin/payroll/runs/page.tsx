import { PayrollRunsClient } from "@/app/admin/payroll/runs/PayrollRunsClient"
import { getPayrollConfig } from "@/lib/payroll/config"
import { getRunByPeriod } from "@/lib/payroll/run"
import { requireRole } from "@/lib/auth/require-role"

type PageProps = {
  searchParams?: Promise<{
    period?: string
    cutoffDay?: string
  }>
}

export default async function PayrollRunsPage({ searchParams }: PageProps) {
  await requireRole("hr", "dev")

  const config = await getPayrollConfig()
  const params = (await searchParams) ?? {}
  const now = new Date()
  const fallbackPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const initialPeriod =
    typeof params.period === "string" && /^\d{4}-\d{2}$/.test(params.period)
      ? params.period
      : fallbackPeriod
  const parsedCutoffDay = Number(params.cutoffDay)
  const initialCutoffDay =
    Number.isInteger(parsedCutoffDay) && parsedCutoffDay >= 1 && parsedCutoffDay <= 31
      ? parsedCutoffDay
      : config.payroll_cutoff_day
  const initialRun = await getRunByPeriod(initialPeriod, initialCutoffDay)

  return (
    <PayrollRunsClient
      defaultCutoffDay={initialCutoffDay}
      initialPeriod={initialPeriod}
      initialRun={initialRun}
      defaultPdfLang={config.payslip_default_lang}
    />
  )
}
