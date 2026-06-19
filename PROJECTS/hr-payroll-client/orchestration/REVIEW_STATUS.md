# REVIEW_STATUS.md

**Batch:** T77–T108  
**Status:** ✅ **APPROVED**  
**Active:** **HR-UI-BATCH-001** — 📋 **PLAN APPROVED → EXECUTE** (2026-06-18)  
  - **A** EMP-LIST-TIME-001 — `/admin/employees` เวลาเข้า-ออก  
  - **B** ATT-ROSTER-UI-001 — attendance compact cards  
  - **C** EMP-OFF-DAYS-001 — วันหยุด profile (optional same PR)  
**Previous:** **ATT-ROSTER-001** — 🟡 **APPROVED WITH CAVEATS** (2026-06-17)  
**Previous:** **PERF-ADMIN-001** — 🟡 **APPROVED WITH CAVEATS** (2026-06-17)  
**Previous:** **FEFO-001–FEFO-014** — 🟡 **APPROVED WITH CAVEATS** (2026-06-17)  
**Previous:** T141 Stock Count Web — 🔄 EXECUTE (paused for FEFO)  
**Previous:** T155-A Morning Push Edge — ✅ **APPROVED** (2026-06-15, commit `d6a18a0`, edge+cron deployed)  
**Previous:** T143–T149 Inventory Expansion — ✅ **APPROVED** (2026-06-15, commit `49bda1c`)  
**Previous:** T155-B Morning Push HR settings UI — ✅ **APPROVED** (2026-06-15)  
**Previous:** T151 Burmese i18n — ⏸ paused  
**Previous:** Leave Policy Defaults — ✅ **APPROVED** (2026-06-15)  
**Date:** 2026-06-17  
**Team:** Cursor + Codex only — Claude Code ⏸ paused  
**Reviewed:** Cursor orchestrator

## Latest — ATT-ROSTER-UI-001 Roster compact cards + employee code (IN PROGRESS 2026-06-18)

**Request:** `/admin/attendance` — รหัสพนักงานข้างชื่อ, card เล็กลงสำหรับ มาสาย/ขาด/ลา/วันหยุด, แสดง ตำแหน่ง·สาขา·เวลาเข้า-ออก  
**Task file:** `orchestration/CURRENT_TASK.md`  
**Agent:** Codex — Phase PLAN

---

## Latest — EMP-OFF-DAYS-001 Employee weekly off days (QUEUED → merged into ATT-ROSTER-UI-001)

**Request:** Profile พนักงาน — ติ๊กเลือกวันหยุด จ–อา (เหมือน morning-push UI)  
**Task file:** `orchestration/CURRENT_TASK.md`  
**Agent:** Codex — Phase PLAN

---

## Latest Review — ATT-ROSTER-001 Attendance Roster + LINE (APPROVED WITH CAVEATS 2026-06-17)

**Agent:** Codex  
**Scope:** Today roster web, shift-attendance-summary edge, evening-summary names, cron migration

**Gates:** test ✅ 22/22 · build ✅ · typecheck ✅ · lint ❌ (pre-existing `InventoryLotPicker.tsx` — FEFO)

**Verdict:** 🟡 APPROVED WITH CAVEATS — `hr-app/_agent/archive/ATT-ROSTER-001/CURSOR_REVIEW_VERDICT.md`

**Pending:** db push cron migration · deploy edge functions · LINE smoke · commit/deploy

---

## Previous Review — PERF-ADMIN-001 Admin Performance (APPROVED WITH CAVEATS 2026-06-17)

**Agent:** Codex  
**Scope:** Admin loading skeleton, Suspense dashboard, batch attendance issues, layout notification badges-only, defer payroll from stats

**Gates:** build ✅ · typecheck ✅ · lint ❌ (pre-existing `InventoryLotPicker.tsx` — FEFO, outside scope)

**Verdict:** 🟡 APPROVED WITH CAVEATS — `hr-app/_agent/CURSOR_REVIEW_VERDICT.md`

**Pending before deploy:** Manual smoke `/admin` + notification bell; commit PERF files when ready

---

## Previous Review — FEFO-001–FEFO-014 (APPROVED WITH CAVEATS 2026-06-17)

**Agent:** Cursor (direct implement — sub-agents failed)  
**Scope:** Lot inventory + FEFO allocator + wire issue/consume/transfer/damage/count

**Gates:** build ✅ · typecheck ✅ · lint ✅ (0 errors) · test ✅ 20/20

**Verdict:** 🟡 APPROVED WITH CAVEATS — `hr-app/_agent/CURSOR_REVIEW_VERDICT.md`

**Blocker:** Migrations not applied to Supabase yet — user must `db push` before prod

---

**Agent:** Codex  
**Scope:** `morning-push` edge + cron migration (`*/15`)

**Gates:** build ✅ · typecheck ✅ · lint ✅ (0 errors)

**Verdict:** ✅ APPROVED — `hr-app/_agent/archive/T155-A/CURSOR_REVIEW_VERDICT.md`

**Deploy:** `d6a18a0` — migration applied (`--include-all`) + `supabase functions deploy morning-push`

**Archive:** `hr-app/_agent/archive/T155-A/`

---

## Active — T141 Stock Count Web (EXECUTE)

**Plan:** ✅ APPROVED 2026-06-15 — `hr-app/_agent/PLAN_APPROVAL.md`  
**Agent:** Codex  
**Depends:** T136 schema ✅ · transfer patterns (T143) ✅  
**See:** `orchestration/CURRENT_TASK.md`  
**_agent cleanup:** 2026-06-16 — stale files archived; active plan files kept at `_agent/` root

---

## Latest Review — T143–T149 Inventory Expansion (APPROVED 2026-06-15)

**Agent:** Codex  
**Scope:** Transfer, Alerts, Dashboard, Reports, LIFF mobile + follow-up (cancel + filters + lint)

**Gates:** build ✅ · typecheck ✅ · lint ✅ (0 errors)

**Verdict:** ✅ APPROVED — `hr-app/_agent/archive/T143-T149/CURSOR_REVIEW_VERDICT.md`

**Deploy:** `49bda1c` → https://hr-app-two-iota.vercel.app

**Archive:** `hr-app/_agent/archive/T143-T149/` ✅

---

## Latest Review — T155-B Morning Push HR Settings UI (APPROVED 2026-06-15)

**Agent:** Codex  
**Scope:** `MorningPushSettingsPanel`, `morning-push-config.ts`, `/api/settings/runtime` (8 keys)

**Gates:** typecheck ✅ · lint ✅ (0 errors) · build ✅

**Archive:** `hr-app/_agent/archive/T155-B/`

---

## Latest Review — Leave Policy Defaults + HR Balance Override (APPROVED 2026-06-15)

**Agent:** Codex  
**Scope:** `hr_leave_policy_defaults` migration, `/api/leave/policy`, `/api/leave/balances`, `/admin/leaves?view=balances` UI

**Gates:** build ✅ · typecheck ✅ · lint ✅ (0 errors, 10 pre-existing warnings)

**Pending after approve (user/Cursor):**
1. `cd hr-app && supabase db push` on `oouswalwqhojpzqwwdvs`
2. git commit (leave-policy files only — exclude junk `FINAL_MIGRATION_*.sql`)
3. `npx vercel --prod --yes`

**Archive:** `hr-app/_agent/archive/leave-policy-defaults/`

---

**Previous active:** T138 — Kitchen Requisition Web Admin — 🔄 IN PROGRESS (Office-Style)  
**Previous date:** 2026-06-13

## Taskmaster

|| Status | Tasks | Count |
||--------|-------|-------|
|| done | T01–T108 (except cancelled) | 102 |
|| cancelled | T96–T101 (Payroll baht — deferred Phase 9) | 6 |

## Linear

Synced 122 issues — JAK-29 … JAK-204  
Project: https://linear.app/jakarinosk/project/line-oa-hr-and-payroll-a03cf785a6ee  
T81–T108 → **Done** (T96–T101 → **Canceled**)  
T136–T149 → **Todo** (T136 → **In Progress** — 2026-06-13)

## Latest Review — T138: Kitchen Requisition Web Admin (APPROVED 2026-06-13)

**Agent:** Codex (GPT-5.5) + Office-Style collaboration  
**Phase:** EXECUTE → APPROVED  
**Pattern:** 🏢 Office-Style (4 agents: Schema, API, UI, Test)

**Files:**
- `supabase/migrations/20260613120000_inv_requisitions.sql` (created, 329 lines — schema + RLS + RPC)
- `src/features/inventory/types.ts` (modified, +requisition types)
- `src/features/inventory/validators/requisition.ts` (created, 3KB — Zod schemas)
- `src/features/inventory/actions/requisition.ts` (created, 21KB — 6 actions + helpers)
- `src/app/admin/inventory/requisition/page.tsx` (created — list route)
- `src/app/admin/inventory/requisition/create/page.tsx` (created — create route)
- `src/app/admin/inventory/requisition/[id]/page.tsx` (created — detail route)
- `src/features/inventory/RequisitionListTable.tsx` (created, 3.1KB)
- `src/features/inventory/RequisitionCreateForm.tsx` (created, 8.5KB)
- `src/features/inventory/RequisitionDetailView.tsx` (created, 15KB)

**Gates:**
- build ✅ (87/87 routes)
- typecheck ✅
- lint ✅ (0 errors; 8 pre-existing warnings outside scope)

**Implementation:**
- ✅ 4-step workflow: request → approve → issue → receive
- ✅ Atomic `inv_issue_requisition()` RPC for stock deduction
- ✅ `inv_stock_movements` audit table (created)
- ✅ RLS with requester-owned + management visibility
- ✅ Typed server actions with Zod validation
- ✅ Status-gated action panels on detail page
- ✅ Partial approval via item-level `qty_approved`

**Office-Style Pattern Success:**
- 39KB TEAM_SYNC discussion with 20+ cross-agent questions
- 5 conflicts resolved before implementation
- Zero revision rounds needed
- Implementation matched approved plan exactly

**Deviations:**
- Migration apply + manual E2E deferred: local Supabase unavailable
- Can verify during UAT or next development session

**Verdict:** ✅ APPROVED — 9/11 criteria met; code complete, migration pending DB access

**Next:** T140 Consumption & Damage or T141 Stock Count — continue Office-Style for complex tasks

---

## Previous Review — T136: Unit Conversion Runtime Logic (APPROVED 2026-06-13)

**Agent:** Codex (GPT-5.5) + multi-agent workers  
**Phase:** EXECUTE → APPROVED  
**Files:**
- `src/lib/inventory/unit-conversion.ts` (created, 346 lines)
- `src/features/inventory/actions/inbound.ts` (modified, +conversion logic)
- `src/features/inventory/InboundAddItemForm.tsx` (modified, +unit dropdown)
- `src/features/inventory/InboundScanPageContent.tsx` (modified, +scanner unit selection)
- `src/app/admin/inventory/inbound/[id]/page.tsx` (modified, +unit configs)

**Gates:**
- build ✅ (87/87 routes)
- typecheck ✅
- lint ✅ (0 errors; 8 pre-existing warnings outside scope)

**Implementation:**
- ✅ Runtime unit conversion with direct/inverse support
- ✅ Admin inbound: unit dropdown + conversion display
- ✅ Scanner inbound: unit selection + barcode lookup
- ✅ Server actions normalize to base unit before insert
- ✅ Stock balance remains base-unit driven (approval RPC unchanged)

**Deviations:**
- Used multi_agent_v1 instead of tmux-based agents (acceptable tooling difference)
- Manual E2E deferred: local Supabase unavailable; can verify during UAT

**Verdict:** ✅ APPROVED — code complete, all automated gates pass, E2E validation deferred to UAT

**Next:** T138 Kitchen Requisition (Office-Style Collaboration pattern)

---

## Previous Review — HOTFIX: LIFF Init Diagnostic & UX Fallback (APPROVED 2026-06-13)

**Agent:** Claude Code (claude-fable-5)  
**Phase:** EXECUTE → APPROVED  
**Files:** 
- `src/lib/line/liff-client.ts` (+65 lines)
- `src/features/inventory/InboundBarcodeScanner.tsx` (+11/-1 lines)
- `_agent/LIFF_DEBUG_FINDINGS.md` (new)

**Gates:**
- build ✅ (87/87 routes)
- typecheck ✅
- lint ⚠️ — 2 pre-existing errors in `InboundScanPageContent.tsx` (ไม่อยู่ใน allowed files)
  - ไฟล์ที่แก้ lint สะอาด 0 errors

**Verdict:** ✅ APPROVED — diagnostic logging ครบถ้วน, UX Option B implemented, ไม่ regression

**Archive:** `hr-app/_agent/archive/debug/LIFF_DEBUG_FINDINGS.md`

**Next Steps:**
1. Deploy to production
2. User กด "สแกน barcode" → แคปหน้าจอ error code → map H1-H4 ใน `LIFF_DEBUG_FINDINGS.md`
3. เปิด task แยกสำหรับ fix lint ใน `InboundScanPageContent.tsx` (react-hooks/set-state-in-effect)

**Queue:** กลับไป T123 (Portal v2 Widgets + LIFF)

---

## Gates (batch)

|| Gate | Result |
||------|--------|
|| build / typecheck / lint | ✅ (0 errors; 1 pre-existing LeaveForm warning) |
|| Deploy production | ✅ |
|| Smoke + onboarding script | ✅ |
|| SECURITY_REVIEW_P6 | ✅ no critical |

## Review notes

- Fixed during review: `admin/recruitment/page.tsx` `<a>` → `<Link>` (lint gate)
- `linear-hrp-review.mjs` comment on T108 skipped (401 auth) — Linear state synced via `linear-sync-hr-payroll.mjs`
- Manual UAT (LINE OAuth full flow) pending client sign-off — non-blocking

## Ad-hoc client UAT hotfixes (2026-06-12)

**Not a Taskmaster task** — deployed outside M38, pre-UAT feedback.

|| Area | Commit(s) | Status |
||------|-----------|--------|
|| Notification bell + leave alerts | `0624eeb`, `d26adca` | ✅ prod |
|| Permanent employee delete + cascade | `080c9be`, `728288b` + migration `20260618140000` | ✅ prod |
|| Sidebar hide (Perf/Recruit/Training) | `d76ac1d`, `012fc39` | ✅ prod |
|| BM sidebar → branch hub only | `57eed46` | ✅ prod |

**Deploy HEAD:** `57eed46` — https://hr-app-two-iota.vercel.app

---

## Close-out (2026-06-10)

- ✅ `vercel --prod` deployed
- ✅ Smoke + portal UAT (20 routes, no 5xx)
- ✅ Git commit + tag `hr-payroll-v1.0`

## Optional later

- LINE OAuth UAT (real new account)
- Key rotation (Supabase / LINE / Vault)
- Cron SQL in Supabase dashboard (MCP permission denied)
