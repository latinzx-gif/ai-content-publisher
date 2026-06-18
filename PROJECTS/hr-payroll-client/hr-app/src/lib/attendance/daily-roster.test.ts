import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  UNASSIGNED_SHIFT_ID,
  buildDailyRosterSnapshot,
} from "@/lib/attendance/daily-roster"

describe("buildDailyRosterSnapshot", () => {
  const shifts = [
    {
      id: "shift-a",
      code: "OFFICE",
      name: "Office",
      start_hour: 9,
      start_minute: 0,
      end_hour: 18,
      end_minute: 0,
      crosses_midnight: false,
      grace_minutes: 10,
      standard_hours: 9,
      is_active: true,
    },
  ]

  const employees = [
    {
      id: "emp-1",
      name: "Alice",
      department: "HR",
      branch_id: "branch-1",
      line_user_id: null,
      work_shift_id: "shift-a",
      hr_branches: { name: "HQ" },
    },
    {
      id: "emp-2",
      name: "Bob",
      department: "Ops",
      branch_id: "branch-1",
      line_user_id: null,
      work_shift_id: "shift-a",
      hr_branches: { name: "HQ" },
    },
    {
      id: "emp-3",
      name: "Cara",
      department: "Ops",
      branch_id: "branch-1",
      line_user_id: null,
      work_shift_id: "shift-a",
      hr_branches: { name: "HQ" },
    },
    {
      id: "emp-4",
      name: "Dan",
      department: "Ops",
      branch_id: null,
      line_user_id: null,
      work_shift_id: null,
      hr_branches: null,
    },
  ]

  it("classifies checked-in, late, leave, absent, and unassigned employees", () => {
    const roster = buildDailyRosterSnapshot(
      {
        date: "2026-06-18",
        now: new Date("2026-06-18T03:30:00.000Z"),
        goLiveDate: "2026-06-18",
        employees,
        shifts,
      },
      [
        {
          employee_id: "emp-1",
          check_in_at: "2026-06-18T01:58:00.000Z",
          check_out_at: null,
          is_late: false,
          shift_date: "2026-06-18",
        },
        {
          employee_id: "emp-2",
          check_in_at: "2026-06-18T02:20:00.000Z",
          check_out_at: null,
          is_late: true,
          shift_date: "2026-06-18",
        },
      ],
      [{ employee_id: "emp-3" }]
    )

    assert.equal(roster.totals.total, 4)
    assert.equal(roster.totals.checkedIn, 2)
    assert.equal(roster.totals.late, 1)
    assert.equal(roster.totals.onLeave, 1)
    assert.equal(roster.totals.absent, 0)

    const officeGroup = roster.groups.find((group) => group.id === "shift-a")
    assert.ok(officeGroup)
    assert.equal(officeGroup.totals.checkedIn, 2)
    assert.equal(officeGroup.totals.onLeave, 1)
    assert.equal(
      officeGroup.employees.find((employee) => employee.id === "emp-2")?.status,
      "late"
    )

    const unassignedGroup = roster.groups.find((group) => group.id === UNASSIGNED_SHIFT_ID)
    assert.ok(unassignedGroup)
    assert.equal(unassignedGroup.employees[0]?.status, "unassigned")
  })

  it("marks no-show employees absent after grace time passes", () => {
    const roster = buildDailyRosterSnapshot(
      {
        date: "2026-06-18",
        now: new Date("2026-06-18T04:00:00.000Z"),
        goLiveDate: "2026-06-18",
        employees: employees.slice(0, 1),
        shifts,
      },
      [],
      []
    )

    assert.equal(roster.totals.absent, 1)
    assert.equal(roster.groups[0]?.employees[0]?.status, "absent")
    assert.equal(roster.groups[0]?.state, "closed")
  })
})
