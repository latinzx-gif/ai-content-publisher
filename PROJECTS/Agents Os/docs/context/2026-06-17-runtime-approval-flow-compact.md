# Runtime Approval Flow Compact

Date: 2026-06-17
Milestone: Pre-Launch Approval / Blocked Runtime / Cancellation Groundwork
Status: Implemented / VERIFIED

What changed
- Sidebar width now auto-sizes from actual menu-label measurements using AppKit font metrics.
- `NavigationSplitView` sidebar now uses computed `min / ideal / max` width values.
- Task lifecycle gained three planning-stage statuses:
  - `awaiting_approval`
  - `launch_blocked`
  - `cancelled`
- New store actions added for runtime planning flow:
  - queue launch approval
  - mark launch blocked
  - cancel runtime plan
  - save/resolve human request responses
- Task cards now support:
  - Queue Launch Approval
  - Approval Received
  - Mark Launch Blocked
  - Retry Approval Gate
  - Cancel Launch Plan
- Human Request Inbox now supports response notes and quick decision buttons.
- Blocking request checks now treat `cancelled` as non-blocking.

Files changed
- /Users/jakarinosk/Desktop/Agents Os/Sources/HeadOfficeAgentStudio/Views.swift
- /Users/jakarinosk/Desktop/Agents Os/Sources/HeadOfficeAgentStudio/Services.swift

Verification
- `swift build` passed.
- Sidebar screenshot + OCR confirmed long labels render fully:
  - `Human Request Inbox`
  - `Demo / Handoff Center`
- Isolated runtime-flow smoke test confirmed:
  - brief generation
  - approval queue state
  - blocked-launch state
  - cancellation state
  - blocking count drops to zero after cancelling all verification requests

Evidence
- QA report:
  - /Users/jakarinosk/Desktop/Agents Os/docs/qa/2026-06-17-sidebar-auto-look-and-runtime-approval-verify.md
- Sidebar screenshot:
  - /Users/jakarinosk/Desktop/Agents Os/docs/qa/2026-06-17-sidebar-auto-look-dashboard.png
- Sidebar OCR:
  - /Users/jakarinosk/Desktop/Agents Os/docs/qa/2026-06-17-sidebar-auto-look-dashboard-ocr.txt

Current result
- Runtime planning can now pause before launch, surface approval requests, mark blocked launches, and cancel plans without pretending to perform real CLI execution.
- Sidebar no longer relies on the default narrow width.

Next clean options
1. Add visual counters for approval-pending / blocked / cancelled tasks on Task Board.
2. Add request-to-task linking UI (jump from Human Request Inbox back to task card).
3. Add explicit relaunch/resume flow after a resolved approval request.
4. If runtime execution becomes the next step, start with plan-only launcher orchestration for Codex / Claude Code.
