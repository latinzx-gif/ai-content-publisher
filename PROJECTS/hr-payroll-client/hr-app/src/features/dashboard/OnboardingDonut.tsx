"use client"

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

const COLORS = ["#10B981", "#F59E0B", "#E80012"]

export function OnboardingDonut({
  data,
  compact = false,
}: {
  data: Array<{ name: string; value: number }>
  compact?: boolean
}) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const chartHeight = compact ? "h-24" : "h-40"

  if (total === 0) {
    return (
      <div
        className={`flex ${chartHeight} items-center justify-center text-sm text-muted-foreground`}
      >
        No onboarding data
      </div>
    )
  }

  return (
    <div className={`${chartHeight} w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="50%"
            outerRadius="80%"
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              fontSize: "0.75rem",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "0.7rem" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
