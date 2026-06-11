# AI Content Publisher — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** 2026-06-09  
**Author:** Claude (based on source code audit)  
**Status:** Phase 1 Close-out

---

## 1. Product Overview

**AI Content Publisher** คือระบบสร้างและเผยแพร่ content โซเชียลมีเดียแบบ AI-assisted สำหรับทีม Marketing/Legal ที่ต้องการ content ที่ปลอดภัยทางแบรนด์และกฎหมาย รองรับ **dual-language** (ภาษาหลัก + ภาษารอง) พร้อม QC gate ก่อน publish

**Stack:** Next.js 16 App Router · Supabase · OpenAI (GPT + DALL-E) · Buffer API · Tailwind 4 · shadcn/ui

---

## 2. Problem Statement

ทีม marketing/legal ที่ต้องผลิต content โซเชียลสม่ำเสมอมีปัญหา:
- ใช้เวลานานในการ draft + ตรวจสอบ content รายวัน
- ยากต่อการรักษา brand voice และ legal compliance พร้อมกัน
- ไม่มี workflow มาตรฐานสำหรับ review → approve → publish
- ภาษาที่หลากหลาย (Thai/English) ทำให้ QC ซับซ้อน

---

## 3. Target Users

| Role | ใช้งานหน้าไหน | ความต้องการหลัก |
|------|--------------|----------------|
| Content Creator | Create → Briefs → Content → Images | สร้าง draft เร็ว ถูก tone |
| Legal/Compliance | Rules → Quality Check → Review | ตรวจสอบ prohibited claims |
| Marketing Manager | Review → Calendar → Publishing | Approve + Schedule posts |
| Admin/System | Settings → Logs → Analytics | ดู audit trail, ตั้งค่า API |

---

## 4. Core Workflow (Phase 1 — Production Target)

```
Create → Brief → Rules → Content Generation → Image Prompts
→ Images → Quality Check → Review → Calendar → Publishing
→ Dashboard → Logs
```

ทุก module ผูกกัน ด้วย **`post_id`** เดียว ต่อ 1 session

### Post Status Model

```
draft → revision_requested → approved → scheduled → published
                                                   ↘ failed
```

---

## 5. Feature Requirements

### 5.1 Create (`/create`)

**Goal:** สร้าง `post_id` ใหม่ และกำหนด metadata เริ่มต้น

| Field | Options |
|-------|---------|
| Mode | Manual / Batch |
| Topic | free text |
| Brand | free text |
| Platform | Facebook, Instagram, LinkedIn, Twitter/X, TikTok, Threads |
| Language (Primary) | Thai, English, Chinese, Japanese, Korean |
| Category | Brand update, Thought leadership, Educational, Promotion, Community, Product |
| Objective | awareness, engagement, conversion, education, entertainment |
| Schedule Date | date picker |

**Output:** draft บันทึก localStorage → ส่ง `post_id` ต่อไปทุก module

---

### 5.2 Brief Builder (`/briefs`)

**Goal:** AI สรุป content brief จาก topic + brand context

**Input:** topic, brand, platform, language + `post_id`  
**Output (Brief object):**
- topic, brand, platform, language
- target_audience
- key_points (array)
- tone_of_voice
- call_to_action
- compliance_notes

**Actions:** Generate Brief · Edit fields · Save to Supabase

---

### 5.3 Rules (`/rules`)

**Goal:** โหลด brand rules มาผูกกับ post_id เพื่อใช้ใน QC + generation

**Input:** brand, platform, language  
**Output (Rules object):**
- brand_voice (array of guidelines)
- prohibited_claims (array)
- platform_limits: max_length, formatting, disclosure
- image_style_guide: composition, color, text_overlay
- language_style_guide: register, localization

**Actions:** Load Rules · Save to Supabase

---

### 5.4 Content Generation (`/content-generation`)

**Goal:** AI สร้าง copy ภาษาหลัก + ภาษารอง โดยอิงจาก Brief + Rules

**Input:** brief (from DB), rules (from DB), primary language, secondary language  
**Output (per language):**
- post_text (main body)
- first_comment (under-post comment)
- hashtags (array)
- generated_at timestamp

**Actions:** Generate · Regenerate (per language) · Edit inline · Save to Supabase

**AI:** OpenAI GPT (INT-03 ✅)

---

### 5.5 Image Prompts (`/image-prompts`)

**Goal:** AI สร้าง image prompt สำหรับ primary + secondary โดยแชร์ `visual_concept_id`

**Output (per type):**
- visual_concept_id (shared บน primary/secondary)
- hero_object
- mood
- layout
- color_palette
- text_language
- negative_prompt

**Actions:** Generate Prompts · Save to Supabase

---

### 5.6 Images (`/images`)

**Goal:** สร้างรูปภาพจาก prompt ผ่าน DALL-E 3

**Input:** image_prompts (from DB per post_id)  
**Output:** image_url per type/version, version history

**Actions:** Generate Primary · Generate Secondary · View version history

**AI:** DALL-E 3 via OpenAI (INT-04 — กำลังทำ)  
**Storage:** DALL-E URL direct (Option A) หรือ Supabase Storage (Option B)

---

### 5.7 Quality Check (`/quality-check`)

**Goal:** ตรวจสอบ content ก่อน review ด้วย 7 checks

**Checks (via OpenAI AI-based):**
1. Brand voice compliance
2. Prohibited claims
3. Platform character limit
4. Hashtag count/appropriateness
5. Language register consistency
6. Call-to-action clarity
7. Disclosure requirements

**Output per check:** status (pass/warn/fail/note) + details  
**Actions:** Run Checks · Save Results to Supabase

---

### 5.8 Review Dashboard (`/review`)

**Goal:** รวม pipeline ทั้งหมดไว้ในหน้าเดียว ให้ reviewer ตัดสินใจได้

**Features:**
- โหลด content + images + QC results จาก DB
- Post preview (primary + secondary)
- Pipeline log (info/warn/error/success per step)
- Actions: **Approve** · **Request Revision** · **Reject** · Save Draft
- Auto-generate images ถ้ายังไม่มี
- กำหนด platforms + auto-publish option

**Agents visible:** Orchestrator, Content Agent, Image Prompt Agent, Image Composer Agent, Quality Agent, Publish Agent, Manual Reviewer

---

### 5.9 Calendar (`/calendar`)

**Goal:** ดูและจัดการ schedule ของ posts ทั้งหมด

**Views:** Month · Week · Day (Asia/Bangkok timezone)  
**Filters:** Status · Platform · Brand  
**Features:**
- Drag-and-drop รื้อ schedule
- Color coding ตาม status
- Warning threshold เมื่อ >3 posts/วัน
- Max capacity 5 posts/วัน

---

### 5.10 Publishing Queue (`/publishing`)

**Goal:** ส่ง post ที่ approved/scheduled ไปยัง Buffer API

**Shows:** posts ที่ status = approved, scheduled, failed  
**Actions per post:** Publish Now · Schedule (datetime) · Retry  
**Buffer integration:** mock ปัจจุบัน → real Buffer API (INT-05)

---

### 5.11 Dashboard (`/dashboard`)

**Goal:** Overview สถานะ posts ทั้งหมดแบบ real-time

**KPI Cards:**
- Today's Posts → /calendar
- Upcoming → /calendar
- Pending Approval → /review
- Approved → /publishing
- Scheduled → /calendar
- Published → /logs
- Failed → /publishing
- Manual Action → /publishing

**Data source:** Supabase live query

---

### 5.12 Logs (`/logs`)

**Goal:** Audit trail ทุก action ในระบบ

**Fields:** timestamp, type, action, post_id, details, status, agent  
**Filters:** type (generation/image/publish/error) · date range · post_id · agent  
**Sort:** asc/desc

---

### 5.13 Analytics (`/analytics`)

**Goal:** วิเคราะห์ agent workload จาก logs

**Metrics:** total events, events per agent, success/warn/error breakdown  
**Filter:** date range (today/7d/30d/all)  
**Shows:** most-used agent, bar chart ต่อ agent

---

### 5.14 Settings (`/settings`)

**Goal:** ตั้งค่า API keys + brand config  
**Status:** placeholder card (Phase 1 — ยังไม่ implement)  
**Planned fields:** OpenAI API key, Buffer token, brand profile defaults

---

## 6. Phase 2 Features (Deferred — Placeholder เท่านั้น)

| Route | Feature | Notes |
|-------|---------|-------|
| `/sources` | Source intake, citations, evidence review | ใช้ RAG/search |
| `/knowledge` | Approved source material, brand facts, knowledge governance | pgvector |
| `/content-library` | Reusable content records, search, campaign history | — |

---

## 7. Phase 3 Features (Future)

| Route | Feature |
|-------|---------|
| `/learning-loop` | Feedback signals, performance learning, optimization loops |
| Direct social APIs | Meta, LinkedIn, Twitter APIs (ไม่ผ่าน Buffer) |
| Multi-model routing | ใช้ model หลายตัวสำหรับงานต่างกัน |

---

## 8. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Auth | Supabase Auth (Phase 1 optional, Phase 2 required) |
| Storage | Supabase + `acp_` table prefix (shared project `ai-auto-tools`) |
| AI | OpenAI only (Phase 1) — text + images |
| Publishing | Buffer API only (Phase 1) |
| Language | Dual-language per post (primary + secondary) |
| Images | Primary/secondary share `visual_concept_id` |
| Audit | All AI actions logged to `acp_audit_logs` |
| Build | `npm run build` + `typecheck` + `lint` must pass |
| Timezone | Asia/Bangkok (calendar display) |

---

## 9. Integration Close-out Queue

| Task | Status | What |
|------|--------|------|
| INT-01 | ✅ Done | Supabase schema (`acp_` tables) |
| INT-02 | ✅ Done | localStorage → Supabase |
| INT-03 | ✅ Done | OpenAI text generation |
| INT-04 | 🔄 In Plan | DALL-E image generation |
| INT-05 | ⏳ Pending | Buffer real API + Settings UI |
| INT-06 | ⏳ Pending | Supabase Auth |
| QA-01 | ⏳ Pending | E2E verification |
| CLOSE-01 | ⏳ Pending | Phase 1 sign-off |

---

## 10. Success Criteria (Phase 1 Sign-off)

- [ ] User สร้าง post ได้ครบ flow ตั้งแต่ Create → Publish
- [ ] ข้อมูลทั้งหมด persist ใน Supabase (ไม่ใช่ localStorage)
- [ ] Text สร้างจาก OpenAI จริง
- [ ] Images สร้างจาก DALL-E 3 จริง
- [ ] Publish ไปยัง Buffer API จริงได้
- [ ] Audit logs ครบทุก action
- [ ] `npm run build`, `lint`, `typecheck` pass
