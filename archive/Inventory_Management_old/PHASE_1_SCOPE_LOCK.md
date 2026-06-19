# PHASE_1_SCOPE_LOCK.md — Inventory Management System

**Status:** ✅ Approved for implementation  
**Last Reviewed:** 2026-06-08  
**Scope Guardian:** PM Orchestrator (Hermes)

---

## Phase 1 Goal

Build a working inventory management system covering the full stock movement lifecycle for multi-branch restaurant operations — from goods receipt through to management dashboard.

---

## In Scope (8 Modules)

### M — Master Data
- SKU management (code, name, category, unit, barcode, min/max stock, status)
- Branch/Warehouse management (main/sub warehouses per branch)
- Supplier management (code, name, contact, supplied items)
- Unit conversion (multi-unit per SKU, conversion rates)
- BOM/Recipe management (menu item → ingredients, quantities, waste %)

### 1 — Inbound / Goods Receipt
- Create Goods Receipt Note (GRN) with supplier, warehouse, date
- SKU entry with Lot number, Expiry date, Unit cost
- Barcode scanning support
- Attachment support (photos, delivery documents)
- Draft → Verify → Approve workflow
- Auto-update Stock Balance + Lot Balance on approval

### 2 — Kitchen Requisition
- Create requisition request (branch, requester, SKU, quantity)
- Display current balance at time of request
- Approve / Partial Approve / Reject workflow
- Issue goods (actual quantity issued, Lot selections)
- Kitchen confirms receipt
- Stock Movement recorded on issue

### 3 — Consumption & Damage
- Record actual consumption (daily/weekly, per SKU, quantity)
- BOM-based deduction: sales qty × recipe qty
- Damage/Spoilage recording (damaged, spoiled, expired, lost, adjustment)
- Photo evidence attachment
- Approval workflow for abnormal/high-value cases
- Separate reporting: Consumption ≠ Damage

### 4 — Stock Count
- Create count plan (cycle/periodic, scope: branch/warehouse/category/SKU)
- Mobile/PDA count entry with barcode scan
- System-calculated variance (system vs physical)
- Auto-generate Adjustment on confirmation
- Audit trail: who counted, who verified, who approved

### 5 — Transfer (Inter-Branch)
- Create transfer order (source → destination, SKU, Lot, qty)
- Status: Transferring (reserved) → Received → Cancelled
- Destination confirms receipt (actual qty, photos if damaged)
- Auto-update Stock Balance on both branches on confirmation

### 6 — Dashboard
- KPI cards: Total Inventory Value, SKU count, Low Stock count, Near Expiry, Damage value
- Trend charts: Stock value trend, Inbound vs Issue trend, Damage trend
- Category distribution pie/bar chart
- Recent transactions list (latest 10 inbound, issues, transfers, adjustments)

### 7 — Reports
- 9 report types: Stock On Hand, Inbound, Requisition, Consumption, Damage/Spoilage, Expiry, Transfer, Stock Count Variance, Audit Trail
- Filters: date range, branch, warehouse, category, SKU
- Export: Excel, CSV, PDF
- Summary totals at end of report

---

## Out of Scope (Phase 2/3 — Locked)

| Feature | Phase | Reason for Deferral |
|---------|-------|---------------------|
| Alerts & Notifications | Phase 2 | Consumable on top of existing data, not core workflow |
| Mobile/PDA Native Features | Phase 2 | Web responsive covers Phase 1; native features are enhancement |
| POS Auto-Deduction | Phase 3 | Requires external integration |
| Purchase Order / Procurement | Phase 3 | Separate system, not part of stock management |
| Accounting Integration | Phase 3 | External integration, Phase 3+ |
| Demand Forecasting / AI | Phase 3 | Not required for MVP; data needed first |
| Barcode Label Printing | Phase 2 | Nice-to-have, not core workflow |
| Multi-currency / Multi-tax | Future | Not in requirements |

---

## Gate Protection

> ⚠️ **Scope Gate:** Any request to implement Phase 2 or Phase 3 features raises the following guard:
> 
> "Feature [name] is in Phase [X] scope which is currently locked. Phase 1 must be complete and approved before Phase 2 begins. Please confirm you want to unlock Phase [X] before proceeding."

---

## Build Guardrails

1. No pgvector / embeddings / vector search
2. No auth/billing/env/prod config modifications by builder agents
3. Every implementation must pass `npm run build` and typecheck
4. QA Agent reviews every module before PM approval
5. All stock movements must be atomic (DB transaction)
6. Stock balance must never go negative without special approval
7. All movements must record audit trail (user, timestamp, reference doc)
8. No deletion of stock movement records (immutable history)
