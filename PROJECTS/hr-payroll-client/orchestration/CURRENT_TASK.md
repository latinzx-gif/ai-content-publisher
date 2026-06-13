# CURRENT TASK: T136 — Unit Conversion Runtime Logic

## Phase

EXECUTE

## Status

Plan APPROVED — Ready for EXECUTE

## Primary Agent

Codex (GPT-5.5)

## Context

Implement runtime unit conversion for stock operations (inbound, requisition, consumption, transfer). Currently, the Inventory system has `inv_units` table with conversion rates but no runtime logic to convert quantities during stock operations.

**Business need:** Allow warehouse staff to receive goods in secondary units (e.g., "ลัง" instead of "ชิ้น") and automatically convert to base unit for stock balance.

**Example:** SKU "น้ำดื่ม" has base unit "ขวด" and secondary unit "ลัง" (1 ลัง = 12 ขวด). Staff receives "2 ลัง" → system stores 24 ขวด in `inv_stock_balances`.

## Goal

1. **Create conversion library** at `src/lib/inventory/unit-conversion.ts`
2. **Server action:** `convertQuantity(skuId, qty, fromUnit, toUnit)` → normalized qty
3. **Inbound enhancement:** Allow receiving in secondary unit (dropdown shows conversion rate)
4. **Stock balance rule:** Always store in **base unit** (normalize before save)
5. **UI feedback:** Show conversion rate when user selects secondary unit

## Allowed Files

```
PROJECTS/hr-payroll-client/hr-app/src/lib/inventory/unit-conversion.ts (create)
PROJECTS/hr-payroll-client/hr-app/src/features/inventory/actions/inbound.ts (read + edit — add conversion)
PROJECTS/hr-payroll-client/hr-app/src/features/inventory/InboundAddItemForm.tsx (read + edit — unit dropdown)
PROJECTS/hr-payroll-client/hr-app/src/features/inventory/InboundScanPageContent.tsx (read + edit — scanner unit selection)
PROJECTS/hr-payroll-client/hr-app/src/app/admin/inventory/inbound/[id]/page.tsx (read + edit — conversion display)
PROJECTS/hr-payroll-client/hr-app/supabase/migrations/ (read only — check inv_units schema)
```

## Forbidden

- Do NOT change existing `inv_stock_balances` schema
- Do NOT add new tables (use existing `inv_units` table)
- Do NOT modify inbound approval workflow
- Do NOT touch other inventory features (requisition, consumption, etc. — those are T138+)
- Do NOT add new dependencies without approval

## Acceptance Criteria

- [ ] `src/lib/inventory/unit-conversion.ts` created with:
  - [ ] `convertQuantity()` function with unit validation
  - [ ] Error handling for invalid units / missing conversion rates
  - [ ] TypeScript types for conversion results
- [ ] Inbound form UI:
  - [ ] Unit dropdown shows base + secondary units for selected SKU
  - [ ] Conversion rate displayed when secondary unit selected (e.g., "1 ลัง = 12 ขวด")
  - [ ] Quantity input accepts decimal for both units
- [ ] Server action `scanInvInboundItem` or equivalent:
  - [ ] Converts qty to base unit before saving to `inv_inbound_items`
  - [ ] Stock balance always in base unit
- [ ] End-to-end test case:
  - [ ] Create SKU "น้ำดื่ม" with base unit "ขวด" + secondary "ลัง" (1 ลัง = 12 ขวด)
  - [ ] Receive 1 ลัง via inbound form
  - [ ] Verify `inv_stock_balances.quantity = 12` (not 1)
  - [ ] Verify `inv_inbound_items` shows original "1 ลัง" + converted "12 ขวด"
- [ ] `npm run build && npm run typecheck && npm run lint` pass

## Depends

- T134 (Inventory Phase 4 — Inbound + LIFF scanner) — **DONE**

## Skills to Load

**Codex should read these before starting:**

From `/Users/jakarinosk/HEAD-OFFICE/orchestration/workflow-skills/`:
- `03-claude-plan/SKILL.md` — PLAN phase workflow (use this, no codex-specific version)
- `05-claude-execute/SKILL.md` — EXECUTE phase workflow

From project:
- `/Users/jakarinosk/HEAD-OFFICE/COMPANY_OS.md` — company rules, agent roles
- `/Users/jakarinosk/HEAD-OFFICE/PROJECTS/hr-payroll-client/GROUND_TRUTH.md` — project scope, forbidden
- `/Users/jakarinosk/HEAD-OFFICE/PROJECTS/hr-payroll-client/hr-app/reports/INVENTORY_EXPANSION_PLAN.md` — T136 detail + agent team strategy

**IMPORTANT — Agent Team Strategy:**

สำหรับ T136 (moderate complexity), ให้ใช้ Task tool สร้าง agent team มาช่วยทำงานแบบ parallel:

**Suggested Agent Team (3 agents):**
1. **Library Agent (best-of-n-runner):** สร้าง `unit-conversion.ts` library + types + tests
2. **Backend Agent (best-of-n-runner):** แก้ server actions เพิ่ม conversion logic
3. **Frontend Agent (best-of-n-runner):** แก้ Inbound form UI + unit dropdown + conversion display

**Workflow:**
1. PLAN phase: วางแผนแบ่งงานให้ 3 agents (ใช้ Task tool spawn parallel)
2. รอ agents เสร็จ → รวมผลลัพธ์
3. Integration test (manual E2E)
4. Quality gates + เขียน TASK_RESULT.md

Standard workflow:
1. Read this `CURRENT_TASK.md`
2. Read allowed files (understand current state)
3. Write `_agent/TASK_PLAN.md` with:
   - Agent team strategy (which agents, what each does)
   - Exact files to change per agent
   - Integration plan
   - Risk assessment
4. Write `_agent/CURSOR_PLAN_REQUEST.md` → **STOP**

Wait for Cursor approval before EXECUTE.

## Queue

After T136 → T137 (BOM Consumption) or T138 (Kitchen Requisition) — ดู INVENTORY_EXPANSION_PLAN.md

## Linear

**Issue:** [JAK-191](https://linear.app/jakarinosk/issue/JAK-191/hrp-t136-unit-conversion-runtime-logic)  
**Project:** LINE OA HR & Payroll  
**State:** Todo → will update to In Progress when work starts
