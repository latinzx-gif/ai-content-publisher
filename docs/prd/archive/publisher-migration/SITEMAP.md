# AI Content Publisher — Sitemap

**Version:** 1.0 | **Date:** 2026-06-09

---

## Visual Sitemap

```
/ (root)
│
├── 📊 MAIN
│   ├── /dashboard          [P1] ✅ Live DB stats — Today/Upcoming/Pending/Published/Failed
│   ├── /create             [P1] ✅ New post — topic/brand/platform/language/category/objective
│   ├── /review             [P1] ✅ Review hub — Preview + Approve/Reject/Revision + Pipeline log
│   ├── /calendar           [P1] ✅ Month/Week/Day view — Drag-drop schedule (Asia/Bangkok)
│   └── /publishing         [P1] ✅ Publish queue — Buffer publish/schedule/retry
│
├── ⚙️ WORKFLOW (ทุก page ต้องมี ?post_id=...)
│   ├── /briefs             [P1] ✅ Brief Builder — AI generate brief จาก topic+brand
│   ├── /rules              [P1] ✅ Rules Loader — Brand voice, prohibited claims, platform limits
│   ├── /content-generation [P1] ✅ Dual-language content — OpenAI text (primary+secondary)
│   ├── /image-prompts      [P1] ✅ Image prompt generator — shared visual_concept_id
│   ├── /images             [P1] 🔄 DALL-E image generator — version history (INT-04)
│   ├── /quality-check      [P1] ✅ 7 QC checks — AI-based pass/warn/fail/note
│   ├── /sources            [P2] 🔒 Source intake + citations (placeholder)
│   ├── /knowledge          [P2] 🔒 Brand facts + knowledge governance (placeholder)
│   └── /content-library    [P2] 🔒 Reusable content + campaign history (placeholder)
│
├── 🧠 INTELLIGENCE
│   ├── /analytics          [P1] ✅ Agent usage analytics — bar chart, date filter
│   └── /learning-loop      [P3] 🔒 Feedback signals + optimization (placeholder)
│
└── 🔧 SYSTEM
    ├── /logs               [P1] ✅ Audit log viewer — filter by type/agent/date/post_id
    └── /settings           [P1] ⚠️  API key config (placeholder card — ยังไม่ implement)
```

**Legend:** ✅ Functional · 🔄 In Progress · ⚠️ Placeholder (Phase 1) · 🔒 Placeholder (Phase 2-3)

---

## Route Detail Table

| Route | Phase | Component | State | post_id required | AI | DB |
|-------|-------|-----------|-------|-----------------|----|----|
| `/dashboard` | P1 | DashboardCards | ✅ Done | ❌ | — | Supabase read |
| `/create` | P1 | CreateForm | ✅ Done | ❌ | — | localStorage |
| `/review` | P1 | ReviewDashboard | ✅ Done | ✅ | GPT + DALL-E | Supabase R/W |
| `/calendar` | P1 | CalendarView | ✅ Done | ❌ | — | Supabase R/W |
| `/publishing` | P1 | PublishQueue | ✅ Done | ❌ | — | Buffer + Supabase |
| `/briefs` | P1 | BriefBuilder | ✅ Done | ✅ | GPT | Supabase R/W |
| `/rules` | P1 | RulesLoader | ✅ Done | ✅ | — | Supabase W |
| `/content-generation` | P1 | ContentGenerator | ✅ Done | ✅ | GPT | Supabase R/W |
| `/image-prompts` | P1 | ImagePromptGenerator | ✅ Done | ✅ | GPT | Supabase R/W |
| `/images` | P1 | ImageGenerator | 🔄 INT-04 | ✅ | DALL-E | Supabase R/W |
| `/quality-check` | P1 | QualityChecker | ✅ Done | ✅ | GPT | Supabase R/W |
| `/analytics` | P1 | AnalyticsPage | ✅ Done | ❌ | — | Supabase read |
| `/logs` | P1 | LogViewer | ✅ Done | ❌ | — | Supabase read |
| `/settings` | P1 | SettingsPage | ⚠️ Shell | ❌ | — | — |
| `/sources` | P2 | SourcesPage | 🔒 Placeholder | — | — | — |
| `/knowledge` | P2 | KnowledgePage | 🔒 Placeholder | — | — | — |
| `/content-library` | P2 | ContentLibraryPage | 🔒 Placeholder | — | — | — |
| `/learning-loop` | P3 | LearningLoopPage | 🔒 Placeholder | — | — | — |

---

## User Journey Map

### Flow 1: สร้าง Post ใหม่ (Happy Path)

```
[/create]
  ↓ กรอก topic, brand, platform, language, objective
  ↓ บันทึก draft + สร้าง post_id

[/briefs?post_id=xxx]
  ↓ Generate Brief (OpenAI)
  ↓ แก้ไข + Save

[/rules?post_id=xxx]
  ↓ Load Rules (brand + platform + language)
  ↓ Save

[/content-generation?post_id=xxx]
  ↓ Generate Content (primary Thai + secondary English)
  ↓ แก้ไข inline + Save

[/image-prompts?post_id=xxx]
  ↓ Generate Image Prompts (primary + secondary, shared visual_concept_id)
  ↓ Save

[/images?post_id=xxx]
  ↓ Generate Primary Image (DALL-E 3)
  ↓ Generate Secondary Image (DALL-E 3)
  ↓ Version history saved

[/quality-check?post_id=xxx]
  ↓ Run 7 checks (AI-based)
  ↓ Review pass/warn/fail
  ↓ Save results

[/review?post_id=xxx]
  ↓ Preview post (primary + secondary)
  ↓ Approve → status = "approved"

[/calendar]
  ↓ Set schedule date/time

[/publishing]
  ↓ Buffer Publish/Schedule
  ↓ status = "published" / "scheduled"

[/dashboard]
  ↓ ดู stats สรุป

[/logs]
  ↓ ตรวจ audit trail
```

### Flow 2: Revision Flow

```
[/review] → Request Revision
  ↓ status = "revision_requested"
  ↓ กลับไป /content-generation หรือ /images
  ↓ แก้ไข + Save ใหม่
  ↓ กลับมา /review → Approve
```

### Flow 3: Failed Publish

```
[/publishing] → Publish fails
  ↓ status = "failed"
  ↓ Retry → ส่งใหม่
  หรือ Manual action → แก้ไขแล้ว retry
```

---

## Sidebar Navigation Groups (as-built)

```
MAIN
├── Dashboard
├── Create
├── Review
├── Calendar
└── Publishing

WORKFLOW
├── Brief Builder
├── Sources (P2)
├── Knowledge (P2)
├── Rules
├── Content Generation
├── Image Prompts
├── Images
├── Quality Check
└── Content Library (P2)

INTELLIGENCE
├── Analytics
└── Learning Loop (P3)

SYSTEM
├── Logs
└── Settings
```

---

## Agents in System

| Agent | บทบาท | ใช้ใน |
|-------|-------|------|
| Orchestrator | ควบคุม pipeline ทั้งหมด | Review |
| Content Agent | สร้าง text content | Content Generation |
| Quality Agent | ตรวจสอบ QC checks | Quality Check |
| Image Prompt Agent | สร้าง image prompts | Image Prompts |
| Image Composer Agent | สร้างรูปภาพ | Images |
| Publish Agent | ส่งไปยัง Buffer | Publishing |
| Manual Reviewer | Human approve/reject | Review |
| System | Log system events | Logs |

---

## Supabase Tables (`acp_` prefix)

| Table | เก็บอะไร |
|-------|---------|
| `acp_posts` | post metadata, status, platform, brand |
| `acp_post_content` | brief, rules, content, image_prompts |
| `acp_post_images` | image_url, type, version, visual_concept_id |
| `acp_audit_logs` | agent, action, status, details per log entry |

---

## URLs ตัวอย่างที่ใช้งาน

```
/create                                    ← สร้าง post ใหม่
/briefs?post_id=demo-001                   ← brief ของ post นั้น
/content-generation?post_id=demo-001       ← generate content
/review?post_id=demo-001                   ← review + approve
/calendar                                  ← ดู schedule ทั้งหมด
/publishing                                ← publish queue
/logs                                      ← audit trail
/analytics                                 ← agent stats
```
