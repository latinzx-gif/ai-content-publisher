# CODEX_TASK_QUEUE.md — Inventory Management System

**Managed by:** PM Orchestrator (Hermes)  
**Builder Agent:** Codex CLI (GPT-5.4)  
**Status:** ⏳ Pending (Phase 1 not yet started)

---

## Phase 1 Task Queue

| # | Task | Module | Builder | Status |
|---|------|--------|---------|--------|
| 1 | Create initial Next.js project + Supabase setup + DB schema | Foundation | Codex | ⏳ Pending |
| 2 | SKU CRUD UI + API + table + validation | Master Data | Codex | ⏳ Pending |
| 3 | Branch/Warehouse CRUD UI + API | Master Data | Codex | ⏳ Pending |
| 4 | Supplier CRUD UI + API | Master Data | Codex | ⏳ Pending |
| 5 | Unit Conversion system UI + API | Master Data | Codex | ⏳ Pending |
| 6 | BOM/Recipe management UI + API | Master Data | Codex | ⏳ Pending |
| 7 | Inbound (GRN) — Create, SKU entry, Lot/Expiry, Attachments | Inbound | Codex | ⏳ Pending |
| 8 | Inbound workflow — Draft → Verify → Approve | Inbound | Codex | ⏳ Pending |
| 9 | Kitchen Requisition — Request form + balance display | Requisition | Codex | ⏳ Pending |
| 10 | Requisition workflow — Approve → Issue → Confirm Receive | Requisition | Codex | ⏳ Pending |
| 11 | Consumption recording UI + API | Consumption | Codex | ⏳ Pending |
| 12 | BOM-based deduction logic | Consumption | Codex | ⏳ Pending |
| 13 | Damage/Spoilage recording + photo + approval | Damage | Codex | ⏳ Pending |
| 14 | Stock Count plan creation + SKU list generation | Stock Count | Codex | ⏳ Pending |
| 15 | Stock Count mobile entry + variance calculation | Stock Count | Codex | ⏳ Pending |
| 16 | Stock Count adjustment + approval | Stock Count | Codex | ⏳ Pending |
| 17 | Transfer order creation + reservation | Transfer | Codex | ⏳ Pending |
| 18 | Transfer receipt confirmation + dual-branch update | Transfer | Codex | ⏳ Pending |
| 19 | Dashboard KPI cards + charts + trend graphs | Dashboard | Codex | ⏳ Pending |
| 20 | 9 Reports: UI + filters + data queries | Reports | Codex | ⏳ Pending |
| 21 | Report export: Excel, CSV, PDF | Reports | Codex | ⏳ Pending |

---

## Task Format

Each task when dispatched will include:

```markdown
## Task ## — Task Name

**Module:** Module Name  
**Builder Agent:** Codex CLI  
**Prerequisites:** Task ##, Task ##

### Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2
- [ ] ...

### Implementation Notes
- Note 1
- Note 2

### Do Not Change
- Auth/billing/env/prod config
- Phase 2/3 features

### Post-Build
- [ ] Run `npm run build`
- [ ] Run `npx tsc --noEmit`
```

---

## Build Rules

1. One task at a time — never parallel
2. QA review after every task before next dispatch
3. Must run `npm run build` + typecheck after every implementation
4. No Phase 2/3 features (Alerts, Mobile native, POS, Accounting, AI)
5. Install npm packages only with written justification
6. Do NOT modify: HERMES.md, PROJECT_STATE.md, ROADMAP.md, DECISION_LOG.md, PHASE_1_SCOPE_LOCK.md, AGENT_ROLES.md, QA_CHECKLIST.md, CODEX_TASK_QUEUE.md
