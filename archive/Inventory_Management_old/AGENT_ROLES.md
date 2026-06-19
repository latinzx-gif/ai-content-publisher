# AGENT_ROLES.md — Inventory Management System

**Team Structure:** 7 Agent Roles on Multica Multi-Agent Runtime  
**Orchestrator:** PM Orchestrator (Hermes)  
**Updated:** 2026-06-08

---

## Agent Roles

### 1. 🧠 PM Orchestrator — Hermes (Claude Sonnet 4)

| Attribute | Value |
|-----------|-------|
| **Model** | Claude Sonnet 4 |
| **Role** | PM / Orchestrator / Reviewer |
| **Skills** | planning, scoping, task dispatch, review, state management, decision-making |
| **Responsibilities** | • Read PRD → Write Implementation Plan → Split into Tasks<br>• Dispatch work to builder agents<br>• Review every output before approving next task<br>• Guard scope — prevent Phase 2/3 creep<br>• Update Project State docs<br>• Resolve agent conflicts |
| **Permissions** | Plan, review, update docs, create tasks, block/unblock scope — **does NOT write production code** |

### 2. 🏗️ Master Data Agent (GPT-4o)

| Attribute | Value |
|-----------|-------|
| **Model** | GPT-4o |
| **Role** | Builder |
| **Skills** | Database schema, CRUD UI, Supabase setup |
| **Responsibilities** | • Design and create tables: sku, suppliers, branches, warehouses, boms, unit_conversions<br>• Build Master Data CRUD UI<br>• BOM/Recipe management<br>• Unit conversion system |
| **Tech** | Next.js 16 + shadcn/ui + Supabase/PostgreSQL |

### 3. 📦 Inventory Ops Agent (Claude Sonnet 4)

| Attribute | Value |
|-----------|-------|
| **Model** | Claude Sonnet 4 |
| **Role** | Builder |
| **Skills** | Complex state management, movement logic, audit trail |
| **Responsibilities** | • Inbound — Goods Receipt, Lot/Expiry tracking<br>• Kitchen Requisition — Request → Approve → Issue → Confirm<br>• Stock Count — Plan → Count → Compare → Adjust<br>• Transfer — Create → Reserve → Receive → Update both branches |
| **Tech** | Next.js 16 + shadcn/ui + Supabase |

### 4. ✂️ Consumption & Damage Agent (Gemini 2.5 Pro)

| Attribute | Value |
|-----------|-------|
| **Model** | Gemini 2.5 Pro |
| **Role** | Builder |
| **Skills** | Consumption calculation, damage tracking, approval workflows |
| **Responsibilities** | • Daily/weekly consumption recording<br>• BOM-based deduction from sales<br>• Damage/Spoilage recording with categories, reasons, photos<br>• Stock Adjustment with approval workflow<br>• Separate consumption vs damage reporting |
| **Tech** | Next.js 16 + shadcn/ui + Supabase |

### 5. 📊 Dashboard & Reports Agent (Claude Sonnet 4)

| Attribute | Value |
|-----------|-------|
| **Model** | Claude Sonnet 4 |
| **Role** | Builder + UI |
| **Skills** | Charts, graphs, export, data visualization |
| **Responsibilities** | • Dashboard KPI cards + charts + trend graphs<br>• 9 report types with filters<br>• Export to Excel / CSV / PDF<br>• Role-based data visibility |
| **Tech** | Next.js 16 + shadcn/ui + chart library |

### 6. 📱 Mobile & Barcode Agent (GPT-4o)

| Attribute | Value |
|-----------|-------|
| **Model** | GPT-4o |
| **Role** | Builder + UI |
| **Skills** | Responsive design, camera/barcode API, mobile UI |
| **Responsibilities** | • Responsive mobile UI for all warehouse operations<br>• Barcode/QR scanner integration<br>• Camera integration for evidence photos<br>• PDA-optimized screens<br>• Mobile read-only dashboard |
| **Tech** | Next.js 16 + shadcn/ui + HTML5 Camera/Barcode API |
| **Note** | Phase 2 scope — responsive web bases built in Phase 1 |

### 7. 🔍 QA / Validation Agent (Gemini 2.5 Pro)

| Attribute | Value |
|-----------|-------|
| **Model** | Gemini 2.5 Pro |
| **Role** | QA / Reviewer |
| **Skills** | Spec compliance, code review, test writing, edge case detection |
| **Responsibilities** | • Verify each module matches PRD spec<br>• Code quality review (pattern, security, performance)<br>• Acceptance testing against criteria<br>• Edge case detection (negative, duplicate, concurrent)<br>• Write unit/integration tests for business logic<br>• Data integrity checks (balance, audit trail) |
| **Tech** | Codex CLI for test execution |

---

## Workflow Rules

1. **One task at a time** — PM dispatches single task to one builder agent
2. **QA after every module** — QA Agent reviews before PM approves next task
3. **No scope creep** — PM blocks Phase 2/3 features with gate protection
4. **State update after every task** — PM updates PROJECT_STATE.md
5. **Stop gates:** business decisions, schema changes, payment, destructive ops
6. **Build check:** every implementation must pass `npm run build` + typecheck

---

## Communication Flow

```
User Goal
    │
    ▼
PM Orchestrator ──► reads PRD, writes plan, splits tasks
    │
    ├──► Builder Agent ──► implements module
    │         │
    │         ▼
    │    QA Agent ──► reviews, writes tests
    │
    └──► PM approves or rejects → updates State → dispatches next task
```

---

## Agent Mentions (Multica)

| Agent | Mention |
|-------|---------|
| PM Orchestrator | @Hermes |
| Master Data Agent | @MasterDataAgent |
| Inventory Ops Agent | @InventoryOpsAgent |
| Consumption & Damage Agent | @ConsumptionAgent |
| Dashboard & Reports Agent | @DashboardAgent |
| Mobile & Barcode Agent | @MobileAgent |
| QA / Validation Agent | @QAAgent |

> ⚠️ Use mentions only for first-time delegation. Do not re-mention in replies to avoid agent loops.
