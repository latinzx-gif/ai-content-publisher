# Head Office Agent Studio V1 Development Plan

Goal
- Deliver a native macOS desktop app for project delivery control using SwiftUI + SQLite persistence.
- Keep V1 focused on data model, UI flow, local file structure, mock/manual task loop, and reviewable project artifacts.
- Defer real runtime execution until the shell, persistence, and workflow validation are stable.

Current State
- Native SwiftUI macOS shell builds successfully with `swift build`.
- SQLite persistence is active at `~/Library/Application Support/HeadOfficeAgentStudio/HeadOfficeAgentStudio.sqlite`.
- Implemented screens:
  - Project Dashboard
  - Create Project
  - PRD Import
  - Agent Library
  - Skill Library
  - Team Builder
  - Runtime Manager
  - Task Board
  - Run Log
  - Human Request Inbox
  - Demo / Handoff Center
- Implemented local project folder generator matching the PRD folder structure.
- Implemented manual/mock task loop with run logs and human-request creation.

Architecture
- App shell: SwiftUI NavigationSplitView desktop app.
- Persistence: SQLite database storing JSON payloads per entity record.
- Local file system: project workspaces created under `~/AgentStudio/Projects/{project-slug}/`.
- Execution model: manual/mock only in V1; runtime manager stores planned integrations and approval notes.

Milestones

## Milestone 1 — App Shell Stabilization
Status: Done

Tasks
1. Confirm `swift build` stays green after each change.
2. Keep the shell launchable from the built binary.
3. Validate SQLite bootstrap and seeded records.
4. Validate that opening/closing the app preserves seeded data.

Validation
- `swift build`
- Launch `./.build/debug/HeadOfficeAgentStudio`
- Inspect SQLite counts with `sqlite3`

## Milestone 2 — Project Workspace Workflow
Status: In Progress

Tasks
1. Add edit support for existing projects.
2. Add delete/archive action for projects.
3. Add folder health checks for required subfolders.
4. Add project detail view with PRD paths, team assignment, and checklist summary.
5. Add project search/filter by status and priority.

Files Likely to Change
- `Sources/HeadOfficeAgentStudio/Views.swift`
- `Sources/HeadOfficeAgentStudio/Services.swift`
- `Sources/HeadOfficeAgentStudio/Models.swift`

Acceptance Criteria
- Can create, view, update, and archive a project.
- Missing project folders are detectable and repairable.
- Dashboard makes it obvious what stage each project is in.

## Milestone 3 — PRD Context and Analysis Flow
Status: Next

Tasks
1. Expand PRD normalization rules for markdown, text, HTML, PDF, and DOCX.
2. Add a PRD preview panel in the app.
3. Generate additional files:
   - `MISSING_INFO.md`
   - `SCOPE_SUMMARY.md`
   - `MODULE_MAP.md`
   - `ROLE_MAP.md`
   - `RISK_REPORT.md`
4. Add a manual analyst checklist for missing-information review.
5. Add status transition from `prd_uploaded` to `prd_analyzed`.

Files Likely to Change
- `Sources/HeadOfficeAgentStudio/Services.swift`
- `Sources/HeadOfficeAgentStudio/Views.swift`

Acceptance Criteria
- Imported PRD produces the expected project files.
- Users can review normalized content inside the app.
- Missing-info and risk placeholders exist for every imported PRD.

## Milestone 4 — Agent / Skill / Team Editing UX
Status: Next

Tasks
1. Add detail/edit panels for agents, skills, and teams.
2. Add validation rules for required fields.
3. Add project-specific team assignment flow from dashboard to team builder.
4. Add default team recommendation presets from project type.
5. Add runtime map summary per team.

Files Likely to Change
- `Sources/HeadOfficeAgentStudio/Views.swift`
- `Sources/HeadOfficeAgentStudio/Services.swift`

Acceptance Criteria
- Users can create and edit reusable agents, skills, and teams without leaving the app.
- Teams can be assigned to real projects, not only stored as templates.

## Milestone 5 — Task Board and Review Loop Hardening
Status: Next

Tasks
1. Add task editing and deletion.
2. Add project-level milestone grouping.
3. Add explicit review and audit notes per task.
4. Add acceptance-criteria checklist toggles.
5. Add blocked-state resolution flow that links back to Human Request Inbox.
6. Add dashboard rollups for tasks in review/audit/blocked.

Files Likely to Change
- `Sources/HeadOfficeAgentStudio/Views.swift`
- `Sources/HeadOfficeAgentStudio/Services.swift`
- `Sources/HeadOfficeAgentStudio/Models.swift`

Acceptance Criteria
- Manual/mock task loop is understandable without reading logs directly.
- Review, audit, fix, and blocked flows are visible and traceable.

## Milestone 6 — Demo / Handoff Readiness
Status: Next

Tasks
1. Add generated demo script templates.
2. Add generated handoff checklist templates.
3. Add “known limitations” editor.
4. Add closure summary export to markdown.
5. Add project close gate that requires no open blocking requests.

Files Likely to Change
- `Sources/HeadOfficeAgentStudio/Views.swift`
- `Sources/HeadOfficeAgentStudio/Services.swift`

Acceptance Criteria
- Every project can produce a demo checklist, handoff checklist, and closure package draft.
- Close-project action is gated by the workflow state.

## Milestone 7 — Runtime Integration Planning Gate
Status: Plan Only — Do Not Code Yet

Entry Conditions
- Milestones 2–6 complete.
- Shell, persistence, PRD flow, and task loop are stable.
- Approval rules for external execution are confirmed.

Planning Tasks
1. Decide first real runtime target:
   - Codex CLI
   - Claude Code
   - Gemini CLI
   - Mock local runner remains fallback
2. Define execution contract:
   - allowed files
   - forbidden files
   - task brief format
   - output file contract
   - log capture format
3. Define process supervision model:
   - background launch
   - stdout/stderr capture
   - timeout and cancellation
   - approval checkpoints
4. Define security rules:
   - environment access
   - secrets handling
   - destructive action approvals
5. Define validation plan for runtime integration:
   - success path
   - failure path
   - cancelled run
   - blocked/human-input path

Do Not Implement Yet
- No real CLI invocation from the app
- No deployment actions
- No autonomous edits without approval gates

Verification Checklist Before Runtime Coding
- [ ] App build stays green
- [ ] Project data survives relaunch
- [ ] PRD import artifacts are reliable
- [ ] Teams and runtimes are editable
- [ ] Mock run loop covers review/audit/blocked/done states
- [ ] Demo/handoff outputs exist per project

Suggested Execution Order
1. Milestone 2
2. Milestone 3
3. Milestone 4
4. Milestone 5
5. Milestone 6
6. Milestone 7 planning review
7. Only then start runtime integration implementation

Core Commands
```bash
cd "/Users/jakarinosk/Desktop/Agents Os"
swift build
./.build/debug/HeadOfficeAgentStudio
sqlite3 "$HOME/Library/Application Support/HeadOfficeAgentStudio/HeadOfficeAgentStudio.sqlite" 'select type, count(*) from records group by type order by type;'
```
