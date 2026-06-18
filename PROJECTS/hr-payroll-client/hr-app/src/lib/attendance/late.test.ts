import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  lateMinutes,
  lateMinutesAtCheckIn,
  lateMinutesForShift,
  type ShiftLateSchedule,
} from "@/lib/attendance/late"

const BRANCH_NIGHT: ShiftLateSchedule = {
  start_hour: 14,
  start_minute: 0,
  crosses_midnight: true,
  grace_minutes: 10,
}

function ictUtc(isoDate: string, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number)
  const [y, mo, d] = isoDate.split("-").map(Number)
  return new Date(Date.UTC(y, mo - 1, d, h - 7, m))
}

describe("lateMinutesForShift", () => {
  it("Branch Night: check-in before 14:00 is not late", () => {
    const at10 = ictUtc("2026-06-18", "10:00")
    const at1355 = ictUtc("2026-06-18", "13:55")
    assert.equal(lateMinutesForShift(at10, BRANCH_NIGHT), 0)
    assert.equal(lateMinutesForShift(at1355, BRANCH_NIGHT), 0)
  })

  it("Branch Night: within grace after 14:00 is not late", () => {
    const at1405 = ictUtc("2026-06-18", "14:05")
    assert.equal(lateMinutesForShift(at1405, BRANCH_NIGHT), 0)
  })

  it("Branch Night: after grace counts late minutes", () => {
    const at1411 = ictUtc("2026-06-18", "14:11")
    assert.equal(lateMinutesForShift(at1411, BRANCH_NIGHT), 1)
  })

  it("global 09:00 marks 10:00 late but shift path does not", () => {
    const at10 = ictUtc("2026-06-18", "10:00")
    assert.equal(lateMinutes(at10, 9, 0), 60)
    assert.equal(
      lateMinutesAtCheckIn(at10, BRANCH_NIGHT, { hour: 9, minute: 0 }),
      0
    )
  })
})
