# PHASE_1_SCOPE_LOCK.md — MVP Scope Lock

**This document defines exactly what Phase 1 builds and what is explicitly deferred.**
**No Phase 2/3 work may begin without user approval.**

---

## ✅ Phase 1 — Build These Modules

| # | Module | Route | Purpose |
|---|--------|-------|---------|
| 1 | Create | `/create` | Manual Mode + Batch Theme Mode |
| 2 | Brief Builder | `/briefs` | Create/edit content brief from topic |
| 3 | Rule Loader | `/rules` | Load brand/legal/image/platform rules |
| 4 | Content Generation | `/content-generation` | Generate primary + secondary content in 2 languages |
| 5 | Image Prompt Generation | `/image-prompts` | Generate image prompts from content |
| 6 | Image Generation | `/images` | Generate primary/secondary images via OpenAI |
| 7 | Quality Check | `/quality-check` | Check risk words, brand, spelling, limits |
| 8 | Review & Editing | `/review` | Preview posts + images, approve/reject/revision |
| 9 | Calendar | `/calendar` | View scheduled posts with warnings |
| 10 | Publishing | `/publishing` | Buffer schedule/publish with logs |
| 11 | Dashboard | `/dashboard` | Status cards: today, pending, published, failed |
| 12 | Logs | `/logs` | Audit trail: generation, image, publish, error logs |
| — | Settings | `/settings` | API key config, brand profile (minimal — not a workflow module) |

## ❌ Phase 2/3 — Deferred (Do NOT Build)

| Module | Reason for Deferral |
|--------|---------------------|
| Full Source Search / Official Source Routing | Requires external API integrations (Tavily, Brave). Not needed for core content generation flow. |
| Google Drive RAG / pgvector | Requires RAG infrastructure. Not needed until knowledge base is populated. |
| Competitor Monitoring | Separate feature. Not part of core publishing workflow. |
| Advanced Analytics | Requires data accumulation. Not useful until content is being published. |
| Learning Loop (full system) | Requires feedback data. Not useful until content is published and measured. |
| Advanced Drag-and-Drop Calendar | Nice-to-have UI improvement. Basic calendar with filters is sufficient. |
| Content Library / Content Database | Not in 12-module MVP. Route exists in sidebar but gets Phase 2 placeholder. |
| Multi-Platform Direct API | Buffer already handles multi-platform. Direct Meta/LinkedIn APIs add scope without immediate value. |

## 🛑 Scope Guard Rules

1. **No new external tools** without written justification in a task.
2. **No Supabase schema changes** outside what CODEX_TASK_QUEUE.md specifies.
3. **No direct Meta/LinkedIn/Twitter API integration** — Buffer is the only publisher.
4. **No pgvector or embeddings** in Phase 1 — knowledge search is placeholder only.
5. **No yearly calendar view or drag-and-drop** — basic month/week view only.
6. **No analytics pipeline** — dashboard counts are database-driven (no third-party analytics).
7. **No multi-model AI routing** — OpenAI only for both text and image generation.
8. **No custom auth** — use Supabase Auth if needed.

## 📐 Architectural Constraints

- All content lives under a single `post_id` per creation session.
- Posts have a primary post (main language) and secondary first comment (second language).
- Images share a `visual_concept_id` with identical layout/mood/hero but different visible text.
- The Buffer API is the single publishing channel.
- Logs are stored in database tables, not files.
- Sidebar navigation must be scrollable and support all 17 modules (with placeholder pages for Phase 2/3).

## ✅ Phase 1 Complete Criteria

1. A user can create a topic/theme → generate a brief → generate dual-language content.
2. The system generates image prompts and produces primary + secondary images.
3. Quality Check runs and flags issues.
4. User can review, edit, approve, or request revision.
5. Approved posts appear in the Calendar with scheduling info.
6. Posts can be published via Buffer (or marked for manual action).
7. Dashboard shows live counts from the database.
8. Logs capture every generation, image creation, and publish action.
9. `npm run build` succeeds with zero errors.
10. `npx tsc --noEmit` passes with zero errors.