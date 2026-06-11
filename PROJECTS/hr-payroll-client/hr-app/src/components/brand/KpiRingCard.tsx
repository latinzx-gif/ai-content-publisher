import { cn } from "@/lib/utils"

function ProgressRing({
  percent,
  size,
  strokeWidth,
  labelSize,
}: {
  percent: number
  size: number
  strokeWidth: number
  labelSize: string
}) {
  const clamped = Math.min(100, Math.max(0, percent))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference
  const center = size / 2

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--brand-red)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center font-semibold tabular-nums",
          labelSize
        )}
      >
        {Math.round(clamped)}%
      </span>
    </div>
  )
}

export function KpiRingCard({
  label,
  percent,
  detail,
  compact = false,
}: {
  label: string
  percent: number
  detail?: string
  compact?: boolean
}) {
  const clamped = Math.min(100, Math.max(0, percent))

  if (compact) {
    return (
      <div className="rounded-xl border border-border/80 bg-card p-2.5 shadow-sm md:p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs text-muted-foreground">{label}</p>
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <ProgressRing
              percent={clamped}
              size={38}
              strokeWidth={3.5}
              labelSize="text-[10px]"
            />
          </span>
        </div>
        <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight md:text-2xl">
          {Math.round(clamped)}%
        </p>
        {detail ? (
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-3 flex items-center gap-3">
        <ProgressRing
          percent={clamped}
          size={80}
          strokeWidth={8}
          labelSize="text-lg"
        />
        <div>
          <p className="text-xs text-muted-foreground">Today</p>
          {detail ? (
            <p className="mt-1 text-sm font-medium text-foreground">{detail}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
