# Milestone 7 Runtime Integration Planning Gate

Goal
- Define the first safe runtime integration path for Head Office Agent Studio without implementing external CLI execution yet.

Current context / assumptions
- Milestones 1–6 are complete enough to plan runtime integration.
- The app is a SwiftPM-first native macOS app using SwiftUI + SQLite JSON-record persistence.
- Current runtime rows exist for Mock Local Runtime, Codex CLI, Claude Code, and Gemini CLI.
- Current environment facts:
  - Full Xcode is not active; command-line Swift workflow is the reliable path.
  - Codex CLI previously needed re-auth.
  - User has Claude Code subscription but not Anthropic API key.
- Therefore the most realistic first runtime target is Claude Code CLI, with Mock Local Runtime kept as fallback and Codex CLI as second target after auth is stable.

Frozen approach
- Keep Milestone 7 as a design/specification phase only.
- Standardize one execution contract independent of runtime vendor.
- Add a small runtime adapter layer later, so Claude Code / Codex / Gemini all plug into the same task-run protocol.
- Make human approval mandatory at launch, destructive-action escalation, and final result acceptance.

Recommended first real runtime target
- First target: Claude Code CLI
- Second target: Codex CLI after login/auth health is verified
- Third target: Gemini CLI
- Permanent fallback: Mock Local Runtime

Frozen decisions for this planning gate
- First runtime target is Claude Code CLI.
- Milestone 7 remains planning-only; no real CLI execution code is added in this gate.
- The execution contract below is the frozen V1.5 planning contract.
- The safety and approval model below is the frozen gatekeeping model for future runtime work.
- Any later runtime implementation must conform to this document unless an explicit revision is recorded.

Why Claude Code first
- It matches the user’s paid access model better than Anthropic API-based integration.
- It avoids depending on currently expired Codex auth.
- It fits the “local human-controlled automation” direction of the app.

Execution contract (frozen for Milestone 7)
- Input
  - projectSlug
  - taskCode
  - taskTitle
  - taskDetails
  - acceptanceCriteria
  - allowedPaths[]
  - forbiddenPaths[]
  - runtimeName
  - approvalTicket / manual approval flag
- Output
  - status: success | failed | blocked | cancelled | timed_out
  - summary
  - changedFiles[]
  - outputArtifacts[]
  - rawLogPath
  - reviewHints
  - needsHumanInput
- On-disk contract
  - 05_Current_Task/TASK_BRIEF.md
  - 06_Runs/<timestamp>-stdout.log
  - 06_Runs/<timestamp>-stderr.log
  - 06_Runs/<timestamp>-RESULT.md
  - 09_Requests/<timestamp>-HUMAN_REQUEST.md when blocked

Process supervision model
- Launch
  - Create a per-run working brief file.
  - Start runtime process with Process / Pipe from Foundation.
  - Capture stdout and stderr separately.
- Live state
  - queued → launching → running → review → audit | blocked | failed | cancelled | timed_out | done
- Safety gates
  - Require explicit human approval before launch.
  - Require a second approval before any destructive action class.
  - Refuse to run if task lacks allowed/forbidden path contract.
- Timeout / cancel
  - Per-run timeout stored on task/runtime profile.
  - Cancellation writes a cancelled result file and closes pipes cleanly.

Security rules
- Environment access
  - Start with a minimal inherited environment.
  - Pass only explicitly allowed variables.
- Filesystem scope
  - Default allowlist = project.createdFolderPath only.
  - Never allow writing outside project root from app-triggered runs.
- Secrets
  - Never persist secret values into SQLite logs.
  - Redact known token patterns before saving logs.
- Dangerous commands
  - Tag runtime profiles with destructive capability flags.
  - Destructive-capable runtimes require stronger approval UI and result review.

UI/UX plan
- Runtime Manager
  - Add readiness indicators: configured / auth-needed / unavailable / planned.
  - Add “health check” action later, not in this milestone.
- Task Board
  - Add “Prepare runtime brief” state before any future “Run with runtime” action.
  - Show selected runtime + approval status.
- Run Log
  - Reserve space for stdout/stderr paths, exit reason, and duration.
- Human Request Inbox
  - Standardize blocked-runtime prompts (missing auth, forbidden path, approval required, tool failure).

Step-by-step plan
1. Freeze the runtime vocabulary
- Keep canonical statuses and result types shared across all runtimes.
- Document them before coding anything.

2. Choose adapter architecture
- One protocol-like abstraction per runtime adapter.
- One supervisor/service owns launch, timeout, cancellation, and log persistence.
- UI should talk only to the supervisor, never to vendor-specific logic directly.

3. Define the task brief format
- Markdown brief file generated from StudioTask.
- Include scope, acceptance criteria, allowed files, forbidden files, and output requirements.
- Reuse the same brief shape across Claude Code / Codex / Gemini.

4. Define output artifact format
- RESULT.md for normalized machine/human-readable outcome.
- stdout.log and stderr.log for raw evidence.
- Optional CHANGED_FILES.md if runtime reports edits.

5. Define approval checkpoints
- Pre-launch approval.
- Mid-run blocked state when runtime asks for missing context.
- Post-run acceptance before task status can become done.

6. Define runtime health model
- planned
- configured
- auth_needed
- unavailable
- ready
- degraded
- lastCheckedAt and lastHealthMessage stored per runtime later.

7. Define validation matrix before implementation
- success path
- runtime missing from machine
- auth expired
- forbidden path requested
- timeout
- cancellation
- runtime returns malformed result
- runtime produces no changed files but claims success

Files likely to change in Milestone 8+ implementation
- Modify: Sources/HeadOfficeAgentStudio/Models.swift
- Modify: Sources/HeadOfficeAgentStudio/Services.swift
- Modify: Sources/HeadOfficeAgentStudio/Views.swift
- Create: Sources/HeadOfficeAgentStudio/RuntimeExecution.swift
- Create: Sources/HeadOfficeAgentStudio/RuntimeSupervisor.swift
- Create: Sources/HeadOfficeAgentStudio/RuntimeBriefWriter.swift
- Create: Sources/HeadOfficeAgentStudio/RuntimeLogRedactor.swift

Tests / validation to require before coding runtime execution
- swift build
- app launch
- persistence survives relaunch
- milestone-6 artifact generation still works
- runtime planning state is editable in UI without invoking external tools
- smoke tests for:
  - brief-file generation
  - log-file path generation
  - approval-gate refusal
  - forbidden-path refusal
  - cancellation state transition

Risks / tradeoffs
- CLI auth drift is the biggest operational risk, especially for Codex.
- CLI output formats may change; normalization layer must tolerate partial/dirty output.
- Raw stdout/stderr can leak secrets unless aggressively redacted.
- SwiftPM-only environment encourages simple Foundation-based process management over heavier app frameworks.

Open questions to settle before implementation
- Exact Claude Code CLI command shape to support from the app.
- Whether runtime launches should always happen inside project.createdFolderPath.
- Whether approval tickets are just booleans in V1.5 or distinct persisted records.
- Whether blocked human-input files should be stored only in 09_Requests or also mirrored into SQLite.

Definition of done for this planning gate
- First runtime target is chosen.
- Execution contract is frozen.
- Safety/approval model is frozen.
- Validation matrix is written.
- No real CLI execution code has been added yet.
