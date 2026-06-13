# REVIEW_STATUS.md

**Batch:** T77–T108  
**Status:** ✅ **APPROVED**  
**Active:** **T136** — Unit Conversion Runtime Logic — 🔄 **IN PROGRESS**  
**Date:** 2026-06-13  
**Reviewed:** 2026-06-13 (Cursor orchestrator)

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

## Latest Review — T136: Unit Conversion Runtime Logic (APPROVED 2026-06-13)

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
