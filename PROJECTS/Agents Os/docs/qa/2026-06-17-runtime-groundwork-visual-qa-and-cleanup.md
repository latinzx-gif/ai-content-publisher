# Runtime Groundwork Visual QA + Cleanup

Date: 2026-06-17
Project: Head Office Agent Studio
Scope: Visual QA evidence for current milestone state + cleanup of test data `T-RUNTIME-1`

## Evidence Artifacts
- Before cleanup screenshot: `/Users/jakarinosk/Desktop/Agents Os/docs/qa/2026-06-17_103828-runtime-groundwork-window.png`
- Before cleanup OCR: `/Users/jakarinosk/Desktop/Agents Os/docs/qa/2026-06-17_103828-runtime-groundwork-window-ocr.txt`
- After cleanup dashboard screenshot: `/Users/jakarinosk/Desktop/Agents Os/docs/qa/2026-06-17_104613-post-cleanup-dashboard.png`
- After cleanup dashboard OCR: `/Users/jakarinosk/Desktop/Agents Os/docs/qa/2026-06-17_104613-post-cleanup-dashboard-ocr.txt`
- Runtime Manager screenshot: `/Users/jakarinosk/Desktop/Agents Os/docs/qa/2026-06-17_qa-runtime-manager.png`
- Runtime Manager OCR: `/Users/jakarinosk/Desktop/Agents Os/docs/qa/2026-06-17_qa-runtime-manager-ocr.txt`
- Task Board screenshot: `/Users/jakarinosk/Desktop/Agents Os/docs/qa/2026-06-17_qa-task-board.png`
- Task Board OCR: `/Users/jakarinosk/Desktop/Agents Os/docs/qa/2026-06-17_qa-task-board-ocr.txt`
- Human Request Inbox screenshot: `/Users/jakarinosk/Desktop/Agents Os/docs/qa/2026-06-17_qa-human-request-inbox.png`
- Human Request Inbox OCR: `/Users/jakarinosk/Desktop/Agents Os/docs/qa/2026-06-17_qa-human-request-inbox-ocr.txt`
- Cleanup log: `/Users/jakarinosk/Desktop/Agents Os/docs/qa/2026-06-17-t-runtime-1-cleanup.log`

## Review Table

| # | Criterion | Verdict | Evidence |
|---|---|---|---|
| 1 | App still builds before QA/cleanup | VERIFIED | `swift build` returned `Build complete! (0.17s)` |
| 2 | Main app window renders and can be captured as a concrete artifact | VERIFIED | Native window captured by CGWindow id `18136` |
| 3 | Dashboard shows expected milestone shell structure before cleanup | VERIFIED | OCR confirms `Project Dashboard`, `SQLite store ready`, `Open Tasks`, `Open Requests`, `Pending Demo Items`, project `Milestone 6 Smoke` in `2026-06-17_103828-runtime-groundwork-window-ocr.txt` |
| 4 | Test task record `T-RUNTIME-1` removed from SQLite | VERIFIED | Cleanup log shows BEFORE `tasks: 1` and AFTER `tasks: 0` for `T-RUNTIME-1` |
| 5 | Test run-log records for `T-RUNTIME-1` removed from SQLite | VERIFIED | Cleanup log shows BEFORE `runlogs: 2` and AFTER `runlogs: 0` for `T-RUNTIME-1` |
| 6 | Test human-request records for `T-RUNTIME-1` removed from SQLite | VERIFIED | Cleanup log shows BEFORE `requests: 2` and AFTER `requests: 0` for `T-RUNTIME-1` |
| 7 | Generated task artifact tied to `T-RUNTIME-1` removed from project folder | VERIFIED | Cleanup log shows removed file `/var/folders/tc/q5skj88x6y9_4d_dzm8lv6r00000gn/T/head-office-agent-studio-m6-smoke/milestone-6-smoke/05_Current_Task/TASK_BRIEF.md` |
| 8 | No remaining `T-RUNTIME-1` text found inside the smoke project folder | VERIFIED | Content search under the project root returned `0` matches for `T-RUNTIME-1` |
| 9 | Post-cleanup app window still renders | VERIFIED | Dashboard screenshot captured after cleanup: `2026-06-17_104613-post-cleanup-dashboard.png` |
| 10 | Accessibility control is now available for direct in-app navigation | VERIFIED | `osascript -e 'tell application "System Events" to return UI elements enabled'` returned `true` |
| 11 | Runtime Manager screen is directly reachable and visually captured | VERIFIED | AX navigation selected sidebar row `Runtime Manager`; AX tree shows page title `Runtime Manager`; OCR confirms `Track runtime readiness...`, `Add Runtime`, `Runtimes`, `Claude Code`, `Codex CLI`, `Gemini CLI`, `Mock Local Runtime` in `2026-06-17_qa-runtime-manager-ocr.txt` |
| 12 | Task Board screen is directly reachable and visually captured | VERIFIED | AX navigation selected sidebar row `Task Board`; AX tree shows page title `Task Board`; OCR confirms `Board Controls`, `New Task`, `Task Columns`, `No tasks for this project`, `Readiness: planned • Approval required` in `2026-06-17_qa-task-board-ocr.txt` |
| 13 | Human Request Inbox screen is directly reachable and visually captured | VERIFIED | AX navigation selected sidebar row `Human Request Inbox`; AX tree shows page title `Human Request Inbox`; OCR confirms `Track approval gates...`, `Inbox`, `Need approval`, `Reason: Smoke test`, status `resolved` in `2026-06-17_qa-human-request-inbox-ocr.txt` |
| 14 | Cleanup remains intact after direct visual QA navigation | VERIFIED | Final DB check: `task_total=0`, `runlog_total=0`, `request_total=1`, `t_runtime_1_task=0`, `t_runtime_1_runlog=0`, `t_runtime_1_request=0` |

## Notes
- Accessibility was initially unavailable earlier in the session, then enabled for WezTerm and re-verified as `true`.
- Direct screen navigation used Accessibility selection on sidebar rows rather than guessed coordinates.
- The remaining single `human-request` record is unrelated to `T-RUNTIME-1` and is visible in Human Request Inbox as the older smoke-test approval item.
- Temporary verification scripts were used from `/tmp` and should be removed after reporting.

## Overall
VERIFIED

Reason:
- Cleanup of `T-RUNTIME-1` is fully verified at DB + artifact level.
- Runtime Manager, Task Board, and Human Request Inbox now each have direct visual evidence (PNG + OCR) backed by Accessibility-driven navigation.
- Final DB state confirms cleanup remained intact after QA navigation.
