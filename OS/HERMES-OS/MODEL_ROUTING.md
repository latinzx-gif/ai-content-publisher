# MODEL_ROUTING.md — Hermes Routing Logic

> Hermes ใช้ไฟล์นี้ตัดสินใจทุกครั้งก่อน dispatch agent
> อ่านก่อน dispatch เสมอ — ห้าม hardcode model ใน task

**Last Updated:** 2026-06-18

---

## Decision Tree

```
Task เข้ามา
│
├─ ประเภท: BUILD (สร้างของใหม่)
│   ├─ Step 1: Planner (gpt-5.4-mini) → คิด approach ก่อนเสมอ
│   └─ Step 2: เลือก Builder
│       ├─ ต้องการ UI / frontend / browser test → Builder A (Antigravity)
│       └─ isolated / API / script / backend only → Builder B (codex-spark)
│
├─ ประเภท: FIX (แก้บัก / refactor)
│   ├─ Step 1: Debugger (gpt-5.5) → หา root cause
│   ├─ Step 2: Patcher (codex-spark) → apply fix
│   └─ Step 3: Verifier (Antigravity) → ยืนยัน
│
└─ ประเภท: SUPPORT (research / docs / QA)
    ├─ context > 50K tokens / DataClaw / analysis หนัก → Researcher (gemini-3.1-pro)
    ├─ triage / brief / routine / สรุปสั้น            → Analyst (gemini-3.5-flash)
    └─ ก่อน deliver / audit / security                → Auditor (gpt-5.5)
```

---

## Quick Reference Table

| Trigger keyword | Agent | Runtime | Model |
|----------------|-------|---------|-------|
| `new feature`, `create`, `build`, `add module` | Planner → Builder | Codex / Antigravity | gpt-5.4-mini → codex-spark / Gemini 3.5 |
| `UI`, `frontend`, `component`, `page`, `browser` | Builder A | Antigravity | Gemini 3.5 Flash |
| `API`, `script`, `function`, `backend`, `migration` | Builder B | Codex CLI | gpt-5.3-codex-spark |
| `bug`, `error`, `fix`, `broken`, `not working` | Debugger | Codex CLI | gpt-5.5 |
| `patch`, `apply fix`, `change line` | Patcher | Codex CLI | gpt-5.3-codex-spark |
| `verify`, `test`, `confirm fix`, `browser check` | Verifier | Antigravity | Gemini 3.5 Flash |
| `research`, `market`, `DataClaw`, `analyze doc` | Researcher | Gemini CLI | gemini-3.1-pro-preview |
| `brief`, `summary`, `triage`, `morning`, `what's next` | Analyst | Gemini CLI | gemini-3.5-flash |
| `audit`, `pre-delivery`, `quality gate`, `security` | Auditor | Codex CLI | gpt-5.5 |

---

## Context ที่ต้องส่งให้ทุก Agent

```
# ส่งเสมอ (mandatory)
- COMPANY_OS.md reference
- GROUND_TRUTH.md ของ project นั้น
- CURRENT_TASK.md (task ปัจจุบัน)

# ส่งตาม agent
- Builder: allowed files list + DO NOT BUILD list
- Debugger: error log + stack trace + relevant files
- Researcher: research brief + source list + DataClaw context
- Auditor: DELIVERY_READINESS_AUDIT checklist
```

---

## STOP Conditions (Hermes หยุดรอ user approve)

| เงื่อนไข | action |
|---------|--------|
| Agent ส่ง `TASK_RESULT.md` กลับมา | Hermes review → approve/reject ก่อน next step |
| Quality gate fail (`build` / `lint` / `typecheck`) | หยุด — ไม่ proceed ต่อ |
| งาน Red Zone (payment / DB / security / delivery) | หยุด — รอ user approve เป็นลายลักษณ์อักษร |
| Agent ขอ start task ถัดไปเอง | ปฏิเสธ — Hermes เท่านั้นที่ start task ถัดไป |

---

## Model Fallback (ถ้า runtime unavailable)

| Primary | Fallback |
|---------|---------|
| Antigravity | Codex CLI / gpt-5.5 |
| gemini-3.1-pro-preview | gemini-3-pro-preview |
| gpt-5.3-codex-spark | gpt-5.4 |
| gpt-5.4-mini | gpt-5.4 |
