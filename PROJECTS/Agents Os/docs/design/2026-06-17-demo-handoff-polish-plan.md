# Demo / Handoff Center UI Polish Plan

Date: 2026-06-17
Status: Plan only — waiting for approval before implementation

Goal
- Remove the two visible polish issues found in Milestone 6 QA while keeping the Demo / Handoff Center workflow and data model unchanged.

Why this is the next step
- QA VERIFIED the screen is functional.
- QA found two presentation issues still worth fixing before a cleaner walkthrough:
  1. action button labels are truncated
  2. long artifact paths dominate the screen

QA evidence
- Source: docs/qa/2026-06-17-milestone-6-visual-qa.md
- Findings referenced:
  - lines 48-56: truncated buttons and long path presentation
  - lines 60-64: functional for internal demo, not yet polished for cleaner walkthrough

Current code scope
- File: Sources/HeadOfficeAgentStudio/Views.swift
- Primary sections:
  - lines 1255-1298: Milestone 6 action panel
  - lines 1448-1457: artifact path row in DemoHandoffRow

Implementation intent
- Keep the same screen, same actions, same data, same persistence.
- Only adjust layout and display density.
- No runtime integration work in this step.
- No model or SQLite schema changes.

Exact files to change
- Modify: Sources/HeadOfficeAgentStudio/Views.swift

Likely exact edit zones
1. Action controls area
- Current:
  - lines 1270-1283 use two HStack rows of buttons.
- Planned:
  - replace with a compact adaptive grid or two-column layout that gives each button more width
  - optionally shorten labels slightly while preserving meaning
  - keep Export Closure Summary as the primary emphasized action

2. Closure export status line
- Current:
  - lines 1291-1297 render the full closure summary path inline
- Planned:
  - show a compact basename or short label in the main row
  - move the full path to tooltip/help text or a secondary, less dominant line

3. Item artifact path presentation
- Current:
  - lines 1448-1457 show full artifactPath inline
- Planned:
  - show filename/basename as the visible label
  - preserve Open action
  - expose full path via tooltip/help text and selectable secondary metadata only if needed

Proposed layout changes
1. Milestone 6 Actions card
- Keep project picker and status line at the top.
- Replace the two cramped button rows with a 2-column action grid:
  - Generate Default Checklist
  - Generate Demo Script
  - Generate Handoff Checklist
  - Export Closure Summary
  - Close Project
  - Open Project Folder
- Keep Save Known Limitations below the editor.
- Benefit: buttons stop clipping without changing user flow.

2. Known Limitations footer metadata
- Replace “Last closure export: <full path>” inline text with:
  - “Last closure export: <filename>.md” visible
  - full path in help tooltip
- Benefit: preserves traceability without crowding the panel.

3. Item rows
- Replace full path display with a compact artifact chip style:
  - visible: filename only
  - secondary: optional short directory hint
  - action: Open
  - metadata: full path via help tooltip
- Benefit: item list becomes easier to scan during demos.

Acceptance criteria
- VERIFIED if all of these are true after implementation:
  - No primary action label is visibly truncated at the default app window size used in QA.
  - The screen still exposes all existing Milestone 6 actions.
  - Full paths are no longer the dominant visible text in the item list.
  - Open action still works on artifact rows.
  - swift build passes.
  - App still launches.

Out of scope
- No new actions
- No database changes
- No runtime execution features
- No redesign of other screens
- No destructive cleanup of existing milestone-6-smoke data in this step

Risk notes
- Pure UI changes can unintentionally alter spacing or primary-action emphasis.
- Need to keep the action order familiar so the workflow does not feel changed.

Implementation sequence after approval
1. Edit action section in Views.swift
2. Edit artifact row display in Views.swift
3. Run swift build
4. Launch app and capture one updated visual QA screenshot
5. Write a short follow-up QA note

Verification commands to run after approval
- cd /Users/jakarinosk/Desktop/Agents\ Os && swift build
- cd /Users/jakarinosk/Desktop/Agents\ Os && ./.build/debug/HeadOfficeAgentStudio

Decision needed from user
- Approve this layout polish direction before I touch SwiftUI code.
