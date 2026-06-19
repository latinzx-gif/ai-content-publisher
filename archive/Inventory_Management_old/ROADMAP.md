# ROADMAP.md — Inventory Management System

**Project:** Inventory Management for Multi-Branch Restaurant Operations  
**Platform:** Web Application (Next.js) + Mobile (Responsive Web)  
**Timeline:** Phased delivery over 3 phases

---

## Phase 0 — Planning & Setup (✅ Complete)

**Goal:** Define vision, architecture, and agent orchestration plan.

| Deliverable | Status |
|-------------|--------|
| PRD Sitemap (10 Modules, 5 Roles) | ✅ Done |
| Agent Architecture (7 Agent Roles) | ✅ Done |
| Project Context Docs (8 files) | ✅ Done |
| Agent Skills Import (15 skills) | ✅ Done |
| Multica Project Setup | ✅ Done |

---

## Phase 1 — MVP (⏳ Up Next)

**Goal:** Build core inventory functionality covering the full movement lifecycle.

### Build Order

| Step | Module | Builder Agent | Model | Priority |
|------|--------|---------------|-------|----------|
| 1 | **Master Data** — SKU, Supplier, Branch, Warehouse, Unit, BOM | Master Data Agent | GPT-4o | P1 |
| 2 | **QA Review** — Verify Master Data | QA Agent | Gemini 2.5 Pro | — |
| 3 | **Inbound** — Goods Receipt, Lot/Expiry, Supplier Ref, Attachments | Inventory Ops Agent | Claude Sonnet 4 | P1 |
| 4 | **QA Review** — Verify Inbound Logic | QA Agent | Gemini 2.5 Pro | — |
| 5 | **Kitchen Requisition** — Request → Approve → Issue → Confirm | Inventory Ops Agent | Claude Sonnet 4 | P1 |
| 6 | **QA Review** — Verify Requisition Flow | QA Agent | Gemini 2.5 Pro | — |
| 7 | **Consumption & Damage** — Consumption Recording, Damage/Spoilage, Adjustment | Consumption Agent | Gemini 2.5 Pro | P1 |
| 8 | **QA Review** — Verify Consumption Logic | QA Agent | Gemini 2.5 Pro | — |
| 9 | **Stock Count** — Plan → Count → Compare → Adjust | Inventory Ops Agent | Claude Sonnet 4 | P1 |
| 10 | **QA Review** — Verify Stock Count | QA Agent | Gemini 2.5 Pro | — |
| 11 | **Transfer** — Create → Reserve → Receive → Update Both Branches | Inventory Ops Agent | Claude Sonnet 4 | P1 |
| 12 | **QA Review** — Verify Transfer Logic | QA Agent | Gemini 2.5 Pro | — |
| 13 | **Dashboard** — KPI Cards, Charts, Trend Graphs | Dashboard Agent | Claude Sonnet 4 | P1 |
| 14 | **Reports** — 9 Report Types, Filters, Export (Excel/CSV/PDF) | Dashboard Agent | Claude Sonnet 4 | P1 |
| 15 | **QA Final** — Full Integration Test + Data Integrity | QA Agent | Gemini 2.5 Pro | — |
| 16 | **PM Review** — Scope Lock Check, State Update | PM Orchestrator | Claude Sonnet 4 | — |

**Tech Stack:** Next.js 16 + shadcn/ui + PostgreSQL/Supabase + Tailwind CSS

---

## Phase 2 — Enhancement (🔜 Locked)

**Goal:** Add alerts, mobile/PDA support, and advanced reporting.

| Feature | Priority |
|---------|----------|
| Alerts & Notifications — Expiry, Low Stock, Abnormal Items | P1 |
| Mobile/PDA — Barcode Scanner, Camera, Responsive UI | P2 |
| Advanced Reports — Detailed analytics, custom exports | P2 |

---

## Phase 3 — Integration (🔜 Locked)

**Goal:** Connect with external systems and add AI capabilities.

| Feature | Priority |
|---------|----------|
| POS Auto-Deduction — Auto deduct stock from POS sales | P2 |
| Purchase Order / Procurement System | P2 |
| Accounting Integration — Connect with accounting software | P3 |
| Demand Forecasting — AI predict usage from historical data | P3 |
| AI Risk Analysis — Identify high-risk spoilage items | P3 |

---

## Guardrails

- **Phase 2/3 work must NOT start** before Phase 1 is stable and reviewed
- **No vector search / embeddings** in scope
- **No auth/billing/env/prod config** changes by builder agents
- Every implementation task requires `npm run build` and typecheck pass
- QA Agent reviews every module before PM approval
