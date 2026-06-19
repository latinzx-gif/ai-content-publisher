# AGENT_TEAM.md — Hermes Agent Team

> ไฟล์นี้คือ source of truth สำหรับทีม agent ทั้งหมดที่ Hermes orchestrate
> อัปเดตทุกครั้งที่เพิ่ม/ลด runtime หรือเปลี่ยน model

**Last Updated:** 2026-06-18
**Hermes Version:** 2.0 (Codex CLI + Gemini CLI + Antigravity)

---

## Runtime ที่ใช้งานได้ตอนนี้

| Runtime | Status | Auth |
|---------|--------|------|
| **Codex CLI** (OpenAI) | ✅ Active | API Key |
| **Gemini CLI** (Google) | ✅ Active | OAuth — latinzx@gmail.com |
| **Antigravity** (Google) | ✅ Active | Built-in |
| ~~Claude Code~~ (Anthropic) | ⏸ Paused | HTTP 400 — ต้อง API Key |

---

## Team Structure

```
HERMES (Orchestrator / PM)
├── BUILD TEAM
│   ├── Planner      → Codex CLI / gpt-5.4-mini
│   ├── Builder A    → Antigravity / Gemini 3.5 Flash
│   └── Builder B    → Codex CLI / gpt-5.3-codex-spark
├── FIX TEAM
│   ├── Debugger     → Codex CLI / gpt-5.5
│   ├── Patcher      → Codex CLI / gpt-5.3-codex-spark
│   └── Verifier     → Antigravity / Gemini 3.5 Flash
└── SUPPORT TEAM
    ├── Researcher   → Gemini CLI / gemini-3.1-pro-preview
    ├── Analyst      → Gemini CLI / gemini-3.5-flash
    └── Auditor      → Codex CLI / gpt-5.5
```

---

## BUILD TEAM — สร้างของใหม่

| Agent | Runtime | Model | หน้าที่ | ห้าม |
|-------|---------|-------|--------|------|
| **Planner** | Codex CLI | `gpt-5.4-mini` | PLAN phase — คิด approach ก่อน execute ทุกครั้ง | Implement โดยตรง |
| **Builder A** | Antigravity | `Gemini 3.5 Flash` | Full-stack feature, UI component, E2E ใน browser จริง | Self-approve |
| **Builder B** | Codex CLI | `gpt-5.3-codex-spark` | New file, API, script — isolated ไม่แตะ logic เดิม | แตะ logic เดิม, Self-approve |

**Routing:**
- งานต้องการ UI + browser test → Builder A (Antigravity)
- งาน isolated / script / API / no UI → Builder B (codex-spark)
- ทุก task → Planner คิด approach ก่อนเสมอ

---

## FIX TEAM — แก้บัก / refactor

| Agent | Runtime | Model | หน้าที่ | ห้าม |
|-------|---------|-------|--------|------|
| **Debugger** | Codex CLI | `gpt-5.5` | หา root cause, วิเคราะห์ multi-file bug | Apply fix เอง |
| **Patcher** | Codex CLI | `gpt-5.3-codex-spark` | Apply fix ตามที่ Debugger ชี้เป้า | วิเคราะห์ root cause เอง |
| **Verifier** | Antigravity | `Gemini 3.5 Flash` | รัน browser test ยืนยันหลังแก้ | Self-approve |

**Routing:** Debugger หาสาเหตุ → Patcher แก้ → Verifier ยืนยัน (ห้ามข้ามขั้น)

---

## SUPPORT TEAM — research / docs / QA

| Agent | Runtime | Model | หน้าที่ | ห้าม |
|-------|---------|-------|--------|------|
| **Researcher** | Gemini CLI | `gemini-3.1-pro-preview` | DataClaw, long doc, market analysis, context ยาว | Implement code |
| **Analyst** | Gemini CLI | `gemini-3.5-flash` | Morning Brief, triage, สรุปสั้น, routing ประจำวัน | งาน complex reasoning |
| **Auditor** | Codex CLI | `gpt-5.5` | Pre-delivery audit, quality gate check, security review | Implement |

**Routing:**
- Context ยาว / analysis หนัก / DataClaw → Researcher
- Triage / brief / routine ประจำวัน → Analyst (ประหยัด cost)
- ก่อน deliver ทุกครั้ง → Auditor

---

## Model Cost Priority

```
ใช้บ่อย (cheap)     → gpt-5.4-mini, gemini-3.5-flash, gpt-5.3-codex-spark
ใช้ปกติ (medium)   → Antigravity (Gemini 3.5 Flash), gemini-3.1-pro-preview
ใช้น้อย (expensive) → gpt-5.5  ← เฉพาะ debug + audit เท่านั้น
```

---

## Agent ที่จะเพิ่มในอนาคต

| Agent | Runtime | เงื่อนไข |
|-------|---------|---------|
| **Integrator** | Claude Code | เมื่อ Anthropic API Key พร้อม — งาน refactor / multi-file integration |

---

## Hermes Commands (ตัวอย่าง)

```bash
# Dispatch Planner
hermes run --provider openai -m gpt-5.4-mini -f CURRENT_TASK.md

# Dispatch Builder B
hermes run --provider openai -m gpt-5.3-codex-spark -f CURRENT_TASK.md

# Dispatch Debugger
hermes run --provider openai -m gpt-5.5 -f BUG_REPORT.md

# Dispatch Researcher
hermes run --provider google-gemini-cli -m gemini-3.1-pro-preview -f RESEARCH_BRIEF.md

# Dispatch Analyst (Morning Brief)
hermes run --provider google-gemini-cli -m gemini-3.5-flash -f MORNING_BRIEF_PROMPT.md
```
