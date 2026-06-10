# DECISION_LOG.md — AI Content Publisher

**Format:** `YYYY-MM-DD | Decision | Rationale | Alternatives`

---

| Date | Decision | Rationale | Alternatives |
|------|----------|-----------|-------------|
| 2026-06-06 | **Phase 1 MVP Scope** | Build 12 stages instead of 17 to ship faster and validate the core workflow. Only fully integrated stages after Review are Calendar, Publishing, Dashboard, and Logs. | Building all 17 stages at once would increase time-to-demo by 3x+ and risk scope creep. |
| 2026-06-06 | **Hermes/Codex Split** | ~~Hermes manages scope, planning, and auditing. Codex implements code one task at a time.~~ **RETIRED 2026-06-10** — replaced by Cursor (Orchestrator) + Claude Code (Implementer). | — |
| 2026-06-10 | **Cursor + Claude Code Only** | Removed Hermes and Codex from the loop. Cursor orchestrates via `CURRENT_TASK.md`. Claude Code implements with model `claude-fable-5`. Simpler, fewer moving parts, same review gate. | Keeping Hermes added overhead with no benefit once Cursor took over the orchestration role. |
| 2026-06-06 | **Existing Stack First** | Use Next.js, React, TypeScript, Tailwind, shadcn/ui, Supabase, OpenAI, Buffer, Vercel. Do not add new tools without written justification. | Adding new frameworks (Prisma, tRPC, etc.) increases learning curve and dependency risk. |
| 2026-06-06 | **Two-Language Model** | Posts have a primary post (main language) and secondary first comment (second language). Images share a visual_concept_id with same layout but different visible text. | Separating into two separate posts would double publishing complexity. |
| 2026-06-06 | **Single post_id** | All generated content (brief, posts, images, QC results, publish logs) shares one `post_id` across the database. | Multiple IDs would require complex joins and increase risk of orphaned data. |
| 2026-06-06 | **Buffer as Primary Publisher** | Use Buffer API for publishing. Do not implement direct Meta/LinkedIn/Twitter APIs in Phase 1. | Buffer handles multi-platform posting with one API. Direct APIs would increase scope 3x. |
| 2026-06-06 | **Defer Full Source Search** | Phase 1 uses placeholder/static sources. Full search with RSS/API routing is Phase 2. | Source search requires external API integrations and RAG infrastructure that is not needed for the core content generation flow. |
| 2026-06-06 | **OpenAI Image API Only** | Use OpenAI's image generation API. Do not add DALL-E 3, Stable Diffusion, or Midjourney in Phase 1. | Single provider reduces integration complexity. Can swap later. |
| 2026-06-06 | **Content Library Deferred to Phase 2** | The Content Library route exists in the sidebar but is not one of 12 MVP modules. It gets a Phase 2 placeholder. | Including it in Phase 1 would add database/query scope without immediate publishing value. |
| 2026-06-06 | **Settings = Phase 1 (minimal)** | Settings page is needed for API key configuration. Must exist as a basic config form. Move to Phase 1 but minimal scope (only API key inputs + brand profile). | Without settings, there's no place to configure OpenAI/Buffer keys. |
| 2026-06-06 | **Audit Complete — Task 01 Approved** | Codex Task 00 (Audit) found no blockers. App is a clean scaffold. Proceeding to Task 01 (Product Shell). | Pre-implementation audit catches missing deps early. |
| 2026-06-09 | **Retire `PROJECTS/AI Content Legal System/`** | Project no longer in use. Lock folder as read-only archive. All new work goes to `head-office-app/` with Supabase `ai-auto-tools` (`luxegqsccaodcikxhwrm`). | Keep maintaining two parallel apps (saas + monorepo app) would duplicate effort and confuse agents. |