# DECISION_LOG.md — Inventory Management System

**Purpose:** Record all architectural, technical, and business decisions for this project.

---

## Decision 1: Multica as Multi-Agent Runtime

| Field | Value |
|-------|-------|
| **Date** | 2026-06-08 |
| **Decision** | Use Multica as the primary agent runtime for orchestrating 7 agent roles |
| **Rationale** | Multica supports multi-agent bridge pattern, native issue tracking, and skill-based agent configuration |
| **Alternatives** | Single-agent approach (rejected — complexity of 10 modules needs specialization) |
| **Consequences** | All agent definitions and runtimes managed through Multica platform |

---

## Decision 2: Agent Model Allocation

| Field | Value |
|-------|-------|
| **Date** | 2026-06-08 |
| **Decision** | Assign different AI models per agent role based on strength |
| **Details** | PM Orchestrator → Claude Sonnet 4 (reasoning, planning, Thai language) · Master Data → GPT-4o (CRUD speed) · Ops → Claude Sonnet 4 (complex state) · Consumption → Gemini 2.5 Pro (large context) · Dashboard → Claude Sonnet 4 (UI quality) · Mobile → GPT-4o (responsive design) · QA → Gemini 2.5 Pro (1M+ context for code review) |
| **Rationale** | Each model has distinct strengths — matching role to model maximizes quality |
| **Consequences** | Requires explicit model routing per agent, non-trivial bridging cost |

---

## Decision 3: Build Order — Templates Before Prompt Library

| Field | Value |
|-------|-------|
| **Date** | 2026-06-08 |
| **Decision** | Build order: Master Data → Inbound → Requisition → Consumption/Damage → Stock Count → Transfer → Dashboard → Reports |
| **Rationale** | Data-first approach — all operational modules depend on Master Data being established |
| **Alternatives** | Dashboard-first or Reports-first (rejected — no data without operational modules) |
| **Consequences** | Phase 1 is sequential; delays in Master Data block all downstream modules |

---

## Decision 4: Tech Stack

| Field | Value |
|-------|-------|
| **Date** | 2026-06-08 |
| **Decision** | Next.js 16 + shadcn/ui + PostgreSQL/Supabase + Tailwind CSS |
| **Rationale** | Proven stack in HEAD-OFFICE ecosystem. shadcn/ui for consistent component library. Supabase for DB + Storage + Auth. |
| **Alternatives** | React + Material UI (rejected — no Supabase integration experience in workspace) |
| **Consequences** | All builder agents must use this stack; no tech divergence allowed |

---

## Decision 5: No Vector Search / Embeddings

| Field | Value |
|-------|-------|
| **Date** | 2026-06-08 |
| **Decision** | No pgvector, embeddings, or vector search in any phase |
| **Rationale** | Current scope uses plain key-value data with SQL ILIKE search. Vector search adds complexity without benefit. |
| **Consequences** | All search features use standard SQL; future AI features (Phase 3) may re-evaluate |

---

## Decision 6: Stock Balance — Atomic Movement

| Field | Value |
|-------|-------|
| **Date** | 2026-06-08 |
| **Decision** | Every stock movement (Inbound, Requisition, Consumption, Transfer, Adjustment) updates balance atomically in the same transaction |
| **Rationale** | Prevents data inconsistency — balance cannot go negative without special approval |
| **Consequences** | All builder agents must wrap balance updates in DB transactions; requires careful rollback handling |

---

## Decision 7: 5-Role RBAC

| Field | Value |
|-------|-------|
| **Date** | 2026-06-08 |
| **Decision** | 5 user roles: Admin, หัวหน้าคลัง, เจ้าหน้าที่คลัง, หัวหน้าครัว, ผู้บริหาร |
| **Rationale** | Covers all stakeholders in restaurant multi-branch operations |
| **Consequences** | All UI and API routes must check role permissions; mobile/PDA features must respect role restrictions |

---

## Decision 8: Mobile = Responsive Web, Not Native App

| Field | Value |
|-------|-------|
| **Date** | 2026-06-08 |
| **Decision** | Mobile support via responsive web (PWA possible), not native iOS/Android |
| **Rationale** | Single codebase, faster delivery, no app store deployment overhead. Camera API and barcode scanner work via HTML5. |
| **Alternatives** | React Native / Flutter (rejected — slower delivery, dual maintenance) |
| **Consequences** | Phase 2 scope; all modules must be responsive from Phase 1 to avoid redesign |

---

## Decision 9: QA After Every Module

| Field | Value |
|-------|-------|
| **Date** | 2026-06-08 |
| **Decision** | QA Agent reviews every module implementation before PM approval |
| **Rationale** | Prevents cascading defects — if Master Data has bugs, 7 downstream modules inherit them |
| **Consequences** | Each build step is followed by a QA step — doubles the number of workflow steps but increases quality |

---

## Decision 10: Phase 1 Scope Lock

| Field | Value |
|-------|-------|
| **Date** | 2026-06-08 |
| **Decision** | Phase 1 strictly covers 8 P1 modules. Phase 2 (Alerts, Mobile) and Phase 3 (POS, Accounting, AI) are locked with gate protection. |
| **Rationale** | Clear MVP boundary prevents scope creep. Revenue-first: core operational features before convenience features. |
| **Consequences** | PM Orchestrator must reject any Phase 2/3 work requests until Phase 1 is complete and approved |
