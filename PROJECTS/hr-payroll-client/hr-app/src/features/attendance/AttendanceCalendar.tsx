"use client"

import Link from "next/link"

import { buildCalendarGrid } from "@/features/attendance/calendar-grid"
import type {
  AttendanceDayCell,
  AttendanceDayStatus,
} from "@/features/attendance/calendar-types"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"]

const STATUS_LABEL: Record<AttendanceDayStatus, string> = {
  complete: "ครบ",
  late: "สาย",
  in_progress: "กำลังทำงาน",
  missing_checkout: "ลืมออก",
  missing_checkin: "ลืมเข้า",
  on_leave: "ลา",
  no_shift: "ไม่มีกะ",
  future: "",
  retro_expired: "หมดเวลาแก้",
}

const STATUS_CLASS: Record<AttendanceDayStatus, string> = {
  complete: "bg-emerald-50 border-emerald-200 text-emerald-800",
  late: "bg-amber-50 border-amber-200 text-amber-900",
  in_progress: "bg-sky-50 border-sky-200 text-sky-900",
  missing_checkout: "bg-orange-50 border-orange-300 text-orange-900",
  missing_checkin: "bg-red-50 border-red-300 text-red-900",
  on_leave: "bg-violet-50 border-violet-200 text-violet-800",
  no_shift: "bg-muted/40 border-border/60 text-muted-foreground",
  future: "bg-background border-border/40 text-muted-foreground",
  retro_expired: "bg-muted border-border text-muted-foreground line-through",
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`
}

function buildMonthHref(basePath: string, month: string, extra?: Record<string, string>) {
  const params = new URLSearchParams({ month, ...extra })
  return `${basePath}?${params.toString()}`
}

export function AttendanceCalendar({
  month,
  days,
  basePath,
  selectedDate,
  onDayClick,
  showLegend = true,
}: {
  month: string
  days: AttendanceDayCell[]
  basePath: string
  selectedDate?: string | null
  onDayClick?: (cell: AttendanceDayCell) => void
  showLegend?: boolean
}) {
  const grid = buildCalendarGrid(month)
  const byDate = new Map(days.map((d) => [d.date, d]))
  const [y, m] = month.split("-")

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Link
          href={buildMonthHref(basePath, shiftMonth(month, -1))}
          className="text-sm text-primary underline"
        >
          ← เดือนก่อน
        </Link>
        <h3 className="text-sm font-semibold">
          {m}/{y}
        </h3>
        <Link
          href={buildMonthHref(basePath, shiftMonth(month, 1))}
          className="text-sm text-primary underline"
        >
          เดือนถัดไป →
        </Link>
      </div>

      {showLegend ? (
        <div className="flex flex-wrap gap-2 text-[10px]">
          {(
            [
              "complete",
              "late",
              "missing_checkin",
              "missing_checkout",
              "on_leave",
              "retro_expired",
            ] as AttendanceDayStatus[]
          ).map((status) => (
            <span
              key={status}
              className={cn(
                "rounded border px-1.5 py-0.5",
                STATUS_CLASS[status]
              )}
            >
              {STATUS_LABEL[status]}
            </span>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {grid.map((cell, i) => {
          const day = cell.date ? byDate.get(cell.date) : null
          const status = day?.status ?? (cell.date ? "future" : "future")
          const clickable = Boolean(day && onDayClick && day.retroEligible)

          return (
            <button
              key={i}
              type="button"
              disabled={!clickable}
              onClick={() => day && onDayClick?.(day)}
              className={cn(
                "min-h-[64px] rounded-md border p-1 text-left text-xs transition",
                cell.date ? STATUS_CLASS[status] : "border-transparent bg-transparent",
                selectedDate === cell.date && "ring-2 ring-brand-red/50",
                clickable && "cursor-pointer hover:brightness-95",
                !cell.date && "pointer-events-none"
              )}
            >
              {cell.day ? (
                <>
                  <span className="font-medium">{cell.day}</span>
                  {day?.checkIn ? (
                    <p className="mt-0.5 truncate text-[10px]">in {day.checkIn}</p>
                  ) : null}
                  {day?.checkOut ? (
                    <p className="truncate text-[10px]">out {day.checkOut}</p>
                  ) : day && status !== "future" && status !== "on_leave" ? (
                    <p className="mt-0.5 text-[10px] font-medium">
                      {STATUS_LABEL[status]}
                    </p>
                  ) : null}
                </>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function AttendanceCorrectableBanner({
  items,
  liffBasePath = "/liff/attendance",
}: {
  items: Array<{
    workDate: string
    issue: "missing_checkin" | "missing_checkout"
    deadline: string
  }>
  liffBasePath?: string
}) {
  if (items.length === 0) return null

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
      <p className="font-semibold">วันที่ต้องลงเวลาย้อนหลัง (ภายใน 48 ชม.)</p>
      <ul className="mt-1 space-y-1">
        {items.map((item) => (
          <li key={item.workDate} className="flex flex-wrap items-center gap-2">
            <span>
              {item.workDate} —{" "}
              {item.issue === "missing_checkin" ? "ลืมเช็คเข้า" : "ลืมเช็คออก"}
            </span>
            <Link
              href={`${liffBasePath}?date=${item.workDate}`}
              className="text-brand-red underline"
            >
              ลงย้อนหลัง
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function RetroQuotaBadge({
  used,
  limit,
}: {
  used: number
  limit: number
}) {
  return (
    <p className="text-sm text-muted-foreground">
      สิทธิ์ลงย้อนหลังเดือนนี้:{" "}
      <span className="font-semibold text-foreground">
        {used}/{limit}
      </span>{" "}
      ครั้ง
    </p>
  )
}
