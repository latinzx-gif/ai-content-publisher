# ROADMAP.md — AI Content Publisher

---

## Overview

Build an Automated Content + Image + Publishing SaaS with 17 workflow stages.
Phase 1 implements the MVP (12 stages). Phases 2/3 add advanced features.

---

## Phase 1: MVP — ✅ CLOSED (2026-06-10)

**Goal:** Working end-to-end Create → Brief → Content → Image → QC → Review → Calendar → Publish → Dashboard → Logs

| # | Stage | Status | Route |
|---|-------|--------|-------|
| 00 | Audit + Product Shell | ✅ Done | — |
| 01 | Create Flow | ✅ Done | `/publisher/create` |
| 02 | Brief Builder | ✅ Done | `/publisher/briefs` |
| 03 | Rule Loader | ✅ Done | `/publisher/rules` |
| 04 | Dual-Language Content Generation | ✅ Done | `/publisher/content-generation` |
| 05 | Image Prompt Generation | ✅ Done | `/publisher/image-prompts` |
| 06 | Image Generation (DALL-E 3) | ✅ Done | `/publisher/images` |
| 07 | Quality Check | ✅ Done | `/publisher/quality-check` |
| 08 | Review & Editing | ✅ Done | `/publisher/review` |
| 09 | Calendar | ✅ Done | `/publisher/calendar` |
| 10 | Publishing (Buffer) | ✅ Done | `/publisher/publishing` |
| 11 | Dashboard | ✅ Done | `/publisher` |
| 12 | Logs & Audit Trail | ✅ Done | `/publisher/logs` |
| 13 | QA & Demo Readiness | ✅ Done | — |

**Phase 1 sign-off:** `reports/PHASE_1_SIGNOFF.md`  
**Known remaining:** Buffer live token (`BUFFER_ACCESS_TOKEN`) + authenticated E2E

## Phase 1.1: Refactor + Hardening — ✅ CLOSED (2026-06-10)

| Task | Status |
|------|--------|
| Lint 0 errors | ✅ |
| Playwright gate tests (13) | ✅ |
| `src/features/prd/` foundation | ✅ |
| Sidebar → SafetyConfirmationDialog slices (P1-04c–s) | ✅ |
| `page.tsx` monolith split (in progress) | 🔄 ~13,182 lines |

**Active:** P1-04t `EndToEndWorkflowSimulation` — see `orchestration/CURRENT_TASK.md`

---

## Phase 2: Enhanced Capabilities (Deferred)

| Stage | Details |
|-------|---------|
| Full Source Search | Official Source Routing, RSS/API-based search |
| Internal Knowledge Search | Google Drive RAG, pgvector |
| Competitor Monitoring | Automated competitor content tracking |
| Advanced Analytics | Content performance metrics, engagement data |
| Advanced Calendar | Drag-and-drop, yearly view, multi-platform |

**Do not start Phase 2 until Phase 1 is stable and user approves.**

---

## Phase 3: Scale & Intelligence (Deferred)

| Stage | Details |
|-------|---------|
| Learning Loop | Full feedback-driven content improvement |
| Multi-Platform Publishing | Direct Meta/LinkedIn/Twitter API integration |
| Advanced RAG | Full vector search across all knowledge sources |
| Multi-Model Routing | Choose between AI models per stage |

**Do not start Phase 3 until Phase 2 is stable and user approves.**