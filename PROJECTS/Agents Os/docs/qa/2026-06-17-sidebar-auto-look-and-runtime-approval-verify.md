# Sidebar Auto-Look + Runtime Approval Verification

Date: 2026-06-17
Status: VERIFIED

Scope
- Sidebar auto-look width for long menu labels
- Next milestone implementation: pre-launch approval flow / blocked-runtime UX / cancellation groundwork

Files changed
- /Users/jakarinosk/Desktop/Agents Os/Sources/HeadOfficeAgentStudio/Views.swift
- /Users/jakarinosk/Desktop/Agents Os/Sources/HeadOfficeAgentStudio/Services.swift

What changed
- Sidebar width now derives from measured label width using AppKit font metrics instead of a fixed hard-coded width.
- Added `navigationSplitViewColumnWidth(min:ideal:max:)` with computed values.
- Added task states:
  - `awaiting_approval`
  - `launch_blocked`
  - `cancelled`
- Added store actions:
  - `queueRuntimeApproval(taskID:)`
  - `markRuntimeLaunchBlocked(taskID:)`
  - `cancelRuntimePlan(taskID:)`
  - `updateHumanRequestResponse(id:response:)`
  - `resolveHumanRequest(id:response:status:)`
- Task cards now expose launch-approval / blocked / cancel controls.
- Human Request Inbox now supports response notes and quick actions: Approve / Need Clarification / Cancel / Reopen.
- Blocking-request logic now excludes `cancelled` so cancellation can unblock project close readiness.

Verification Evidence

1. Build
- Command: `swift build`
- Result: PASS
- Output: `Build complete! (3.82s)`

2. Sidebar visual evidence
- Screenshot:
  - /Users/jakarinosk/Desktop/Agents Os/docs/qa/2026-06-17-sidebar-auto-look-dashboard.png
- OCR:
  - /Users/jakarinosk/Desktop/Agents Os/docs/qa/2026-06-17-sidebar-auto-look-dashboard-ocr.txt
- OCR captured these full sidebar labels with no ellipsis:
  - `Human Request Inbox`
  - `Demo / Handoff Center`

3. Runtime approval milestone smoke verification (isolated temporary home)
- Verification command compiled `Models.swift` + `Services.swift` into a temporary executable with isolated `HOME` + `CFFIXED_USER_HOME`.
- Result JSON:

```json
{
  "approval_message" : "Launch approval queued for T1",
  "blocked_message" : "Launch blocked and scope request created for T1",
  "blocking_requests_after_cancel_resolution" : 0,
  "brief_exists" : true,
  "cancel_message" : "Runtime plan cancelled for T1",
  "open_requests_after_approval" : 1,
  "open_requests_after_blocked" : 2,
  "project_folder_exists" : true,
  "project_slug" : "verification-next-milestone-isolated",
  "run_log_statuses" : [
    "cancelled",
    "launch_blocked",
    "awaiting_approval",
    "prepared"
  ],
  "status_after_approval" : "awaiting_approval",
  "status_after_blocked" : "launch_blocked",
  "status_after_cancel" : "cancelled"
}
```

Interpretation
- Runtime brief file was created successfully.
- Approval queue action moved the task to `awaiting_approval` and created 1 open request.
- Block action moved the task to `launch_blocked` and increased open requests to 2.
- Cancel action moved the task to `cancelled`.
- After resolving all verification requests as `cancelled`, remaining blocking requests dropped to 0.
- Run log captured the expected milestone states: `prepared`, `awaiting_approval`, `launch_blocked`, `cancelled`.

Cleanup
- Temporary verification files under `/tmp` were deleted after verification.
- An initial non-isolated verification run accidentally touched the real app DB; all `verification-next-milestone` records were deleted immediately and confirmed removed before the isolated rerun.
