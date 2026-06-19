# WORKFLOW_SUPPORT.md — ซัพพอต / Research / QA

> Hermes ใช้ไฟล์นี้สำหรับ task ที่ไม่ใช่ build หรือ fix
> Ponytail mindset: ตอบให้ตรงประเด็น ไม่ขยาย scope โดยไม่จำเป็น

**Last Updated:** 2026-06-18

---

## Support Categories

| Category | Trigger | Agent | Model |
|----------|---------|-------|-------|
| **Research** | `research`, `analyze`, `market`, `DataClaw`, `ข้อมูล` | Researcher | gemini-3.1-pro-preview |
| **Triage / Brief** | `brief`, `summary`, `what's next`, `morning`, `สรุป` | Analyst | gemini-3.5-flash |
| **Pre-delivery Audit** | `audit`, `pre-delivery`, `quality gate`, `ก่อน deliver` | Auditor | gpt-5.5 |
| **Documentation** | `docs`, `SOP`, `template`, `เอกสาร` | Researcher / Analyst | ตาม context size |
| **Client Support** | `client`, `reply`, `feedback`, `ลูกค้า` | Analyst → Hermes review | gemini-3.5-flash |

---

## Flow: Research

```
INPUT: Research brief / question / DataClaw task
  │
  ▼
STEP 1 — Ponytail Check
  └─ มีข้อมูลนี้อยู่ใน existing files แล้วไหม?
     ├─ มี → อ้างอิงไฟล์เดิม (ไม่สร้างซ้ำ)
     └─ ไม่มี → ไป STEP 2
  │
  ▼
STEP 2 — Researcher (Gemini CLI / gemini-3.1-pro-preview)
  Input:  research brief + existing data assets + source list
  Rules:
    - ตอบเฉพาะสิ่งที่ถาม — ไม่ขยาย scope
    - แยก Fact / Insight / Hypothesis / Unknown ชัดเจน
    - อ้างอิง source เสมอ
    - ถ้า context > 50K tokens → Researcher เท่านั้น (ห้ามใช้ Analyst)
  Output: RESEARCH_RESULT.md
  STOP ✋ ส่งให้ Hermes review
```

---

## Flow: Triage / Morning Brief

```
INPUT: Current state files (ตาม Morning Brief SOP)
  │
  ▼
Analyst (Gemini CLI / gemini-3.5-flash)
  Input:  HEAD_OFFICE_CURRENT_STATE.md + PRIORITY_QUEUE.md + NEXT_TASKS.md
  Rules:
    - สรุปสั้น — max 5 bullet
    - เลือก 1 task P1 เท่านั้น
    - ใช้ keyword scoring ตาม MORNING_BRIEF_SOP.md
  Output: latest_morning_brief.md + pending_agent_task.md
  → ส่ง Telegram → รอ user APPROVE
```

---

## Flow: Pre-Delivery Audit

```
INPUT: project folder + DELIVERY_READINESS checklist
  │
  ▼
STEP 1 — Ponytail Check
  └─ quality gates ผ่านแล้วหรือยัง?
     ├─ ยัง → แจ้ง Builder แก้ก่อน (ห้าม audit งานที่ยัง fail)
     └─ ผ่าน → ไป STEP 2
  │
  ▼
STEP 2 — Auditor (Codex CLI / gpt-5.5)
  Input:  codebase + GROUND_TRUTH.md + checklist
  Checks:
    - [ ] build / typecheck / lint pass
    - [ ] ไม่มี secret ใน source code
    - [ ] ไม่มี console.log / debug code เหลือ
    - [ ] Error handling ครบ (ไม่ silent fail)
    - [ ] Input validation ที่ trust boundary
    - [ ] Ponytail: review สิ่งที่ build ว่ามี over-engineering ไหม?
  Output: DELIVERY_READINESS_AUDIT.md
  Verdict: 🟢 READY / 🟡 READY WITH CAVEATS / 🔴 NOT READY
  STOP ✋ ส่งให้ Hermes
  │
  ▼
STEP 3 — Hermes decision
  ├─ 🟢/🟡 → approve delivery
  └─ 🔴    → dispatch Fix team ก่อน
```

---

## Flow: Documentation / SOP

```
INPUT: completed work / repeated task / new process
  │
  ▼
Analyst (Gemini CLI / gemini-3.5-flash) — ถ้า context สั้น
Researcher (Gemini CLI / gemini-3.1-pro-preview) — ถ้า context ยาว

  Rules:
    - เขียนแค่สิ่งที่ agent ถัดไปต้องรู้จริงๆ (Ponytail for docs)
    - ไม่เขียน background ที่ไม่จำเป็น
    - format: checklist / SOP / template — เลือกที่สั้นที่สุด
  Output: ไฟล์ .md ใน path ที่เหมาะสม
  STOP ✋ ส่ง Hermes review
```

---

## RESEARCH_RESULT.md Template

```markdown
# RESEARCH_RESULT.md

## Question
[คำถาม / brief]

## Summary
[สรุป 3-5 บรรทัด]

## Facts (ยืนยันแล้ว)
- [fact 1] — Source: [URL/file]

## Insights
- [insight 1]

## Hypotheses (ยังไม่ยืนยัน)
- [hypothesis 1]

## Unknowns
- [สิ่งที่ยังไม่รู้]

## Sources
- [source 1]
```
