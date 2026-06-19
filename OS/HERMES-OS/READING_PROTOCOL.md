# READING_PROTOCOL.md — Hermes Agent Reading Guide

> **Updated: 2026-06-18**
> ไฟล์นี้กำหนด: อ่านอะไรก่อน / ใช้ skill ไหน / compact เมื่อไหร่
> ทุก agent ต้องอ่านไฟล์นี้ก่อนเริ่ม session ใหม่ **ถ้าไม่แน่ใจว่าต้องอ่านอะไร**

---

## 1. Session Start — อ่านตามลำดับนี้เสมอ

### ทุก session (ไม่ว่าโปรเจกต์ใด)

```
1. AGENTS.md                          ← Global rules + Ponytail
2. COMPANY_OS.md                      ← Constitution
3. OS/HERMES-OS/HERMES_TASK_ORDER.md  ← Priority order ล่าสุด
4. OS/HERMES-OS/AGENT_TEAM.md         ← 9-agent team + models
```

### จากนั้น — อ่านตามโปรเจกต์ที่จะทำงาน

---

## 2. Per-Project Reading Order

### P1 — hr-payroll-client

| ลำดับ | ไฟล์ | เหตุผล |
|-------|------|--------|
| 1 | `PROJECTS/hr-payroll-client/GROUND_TRUTH.md` | Scope + phase |
| 2 | `PROJECTS/hr-payroll-client/orchestration/REVIEW_STATUS.md` | งานไหน approve แล้ว |
| 3 | `PROJECTS/hr-payroll-client/orchestration/CURRENT_TASK.md` | งานปัจจุบัน |
| 4 | `PROJECTS/hr-payroll-client/orchestration/DECISION_LOG.md` | ถ้า context ขาด |

### P2 — ai-assistant-support

| ลำดับ | ไฟล์ | เหตุผล |
|-------|------|--------|
| 1 | `PROJECTS/ai-assistant-support/GROUND_TRUTH.md` | Scope + phase |
| 2 | `PROJECTS/ai-assistant-support/orchestration/REVIEW_STATUS.md` | Approval status |
| 3 | `PROJECTS/ai-assistant-support/orchestration/CURRENT_TASK.md` | งานปัจจุบัน |
| 4 | `OS/HERMES-OS/workflows/WORKFLOW_SUPPORT_LINE.md` | ถ้าเป็นงาน Phase 2 |

### P3 — law-ai-content-os

| ลำดับ | ไฟล์ | เหตุผล |
|-------|------|--------|
| 1 | `PROJECTS/law-ai-content-os/GROUND_TRUTH.md` | Scope + phase |
| 2 | `PROJECTS/law-ai-content-os/CHECKPOINT.md` | Deploy state |
| 3 | `PROJECTS/law-ai-content-os/BACKLOG.md` | Feature AC |
| 4 | `PROJECTS/law-ai-content-os/docs/context/` | Latest compact (ถ้ามี) |

### P4 — fastwork/inventory-management-system

| ลำดับ | ไฟล์ | เหตุผล |
|-------|------|--------|
| 1 | `PROJECTS/fastwork/inventory-management-system/PROJECT_STATE.md` | Scope + phase |
| 2 | `PROJECTS/fastwork/inventory-management-system/NEXT_CODEX_TASK.md` | งานถัดไป |

### P5 — head-office-app

| ลำดับ | ไฟล์ | เหตุผล |
|-------|------|--------|
| 1 | `orchestration/GROUND_TRUTH.md` | Scope + phase |
| 2 | `orchestration/CURRENT_TASK.md` | งานปัจจุบัน |

### P6 — Agents Os

| ลำดับ | ไฟล์ | เหตุผล |
|-------|------|--------|
| 1 | `PROJECTS/Agents Os/GROUND_TRUTH.md` | Scope + milestone |
| 2 | `PROJECTS/Agents Os/docs/context/MILESTONE_6_COMPACT.md` | Latest context |
| 3 | `PROJECTS/Agents Os/docs/design/2026-06-18-m5-task-board-review-loop-plan.md` | ถ้าทำ M5 |

---

## 3. Session Type — อ่านเพิ่มตาม mode

| Session Type | ไฟล์เพิ่มเติม |
|-------------|--------------|
| **PLAN** (วางแผน) | `docs/PRD.md` หรือ `BACKLOG.md` ของ project นั้น |
| **EXECUTE** (ลงมือทำ) | `CURRENT_TASK.md` + compact ล่าสุด |
| **FIX** (แก้ bug) | `REVIEW_STATUS.md` + `DECISION_LOG.md` (ถ้ามี) |
| **AUDIT** (ตรวจสอบ) | `GROUND_TRUTH.md` + `CHECKPOINT.md` + `reports/` |

---

## 4. Skill / Runtime Activation Rules

| งาน | Runtime | Model | เมื่อไหร่ |
|-----|---------|-------|-----------|
| PLAN + milestone breakdown | Codex CLI | `gpt-5.4-mini` | ก่อนเขียนโค้ดทุกครั้ง |
| Next.js / API / webhook / pipeline | Codex CLI | `gpt-5.3-codex-spark` | Build tasks (JS/TS) |
| UI components / browser test | Antigravity | `Gemini 3.5 Flash` | Frontend / visual |
| Swift / SwiftUI / SwiftData | Codex CLI | `gpt-5.3-codex-spark` | Agents Os only |
| Bug analysis + fix (complex) | Codex CLI | `gpt-5.5` | Debug tasks |
| Large codebase scan / research | Gemini CLI | `gemini-3.1-pro-preview` | Audit / Researcher role |
| Auth / security audit | Gemini CLI | `gemini-3.1-pro-preview` | Researcher เท่านั้น |

> ⚠️ Claude Code: PAUSED (ต้องการ Anthropic API Key)

---

## 5. Compact Trigger Rules

### เมื่อไหรต้อง compact

| Trigger | Action |
|---------|--------|
| Context window > 70% | สร้าง compact ทันที ก่อนเริ่ม task ใหม่ |
| จบ Milestone / Phase | สร้าง compact สรุป milestone |
| จบ Sprint / Batch งาน | สร้าง compact สรุป batch |
| ก่อนเริ่ม Phase ถัดไป | สร้าง compact สรุป phase ที่ผ่านมา |

### Format การตั้งชื่อ

```
YYYYMMDD-[topic]-compact.md

ตัวอย่าง:
20260618-phase1-complete-compact.md
20260618-m5-task-board-compact.md
20260618-auth-fix-f01-compact.md
```

### เก็บที่ไหน

| Project | Compact location |
|---------|-----------------|
| hr-payroll-client | `PROJECTS/hr-payroll-client/docs/context/` |
| ai-assistant-support | `PROJECTS/ai-assistant-support/docs/context/` |
| law-ai-content-os | `PROJECTS/law-ai-content-os/docs/context/` |
| inventory-management | `PROJECTS/fastwork/inventory-management-system/docs/context/` |
| head-office-app | `orchestration/context/` |
| Agents Os | `PROJECTS/Agents Os/docs/context/` |

### Content ขั้นต่ำของ compact

```markdown
# [Date] [Topic] Compact

## Current State
- phase / milestone ปัจจุบัน
- สิ่งที่ build เสร็จแล้ว

## Key Decisions
- การตัดสินใจสำคัญที่ทำไป

## Next Task
- งานถัดไปที่ต้องทำ

## Files Changed
- รายการไฟล์ที่เปลี่ยนแปลง
```

---

## 6. ไฟล์ที่ต้องอัพเดทหลังทุก session

| ไฟล์ | อัพเดทเมื่อ |
|------|------------|
| `CURRENT_TASK.md` | ทุก session ที่ทำงาน |
| `REVIEW_STATUS.md` | เมื่อ approve หรือ reject งาน |
| `HERMES_TASK_ORDER.md` | เมื่อ priority เปลี่ยน หรือเพิ่ม project |
| `GROUND_TRUTH.md` | เมื่อ phase status เปลี่ยน |
| compact file | ตาม trigger ใน section 5 |

---

*Last updated: 2026-06-18 — Initial creation, 7-project coverage*
