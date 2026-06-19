# Phase 2 Support Automation Plan

> **For Hermes:** Phase 2 is currently LOCKED. Use this plan only after ฟาเดล approves entry into Phase 2. Do not implement anything before approval.

**Goal:** Add the locked Phase 2 support automation layer for urgent escalation, cron-based triage, Telegram approval handling, and fix-team dispatch while keeping Phase 1 intact.

**Architecture:** Keep the existing Phase 1 intake + Linear + LINE close-loop flow as the source of truth. Phase 2 adds a new support automation path that classifies urgency, escalates P0 immediately, runs cron triage for open issues, and routes human approval through Telegram before dispatching fixes. The implementation should reuse the current Linear issue model, labels, and resolution notifications instead of creating a parallel workflow.

**Tech Stack:** Next.js app router, Supabase, Linear API, LINE Messaging API, Telegram bot webhook, existing Hermes cron conventions, TypeScript.

**Routing:** Task → `task-router` skill → CLI agent. This is a multi-file backend workflow, so plan first, then implement after approval. No UI redesign work is required in this phase.

---

## Current context

- Phase 1 is live and locked as complete.
- Existing incident ingestion already exists at `/api/internal/incidents` and the queue monitor relay already posts into that path.
- Phase 2 must stay isolated from Phase 1; do not change live customer ingress behavior unless the Phase 2 plan explicitly calls for it.
- The canonical Phase 2 architecture is documented in:
  - `GROUND_TRUTH.md`
  - `OS/HERMES-OS/workflows/WORKFLOW_SUPPORT_LINE.md`
  - `orchestration/CURRENT_TASK.md`

---

## Proposed Phase 2 workstreams

### Task 1: Lock scope and map the new support automation flow

**Objective:** Confirm the exact Phase 2 surfaces, env vars, and data flow before coding.

**Files:**
- Read: `GROUND_TRUTH.md`
- Read: `orchestration/CURRENT_TASK.md`
- Read: `OS/HERMES-OS/workflows/WORKFLOW_SUPPORT_LINE.md`
- Read: existing support-app API and lib files related to Linear/LINE/cron
- Write: `support-app/_agent/TASK_PLAN.md` or a Phase 2 planning note only after approval

**Steps:**
1. Reconfirm the locked Phase 2 scope and the no-go list.
2. List the exact endpoints, cron jobs, and env vars Phase 2 needs.
3. Confirm whether Phase 2 should reuse `/api/internal/incidents` or introduce a separate `/api/support/intake` path for customer reports.
4. Decide whether Telegram approval is required only for P0 or for all escalations.

**Validation:**
- Scope fits Phase 2 only.
- No Phase 1 routes or behavior change without explicit approval.

---

### Task 2: Add urgency detection and structured support intake

**Objective:** Normalize support submissions and classify P0 vs normal traffic consistently.

**Files likely to change:**
- `support-app/src/lib/detectUrgency.ts` (new)
- `support-app/src/lib/support-intake.ts` or equivalent shared contract module (new)
- `support-app/src/app/api/support/intake/route.ts` (new if Phase 2 uses a separate intake endpoint)
- `support-app/src/app/liff/ticket/page.tsx` (only if the form needs new fields)
- `support-app/src/types/*` or shared contract files if needed

**Steps:**
1. Create a shared support incident contract with client, issue type, severity hint, description, screenshot, and source metadata.
2. Implement `detectUrgency()` using the documented P0 rules: urgent severity, system-down/no-access/data-loss types, and keyword fallback.
3. Make the intake route validate payloads and map to the shared contract.
4. Ensure P0 and normal submissions follow different routing branches but still preserve one canonical issue format.

**Validation:**
- P0 input is classified deterministically.
- Invalid payloads are rejected with clear errors.
- All normal fields still survive the round trip.

---

### Task 3: Add Telegram alerting and approval reply handling

**Objective:** Let Jakarin approve or take over urgent items from Telegram.

**Files likely to change:**
- `support-app/src/lib/telegram.ts` (new)
- `support-app/src/app/api/telegram/webhook/route.ts` (new)
- `support-app/src/lib/telegram-approval.ts` or similar state helper (new)
- `support-app/src/lib/linear/*` helpers if comment/update behavior needs reuse

**Steps:**
1. Implement Telegram send helper for P0 alerts.
2. Define the message format with issue summary, timestamp, and Linear link.
3. Implement webhook parsing for `TAKE` and `DISPATCH` replies.
4. Update Linear status/comments when a reply is received.
5. Make reply handling idempotent so repeated webhook deliveries do not duplicate actions.

**Validation:**
- `TAKE` updates the issue to owner/Jakarin path.
- `DISPATCH` triggers the fix-team flow exactly once.
- Non-matching replies are ignored safely.

---

### Task 4: Add Hermes cron triage

**Objective:** Poll Triage issues on a schedule, classify them, and move them to the next operational state.

**Files likely to change:**
- `support-app/src/app/api/hermes/cron/route.ts` (new)
- `support-app/src/lib/hermesTriagePrompt.ts` (new)
- `support-app/src/lib/linear-triage.ts` or existing Linear helper modules
- `support-app/vercel.json` or existing cron config

**Steps:**
1. Build the cron handler to fetch open Triage issues from Linear.
2. Feed each issue into the triage prompt and map the result to severity/type/assignee.
3. Update the issue status to Todo or the next step after triage.
4. Respect the cron interval setting from env.
5. Keep the cron run safe for repeated execution.

**Validation:**
- Cron only touches Triage items.
- Triage output is structured and deterministic enough for automation.
- Re-runs do not create duplicates.

---

### Task 5: Wire fix-team dispatch and close-loop notifications

**Objective:** Route approved items through Debugger → Patcher → Verifier, then mark Done and notify the customer.

**Files likely to change:**
- `support-app/src/lib/fix-team-dispatch.ts` or equivalent orchestration helper (new)
- `support-app/src/app/api/linear/webhook/route.ts` if needed for resolution comments
- Existing LINE Flex notification helpers if resolution messages need reuse
- Any support-specific state table only if absolutely necessary

**Steps:**
1. Implement the dispatch trigger used by Telegram approval or cron escalation.
2. Define the handoff contract for Debugger, Patcher, and Verifier.
3. Ensure the Linear issue gets updated to In Progress / Done at the right points.
4. Reuse the existing `[resolution]` close-loop notify behavior instead of inventing a second completion path.

**Validation:**
- The dispatch path is linear and observable.
- The final customer notification still comes from the existing close-loop mechanism.
- Done issues never get re-dispatched accidentally.

---

### Task 6: Environment, docs, and operational guardrails

**Objective:** Make Phase 2 deployable and understandable without weakening Phase 1 locks.

**Files likely to change:**
- `support-app/.env.example`
- `orchestration/CURRENT_TASK.md` only after approval and real implementation start
- `orchestration/REVIEW_STATUS.md` only after review gates pass
- Any Phase 2 runbook or decision log entries

**Steps:**
1. Add the new env vars required by Phase 2.
2. Document how to run the cron and how to verify Telegram/Linear integration.
3. Keep Phase 2 visibly locked until approval.
4. Avoid adding any Phase 3 language or features.

**Validation:**
- Env template matches the code.
- Runbook clearly separates live Phase 1 from locked Phase 2.
- No hidden dependency on unapproved Phase 3 work.

---

## Suggested execution order after approval

1. Scope lock and contract confirmation
2. Urgency detection + intake
3. Telegram alerts + approval handler
4. Hermes cron triage
5. Fix-team dispatch + close-loop notify
6. Docs/env cleanup
7. Full verification

---

## Test / verification plan

Run the smallest relevant checks after each task, then final gates at the end:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Targeted tests for the new support automation modules
- Manual smoke test for:
  - P0 intake
  - Telegram TAKE/DISPATCH reply
  - Cron triage path
  - Linear Done → LINE resolution callback

---

## Risks / tradeoffs

- Telegram approval adds another operational dependency; keep the handler idempotent.
- Cron triage can duplicate work if issue state transitions are not strict.
- If Phase 2 reuses existing endpoints too aggressively, it can blur Phase 1 vs Phase 2 responsibilities.
- If the urgency classifier is too broad, normal tickets may get escalated as P0.

---

## Open questions before implementation

1. Use a new `/api/support/intake` route, or extend the existing `/api/internal/incidents` path?
2. Is Telegram approval only for P0, or also for some P1 cases?
3. Should Phase 2 store any new state in Supabase, or stay Linear-centric?
4. What exact cron interval is desired for the first rollout: 10 min, or keep the existing env default?

---

## Approval gate

Do not implement Phase 2 until ฟาเดล explicitly approves this plan.
