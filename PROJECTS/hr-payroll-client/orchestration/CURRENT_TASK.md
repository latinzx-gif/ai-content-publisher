# CURRENT TASK: T138 — Kitchen Requisition Web Admin

## Phase

EXECUTE

## Status

Ready for Codex (Office-Style Collaboration)

## Primary Agent

Codex (GPT-5.5)

## Collaboration Mode

🏢 **Office-Style Discussion** (Trial #1)

## Context

Implement 4-step kitchen requisition workflow: หัวหน้าครัว request → หัวหน้าคลัง approve → คลัง issue → ครัว receive. This is a complex feature requiring coordination across schema design, business logic, RLS policies, and multi-role UI.

**Business need:** Kitchen staff (หัวหน้าครัว) need to request ingredients from warehouse without direct access to stock balance. Warehouse manager (หัวหน้าคลัง) approves/adjusts quantities before warehouse staff (เจ้าหน้าที่คลัง) physically issues goods. Kitchen confirms receipt.

**Workflow:**
1. **Request (draft → pending):** หัวหน้าครัวเลือก SKU + qty_requested → submit
2. **Approve:** หัวหน้าคลังอนุมัติ (เต็ม/บางส่วน/reject) → set qty_approved
3. **Issue:** เจ้าหน้าที่คลังระบุ Lot + qty_issued → **stock ลดตอนนี้**
4. **Receive:** หัวหน้าครัวยืนยัน qty_received → ถ้า < issued บันทึกส่วนต่าง

## Goal

1. **Schema:** `inv_requisitions` + `inv_requisition_items`
2. **Routes:** list, create, detail (with 3 action buttons: approve, issue, receive)
3. **Server actions:** create, submit, approve, reject, issue, receive
4. **RLS:** requester sees own only; HR/warehouse manager see all
5. **Stock impact:** deduct when issue (not approve)
6. **Audit:** `inv_stock_movements` with type=requisition_issue

## Allowed Files

```
PROJECTS/hr-payroll-client/hr-app/supabase/migrations/20260613120000_inv_requisitions.sql (create — schema + RLS)
PROJECTS/hr-payroll-client/hr-app/src/features/inventory/types.ts (edit — add requisition types)
PROJECTS/hr-payroll-client/hr-app/src/features/inventory/validators/requisition.ts (create — Zod schemas)
PROJECTS/hr-payroll-client/hr-app/src/features/inventory/actions/requisition.ts (create — server actions)
PROJECTS/hr-payroll-client/hr-app/src/app/admin/inventory/requisition/page.tsx (create — list)
PROJECTS/hr-payroll-client/hr-app/src/app/admin/inventory/requisition/create/page.tsx (create — form)
PROJECTS/hr-payroll-client/hr-app/src/app/admin/inventory/requisition/[id]/page.tsx (create — detail)
PROJECTS/hr-payroll-client/hr-app/src/features/inventory/RequisitionListTable.tsx (create — list UI)
PROJECTS/hr-payroll-client/hr-app/src/features/inventory/RequisitionCreateForm.tsx (create — create form)
PROJECTS/hr-payroll-client/hr-app/src/features/inventory/RequisitionDetailView.tsx (create — detail + actions)
```

## Forbidden

- Do NOT modify existing stock balance logic
- Do NOT add new dependencies without approval
- Do NOT implement mobile view (that's T139)
- Do NOT implement BOM/consumption features (T137, T140)
- Do NOT change existing inbound/supplier/warehouse features

## Acceptance Criteria

- [ ] Migration 20260613120000_inv_requisitions.sql:
  - [ ] Table `inv_requisitions` with columns: id, branch_id, warehouse_id, requester_id, status (enum), notes, created_at, updated_at, approved_by, approved_at, issued_by, issued_at, received_by, received_at
  - [ ] Table `inv_requisition_items` with columns: id, requisition_id, sku_id, qty_requested, qty_approved, qty_issued, qty_received, lot_number, notes
  - [ ] Status enum: draft, pending, approved, issued, completed, rejected
  - [ ] RLS policies: requester sees own; hr/inventory_manage see all
  - [ ] Foreign keys + cascade rules
- [ ] Server actions `/features/inventory/actions/requisition.ts`:
  - [ ] createRequisition(branchId, warehouseId, items[])
  - [ ] submitRequisition(id) → draft → pending
  - [ ] approveRequisition(id, items[{id, qty_approved}])
  - [ ] rejectRequisition(id, reason)
  - [ ] issueRequisition(id, items[{id, qty_issued, lot_number}]) → **deduct stock**
  - [ ] receiveRequisition(id, items[{id, qty_received}])
- [ ] Routes:
  - [ ] `/admin/inventory/requisition` — list (status filter, branch filter)
  - [ ] `/admin/inventory/requisition/create` — form (select warehouse, add items)
  - [ ] `/admin/inventory/requisition/[id]` — detail + action buttons based on status
- [ ] Stock impact:
  - [ ] Issue action: insert `inv_stock_movements` (type=requisition_issue, quantity=-qty_issued)
  - [ ] Stock balance updated via trigger/RPC
  - [ ] Approve action: NO stock impact
- [ ] E2E acceptance:
  - [ ] หัวหน้าครัวสร้างใบเบิก 3 SKU (A:10, B:5, C:8) → submit
  - [ ] หัวหน้าคลัง approve (A:10, B:3, C:reject) → 2 items approved
  - [ ] คลัง issue (A:10 lot#123, B:3 lot#124) → stock ลด 10+3
  - [ ] ครัว receive (A:10, B:2) → บันทึก B ส่วนต่าง 1
  - [ ] Status flow: draft → pending → approved → issued → completed
- [ ] `npm run build && npm run typecheck && npm run lint` pass

## Depends

- T136 (Unit Conversion) — **DONE**

## Skills to Load

**Codex should read these before starting:**

From `/Users/jakarinosk/HEAD-OFFICE/PROJECTS/hr-payroll-client/orchestration/workflow-skills/`:
- `08-office-collaboration/SKILL.md` — **NEW Office-Style workflow**
- `03-claude-plan/SKILL.md` — PLAN phase workflow
- `05-claude-execute/SKILL.md` — EXECUTE phase workflow
- `12-supabase-migration/SKILL.md` — schema + RLS best practices

From project:
- `/Users/jakarinosk/HEAD-OFFICE/COMPANY_OS.md` — company rules, agent roles
- `/Users/jakarinosk/HEAD-OFFICE/PROJECTS/hr-payroll-client/GROUND_TRUTH.md` — project scope, forbidden
- `/Users/jakarinosk/HEAD-OFFICE/PROJECTS/hr-payroll-client/hr-app/reports/INVENTORY_EXPANSION_PLAN.md` — T138 detail

## Agent Team Strategy — Office-Style Collaboration

**Phase 1: Setup (Codex)**
1. สร้าง `_agent/TEAM_SYNC.md` — shared discussion file
2. เขียน header + sections: Round 1 (Proposals), Round 2 (Synthesis), Round 3 (Revisions), Final Plan

**Phase 2: Spawn Agent Team (Parallel)**

Codex spawns 4 agents พร้อมกัน via Task tool:

**Agent 1 — Schema Specialist (best-of-n-runner):**
- Responsibility: migration SQL, table design, RLS policies
- Files: `supabase/migrations/20260613120000_inv_requisitions.sql`
- Proposal: write in TEAM_SYNC.md with questions for @API @UI

**Agent 2 — API Specialist (best-of-n-runner):**
- Responsibility: server actions, validators, business logic
- Files: `actions/requisition.ts`, `validators/requisition.ts`, `types.ts`
- Proposal: write in TEAM_SYNC.md with questions for @Schema @UI

**Agent 3 — UI Specialist (best-of-n-runner):**
- Responsibility: routes, components, forms, action buttons
- Files: 3 routes + 3 components
- Proposal: write in TEAM_SYNC.md with questions for @API @Schema

**Agent 4 — Test Specialist (generalPurpose):**
- Responsibility: test cases across all layers, edge cases
- Proposal: write in TEAM_SYNC.md with E2E flow

**Phase 3: Synthesis (Codex)**
1. รอ agents เขียน proposals ครบ
2. อ่าน TEAM_SYNC.md ทั้งหมด
3. เขียน synthesis: agreements ✅, conflicts ⚠️, missing ❌
4. ตัดสินใจ conflicts (พร้อม rationale)
5. ระบุ dependencies order

**Phase 4: Iteration (if needed)**
- ถ้ามี conflicts หรือ missing → resume agents ที่ต้อง revise
- Agents เขียน Revision proposals
- Codex checks convergence
- Repeat จนกว่า converged (max 3 rounds)

**Phase 5: Final Execution (Codex)**
1. เขียน Final Integration Plan ใน TEAM_SYNC.md
2. Implement ตาม execution order (Schema → API → UI → Test)
3. Integrate outputs from agents
4. Quality gates: build + typecheck + lint
5. Manual E2E verification
6. เขียน TASK_RESULT.md + CURSOR_REVIEW_REQUEST.md
7. **STOP** — wait for Cursor review

## Workflow

**PLAN Phase:**
1. Read this CURRENT_TASK.md
2. Read Office-Style skill `08-office-collaboration/SKILL.md`
3. Write _agent/TEAM_SYNC.md (setup discussion room)
4. Spawn 4 agents with prompts to write proposals in TEAM_SYNC.md
5. Read all proposals → write synthesis
6. Iterate if needed → check convergence
7. Write final integration plan
8. Write _agent/TASK_PLAN.md (summary of discussion + execution order)
9. Write _agent/CURSOR_PLAN_REQUEST.md → **STOP**

Wait for Cursor approval before EXECUTE.

**EXECUTE Phase:**
1. Implement ตาม final integration plan
2. Quality gates
3. Manual E2E
4. Write TASK_RESULT.md → **STOP**

## Queue

After T138 → T140 (Consumption & Damage) or T141 (Stock Count) — ดู INVENTORY_EXPANSION_PLAN.md

## Linear

**Issue:** [JAK-193](https://linear.app/jakarinosk/issue/JAK-193/hrp-t138-kitchen-requisition-web-admin)  
**Project:** LINE OA HR & Payroll  
**State:** Todo → will update to In Progress when work starts
