# M2–M5 + Post-M7 Runtime Sequence Plan

> For Hermes: user-confirmed execution order is M2 → M3 → M4 → M5 → runtime implementation milestone. Runtime execution coding remains blocked until after M2–M5.

Goal
- Complete the remaining functional product milestones in the confirmed order, then open a narrow runtime implementation milestone after the already-closed Milestone 7 planning gate.

Current context / assumptions
- M6 Demo / Handoff polish is closed and visually verified.
- M7 planning gate is closed and frozen; no runtime launch code exists yet.
- The app currently builds with `swift build` and packages successfully.
- Existing project workflow supports create + PRD import + downstream demo/handoff scaffolding, but M2 acceptance criteria are not fully met.

Execution order
1. Milestone 2 — Project Workspace Workflow
2. Milestone 3 — PRD Context and Analysis Flow
3. Milestone 4 — Agent / Skill / Team Editing UX
4. Milestone 5 — Task Board and Review Loop Hardening
5. Runtime implementation milestone (after M2–M5, using frozen M7 gate)

---

## Milestone 2 — Project Workspace Workflow

Goal
- Make projects editable, searchable, archivable/deletable, health-checkable, and easier to inspect from the dashboard.

Current gaps observed in code
- `Services.swift` has `createProject(...)` and `updateProjectStatus(...)` but no general `updateProject(...)`, archive, delete, health-check, or repair API.
- `Views.swift` dashboard shows a simple project list with no search/filter/detail workflow.
- Folder existence is not audited after project creation.

Planned files
- Modify: `Sources/HeadOfficeAgentStudio/Services.swift`
- Modify: `Sources/HeadOfficeAgentStudio/Views.swift`
- Optional/minimal modify: `Sources/HeadOfficeAgentStudio/Models.swift`

Likely exact edit zones
- `Views.swift:92-136` DashboardView
- `Views.swift:139-199` ProjectRow
- `Services.swift:398-467` project creation/status methods
- `Models.swift:7-31` StudioProject only if an extra field is truly necessary

Implementation sequence
1. Add a project workspace health-report type + folder scan/repair helpers.
2. Add store methods for:
   - update project metadata
   - archive project
   - delete project record
   - inspect workspace health
   - repair missing workspace folders
3. Add dashboard search + status/priority filters.
4. Add a project detail panel/card showing PRD paths, assigned teams, task/checklist summary, and folder health.
5. Add edit/archive/delete/repair actions in the project workflow UI.
6. Rebuild and visually verify the dashboard flow.

Verification
- `swift build`
- launch app
- create/update/archive a project
- remove one required folder manually, run repair, verify folder recreated

---

## Milestone 3 — PRD Context and Analysis Flow

Goal
- Upgrade PRD import into a more complete analysis workflow with richer artifacts and an in-app preview.

Planned files
- Modify: `Sources/HeadOfficeAgentStudio/Services.swift`
- Modify: `Sources/HeadOfficeAgentStudio/Views.swift`

Planned outputs
- `MISSING_INFO.md`
- `SCOPE_SUMMARY.md`
- `MODULE_MAP.md`
- `ROLE_MAP.md`
- `RISK_REPORT.md`

Verification
- import representative markdown/text/html/PDF/DOCX PRDs
- verify generated artifact files exist in project workspace
- verify preview renders in-app

---

## Milestone 4 — Agent / Skill / Team Editing UX

Goal
- Add reusable editing flows for agents, skills, and teams, including project assignment.

Planned files
- Modify: `Sources/HeadOfficeAgentStudio/Views.swift`
- Modify: `Sources/HeadOfficeAgentStudio/Services.swift`

Verification
- create + edit agents/skills/teams
- assign team to project
- verify persistence after relaunch

---

## Milestone 5 — Task Board and Review Loop Hardening

Goal
- Make the manual/mock delivery loop truly operable without reading raw logs.

Planned files
- Modify: `Sources/HeadOfficeAgentStudio/Views.swift`
- Modify: `Sources/HeadOfficeAgentStudio/Services.swift`
- Optional modify: `Sources/HeadOfficeAgentStudio/Models.swift`

Verification
- edit/delete tasks
- milestone grouping visible
- review/audit notes visible
- blocked task links back to Human Request Inbox

---

## Runtime implementation milestone (post-M2–M5)

Goal
- Start implementation of the frozen runtime design without immediately opening unrestricted execution.

First implementation slice
- `RuntimeBriefWriter`
- `RuntimeSupervisor`
- approval state transitions
- result/log path wiring
- allowed/forbidden path enforcement

Guardrail
- no broad real CLI launch path until the runtime implementation milestone is explicitly opened and scoped

---

Tests / validation
- `swift build`
- package app if UI changes are merged
- launch packaged app
- verify SQLite data survives relaunch
- verify project workspace files/folders exist on disk

Risks / tradeoffs
- Project rename can imply slug/folder rename; safest first implementation is metadata edit plus explicit non-rename rule for workspace slug unless separately approved.
- Delete behavior is destructive if it touches folders; safest first implementation is record deletion with clear UI wording, or archive-first bias.
- Dashboard density changes need a visual mockup before implementation per user preference.

Immediate next action
- Execute Milestone 2 first, starting with a visual plan for the Dashboard / Project Workspace changes and non-destructive service-layer additions.