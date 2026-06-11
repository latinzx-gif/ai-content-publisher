"use client"

import { StatusDonutChart } from "@/features/dashboard/StatusDonutChart"

const RECRUITMENT_COLORS = [
  "#3B82F6",
  "#F59E0B",
  "#10B981",
  "#8B5CF6",
  "#9CA3AF",
] as const

export function RecruitmentDonut({
  data,
  compact = false,
}: {
  data: Array<{ name: string; value: number }>
  compact?: boolean
}) {
  return (
    <StatusDonutChart
      data={data}
      colors={RECRUITMENT_COLORS}
      centerLabel="Open Positions"
      emptyMessage="No open positions"
      compact={compact}
      denseLegend
    />
  )
}
