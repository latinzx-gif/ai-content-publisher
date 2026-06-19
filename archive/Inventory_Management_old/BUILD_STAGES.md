# BUILD_STAGES.md — Inventory Management System

**Purpose:** Define build stages for Phase 1 development  
**Builder:** Codex CLI (GPT-5.4)  
**QA:** Gemini 2.5 Pro  
**PM:** Hermes (Claude Sonnet 4)

---

## Stage 0: Foundation Setup

| Step | Action | Details |
|------|--------|---------|
| 0.1 | Initialize Next.js project | `npx create-next-app@latest` with TypeScript, Tailwind, shadcn/ui |
| 0.2 | Supabase project setup | Create project, get API keys, set up .env |
| 0.3 | DB schema creation | Run initial migration: all master tables |
| 0.4 | Auth/RLS setup | 5 RBAC roles with Supabase Auth + Row Level Security |
| 0.5 | Base layout + navigation | Sidebar navigation with role-based menu visibility |
| 0.6 | Git init + initial commit | Branch: `main` |

**QA Check:** Foundation — schema integrity, auth flow, navigation works

---

## Stage 1: Master Data (Builder: GPT-4o)

| Step | Action | Details |
|------|--------|---------|
| 1.1 | SKU CRUD | Full create, read, update, soft-delete with table stale |
| 1.2 | Branch/Warehouse CRUD | Branch with multiple warehouses |
| 1.3 | Supplier CRUD | With supplied items association |
| 1.4 | Unit Conversion | Multi-unit SKU with conversion rates |
| 1.5 | BOM/Recipe | Menu → ingredients with quantities and waste % |

**QA Check:** All CRUD works, schema integrity, data validation

---

## Stage 2: Inbound (Builder: Claude Sonnet 4)

| Step | Action | Details |
|------|--------|---------|
| 2.1 | GRN create form | Supplier, warehouse, date, reference, notes |
| 2.2 | SKU line items | Add SKU with lot, expiry, qty, cost |
| 2.3 | Barcode scan | Scan barcode → auto-fill SKU |
| 2.4 | File attachments | Upload photos/documents to Supabase Storage |
| 2.5 | Approval workflow | Draft → Verify → Approve |
| 2.6 | Stock update on approve | Atomic balance update + lot tracking |

**QA Check:** Full inbound flow, balance accuracy, attachment storage

---

## Stage 3: Kitchen Requisition (Builder: Claude Sonnet 4)

| Step | Action | Details |
|------|--------|---------|
| 3.1 | Request form | Branch, requester, date, SKU + qty, current balance display |
| 3.2 | Approval workflow | Approve (partial), reject |
| 3.3 | Issue goods | Actual qty, lot selections |
| 3.4 | Confirm receipt | Kitchen confirms with actual received qty |

**QA Check:** Full requisition flow, balance deductions correct

---

## Stage 4: Consumption & Damage (Builder: Gemini 2.5 Pro)

| Step | Action | Details |
|------|--------|---------|
| 4.1 | Consumption recording | Daily/weekly usage entry per SKU |
| 4.2 | BOM deduction | Sales qty × recipe → auto deduction |
| 4.3 | Damage/spoilage entry | Type, reason, qty, photo |
| 4.4 | Approval for high-value | Escalation path for abnormal amounts |
| 4.5 | Separate reporting | Consumption ≠ Damage in reports |

**QA Check:** Consumption accuracy, damage categorization, approval flow

---

## Stage 5: Stock Count (Builder: Claude Sonnet 4)

| Step | Action | Details |
|------|--------|---------|
| 5.1 | Count plan creation | Cycle/periodic, scope selection |
| 5.2 | SKU list generation | Auto-generate items to count |
| 5.3 | Mobile count entry | Scan barcode → enter physical qty |
| 5.4 | Variance calculation | System vs physical + value difference |
| 5.5 | Adjustment generation | Auto-create with over-threshold approval |

**QA Check:** Count flow, variance accuracy, adjustment generation

---

## Stage 6: Transfer (Builder: Claude Sonnet 4)

| Step | Action | Details |
|------|--------|---------|
| 6.1 | Transfer order | Source → destination, SKU, lot, qty |
| 6.2 | Qty reservation | Status = Transferring, qty reserved |
| 6.3 | Destination receipt | Confirm with actual qty |
| 6.4 | Dual-branch balance update | Source decrement + destination increment |

**QA Check:** Transfer flow, balance consistency across branches

---

## Stage 7: Dashboard (Builder: Claude Sonnet 4)

| Step | Action | Details |
|------|--------|---------|
| 7.1 | KPI cards | 5 cards with live data |
| 7.2 | Trend charts | 3 chart types with date range |
| 7.3 | Category distribution | Pie/bar chart |
| 7.4 | Recent transactions | Latest 10 per type |
| 7.5 | Role-based filtering | Admin sees all, others see branch only |

**QA Check:** Dashboard accuracy, performance, responsiveness

---

## Stage 8: Reports (Builder: Claude Sonnet 4)

| Step | Action | Details |
|------|--------|---------|
| 8.1 | 9 report UIs | One page per report type |
| 8.2 | Filters | Date range, branch, warehouse, category, SKU |
| 8.3 | Excel export | xlsx generation |
| 8.4 | CSV export | csv generation |
| 8.5 | PDF export | pdf generation with proper formatting |

**QA Check:** Report data accuracy, all exports work, large dataset handling

---

## Stage 9: Final QA & Polish

| Step | Action | Details |
|------|--------|---------|
| 9.1 | Full integration test | All flows end-to-end |
| 9.2 | Data integrity audit | Balance = sum of movements |
| 9.3 | Performance test | Dashboard < 3s, export < 10s |
| 9.4 | Security review | RLS, role enforcement, input validation |
| 9.5 | Responsive check | All pages on mobile + desktop |
| 9.6 | PM final review | Scope check, state update, Phase 1 sign-off |

---

## Build Guardrails

- Every build step must pass `npm run build` + `npx tsc --noEmit`
- QA reviews each stage before PM approves next stage
- No Phase 2/3 features in any stage
- All stock movements in DB transactions
- No deletion of movement records
- Audit trail on all stock-related changes
