// ICT (Asia/Bangkok) time helpers — fixed UTC+7, no DST, no deps.
// All "day" boundaries are Thai-calendar days, returned as UTC instants.

const ICT_OFFSET_MS = 7 * 60 * 60 * 1000

export type ShiftLateSchedule = {
  start_hour: number
  start_minute: number
  crosses_midnight: boolean
  grace_minutes: number
}

// [start, end) of the ICT day containing `now`, as UTC Dates for DB queries.
export function ictDayRangeUtc(now: Date): { start: Date; end: Date } {
  const ictMs = now.getTime() + ICT_OFFSET_MS
  const ictDayStartMs = Math.floor(ictMs / 86_400_000) * 86_400_000
  const start = new Date(ictDayStartMs - ICT_OFFSET_MS)
  return { start, end: new Date(start.getTime() + 86_400_000) }
}

// Minutes past today's HH:MM work start (ICT). 0 when on time or early.
export function lateMinutes(
  now: Date,
  startHour: number,
  startMinute: number
): number {
  const { start } = ictDayRangeUtc(now)
  const workStartMs =
    start.getTime() + (startHour * 60 + startMinute) * 60_000
  return Math.max(0, Math.floor((now.getTime() - workStartMs) / 60_000))
}

/** Late minutes vs employee work shift (early check-in before shift start => 0). */
export function lateMinutesForShift(
  checkInAt: Date,
  shift: ShiftLateSchedule
): number {
  const dayStart = ictDayRangeUtc(checkInAt).start
  const shiftStartMinutes = shift.start_hour * 60 + shift.start_minute
  const checkInMinutes = Math.floor(
    ((checkInAt.getTime() - dayStart.getTime()) / 60_000 + 24 * 60) % (24 * 60)
  )

  // ponytail: before shift start on the ICT calendar day is early, not late
  // (fixes Branch Night 10:00 vs 14:00 — old crosses_midnight adjust wrongly marked late)
  if (checkInMinutes < shiftStartMinutes) {
    return 0
  }

  return Math.max(0, checkInMinutes - shift.grace_minutes - shiftStartMinutes)
}

export function isLateAtCheckIn(
  checkInAt: Date,
  shift: ShiftLateSchedule | null,
  fallbackStart: { hour: number; minute: number }
): boolean {
  if (shift) {
    return lateMinutesForShift(checkInAt, shift) > 0
  }
  return lateMinutes(checkInAt, fallbackStart.hour, fallbackStart.minute) > 0
}

export function lateMinutesAtCheckIn(
  checkInAt: Date,
  shift: ShiftLateSchedule | null,
  fallbackStart: { hour: number; minute: number }
): number {
  if (shift) {
    return lateMinutesForShift(checkInAt, shift)
  }
  return lateMinutes(checkInAt, fallbackStart.hour, fallbackStart.minute)
}

/** Prefer shift-aware recompute so stale DB is_late flags do not leak into roster UI. */
export function effectiveAttendanceIsLate(
  checkInAt: string,
  shift: ShiftLateSchedule | null,
  storedIsLate: boolean
): boolean {
  if (shift) {
    return lateMinutesForShift(new Date(checkInAt), shift) > 0
  }
  return storedIsLate
}

// "HH:mm" in ICT for user-facing messages.
export function formatIctTime(date: Date): string {
  const ictMs = date.getTime() + ICT_OFFSET_MS
  const minutesOfDay = Math.floor((ictMs % 86_400_000) / 60_000)
  const hh = String(Math.floor(minutesOfDay / 60)).padStart(2, "0")
  const mm = String(minutesOfDay % 60).padStart(2, "0")
  return `${hh}:${mm}`
}
