# QA_CHECKLIST.md — Inventory Management System

**Purpose:** Acceptance criteria checklist for Phase 1 modules  
**Reviewer:** QA Agent (Gemini 2.5 Pro) — run after each module implementation  
**Format:** VERIFIED / NOT VERIFIED / UNKNOWN

---

## M — Master Data

| # | Check | Result |
|---|-------|--------|
| M1 | SKU CRUD: Create, Read, Update, Soft-Delete (status: active/suspended/discontinued) | ⬜ |
| M2 | SKU fields: code (auto/manual), name (TH/EN), category, unit, barcode, min/max stock, photo | ⬜ |
| M3 | Branch CRUD: name, address, responsible person | ⬜ |
| M4 | Warehouse CRUD: per-branch, main/sub warehouse types | ⬜ |
| M5 | Supplier CRUD: code, name, contact, payment terms, supplied items | ⬜ |
| M6 | Unit Conversion: multiple units per SKU, conversion rates | ⬜ |
| M7 | BOM: menu item → component ingredients, quantities, waste % | ⬜ |
| M8 | Barcode lookup: search SKU by barcode | ⬜ |
| M9 | Schema integrity: foreign keys, indexes, constraints | ⬜ |
| M10 | Audit trail: created_by, updated_by, timestamps on all tables | ⬜ |

---

## 1 — Inbound (Goods Receipt)

| # | Check | Result |
|---|-------|--------|
| I1 | Create GRN: supplier, warehouse, date, reference document, notes | ⬜ |
| I2 | Add SKU items: SKU, lot, expiry date, qty received, unit cost | ⬜ |
| I3 | Barcode scan to add SKU items | ⬜ |
| I4 | File attachment: photos, delivery documents | ⬜ |
| I5 | Workflow: Draft → Verify → Approve → Stock Update | ⬜ |
| I6 | On approval: Stock Balance + Lot Balance updated correctly | ⬜ |
| I7 | Cancel/edit before approval: audit trail preserved | ⬜ |
| I8 | Rollback on approval fail: no partial balance updates | ⬜ |
| I9 | Negative balance check: cannot approve if no stock exists issue | ⬜ |
| I10 | Edge case: zero qty, duplicate lot, expired lot before receiving | ⬜ |

---

## 2 — Kitchen Requisition

| # | Check | Result |
|---|-------|--------|
| K1 | Create requisition: branch, requester, date, SKU + qty | ⬜ |
| K2 | Show current balance at time of request | ⬜ |
| K3 | Workflow: Request → Approve (partial allowed) → Reject | ⬜ |
| K4 | Issue goods: actual qty, Lot selections, notes | ⬜ |
| K5 | On issue: Stock Balance decremented correctly | ⬜ |
| K6 | Kitchen confirms receipt: records actual received qty | ⬜ |
| K7 | Partial receipt handling | ⬜ |
| K8 | Audit trail: full movement history | ⬜ |
| K9 | Edge case: request more than current balance, reject flow | ⬜ |
| K10 | Concurrent request handling: prevent double-deduction | ⬜ |

---

## 3 — Consumption & Damage

| # | Check | Result |
|---|-------|--------|
| C1 | Record daily/weekly consumption: SKU, qty used, date | ⬜ |
| C2 | BOM-based deduction: enter sales qty → system calculates ingredient deduction | ⬜ |
| C3 | Damage recording: type (damaged/spoiled/expired/lost/adjustment), reason, qty | ⬜ |
| C4 | Photo evidence attachment for damage | ⬜ |
| C5 | Approval workflow for abnormal/high-value damage | ⬜ |
| C6 | Stock Balance decremented correctly on consumption/damage approval | ⬜ |
| C7 | Separate reports: consumption report ≠ damage report | ⬜ |
| C8 | Audit trail: who, what, when, why for each adjustment | ⬜ |
| C9 | Edge case: negative consumption, zero damage qty | ⬜ |
| C10 | Concurrent BOM deduction accuracy with multiple transactions | ⬜ |

---

## 4 — Stock Count

| # | Check | Result |
|---|-------|--------|
| S1 | Create count plan: cycle/periodic, scope (branch/warehouse/category/SKU) | ⬜ |
| S2 | System generates SKU list for counting based on scope | ⬜ |
| S3 | Mobile count entry: scan barcode → enter physical count | ⬜ |
| S4 | Variance calculation: system qty − physical qty | ⬜ |
| S5 | Variance display: list items with over/short + value difference | ⬜ |
| S6 | Auto-generate Adjustment on confirmation | ⬜ |
| S7 | Over-threshold variance requires approval | ⬜ |
| S8 | Audit trail: who counted, who verified, who approved adjustment | ⬜ |
| S9 | Edge case: SKU not found in system during count | ⬜ |
| S10 | Count in progress locking: prevent concurrent transactions on same SKU | ⬜ |

---

## 5 — Transfer (Inter-Branch)

| # | Check | Result |
|---|-------|--------|
| T1 | Create transfer: source branch/warehouse, destination branch/warehouse, SKU, Lot, qty | ⬜ |
| T2 | On create: status = Transferring, qty reserved (not deducted) | ⬜ |
| T3 | Destination confirms receipt: actual qty received | ⬜ |
| T4 | On confirm: source branch decrements, destination branch increments | ⬜ |
| T5 | Partial receipt handling (qty discrepancy, damage during transit) | ⬜ |
| T6 | Cancel transfer: release reserved qty | ⬜ |
| T7 | Photo attachment for damaged goods during transfer | ⬜ |
| T8 | Audit trail: full movement history on both branches | ⬜ |
| T9 | Edge case: transfer to same branch, zero qty transfer | ⬜ |
| T10 | Concurrent transfer handling for same SKU | ⬜ |

---

## 6 — Dashboard

| # | Check | Result |
|---|-------|--------|
| D1 | KPI cards: Total Inventory Value, SKU count, Low Stock, Near Expiry, Damage value | ⬜ |
| D2 | Trend charts: stock value, inbound vs issue, damage (daily/weekly/monthly) | ⬜ |
| D3 | Category distribution: pie/bar chart by inventory value | ⬜ |
| D4 | Recent transactions: last 10 inbound, issues, transfers, adjustments | ⬜ |
| D5 | Filters: date range, branch | ⬜ |
| D6 | Role-based data visibility: ผู้บริหาร sees all, others see their branch | ⬜ |
| D7 | Real-time data: reflects latest stock movements | ⬜ |
| D8 | Empty state: no data display when system is fresh | ⬜ |
| D9 | Performance: page load < 3s with 10,000+ SKU records | ⬜ |
| D10 | Mobile responsive: dashboard readable on phone | ⬜ |

---

## 7 — Reports

| # | Check | Result |
|---|-------|--------|
| R1 | 9 report types available: SOH, Inbound, Requisition, Consumption, Damage, Expiry, Transfer, Count Variance, Audit Trail | ⬜ |
| R2 | Filters for each report: date range, branch, warehouse, category, SKU | ⬜ |
| R3 | Export: Excel (.xlsx) | ⬜ |
| R4 | Export: CSV | ⬜ |
| R5 | Export: PDF | ⬜ |
| R6 | Summary totals at end of report | ⬜ |
| R7 | Data accuracy: report numbers match actual balance/transactions | ⬜ |
| R8 | Role-based access: proper RO data permissions | ⬜ |
| R9 | Empty report: no data message, not empty/error page | ⬜ |
| R10 | Large dataset: export handles 10,000+ rows without timeout | ⬜ |

---

## Cross-Cutting Checks

| # | Check | Result |
|---|-------|--------|
| X1 | All stock movements atomic (DB transaction) | ⬜ |
| X2 | No negative stock balance without approval | ⬜ |
| X3 | Audit trail on every table (created_by, updated_by, timestamps) | ⬜ |
| X4 | No deletion of movement records (immutable history) | ⬜ |
| X5 | Role-based access enforced on all API routes | ⬜ |
| X6 | `npm run build` passes with zero errors | ⬜ |
| X7 | `npx tsc --noEmit` passes with zero errors | ⬜ |
| X8 | No console errors in browser | ⬜ |
| X9 | Responsive layout on mobile and desktop | ⬜ |
| X10 | Loading states for all async operations | ⬜ |

---

## QA Process

1. Builder completes module implementation
2. QA Agent loads module QA checklist section
3. QA Agent inspects code, runs tests, checks acceptance criteria
4. Each check marked VERIFIED / NOT VERIFIED / UNKNOWN
5. Failed checks → comment on issue with details
6. Builder fixes → QA re-verifies
7. All VERIFIED → PM approves → state updated → next task dispatched
