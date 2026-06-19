# WORKFLOW_SUPPORT_LINE.md — LINE OA Support System

> **Updated: 2026-06-18**
> **Project:** AI Assistant Support (`[AAS]`)
> **Cron interval:** 10 min (default) — ปรับใน env `HERMES_SUPPORT_CRON_INTERVAL`
> **Input method:** Rich Menu → LIFF Form (structured)

---

## Architecture Overview

```
Customer
  │
  │ Rich Menu tap
  ▼
LIFF Form (/liff/ticket)
  │  fields: client_slug, issue_type, severity_hint, description, screenshot?
  │
  ▼ POST /api/support/intake
Webhook Handler (Next.js)
  │
  ├─ detectUrgency(formData)
  │     severity_hint == "urgent" OR issue_type IN ["system_down","no_access"]
  │     OR keyword scan on description (fallback)
  │
  ├─ [P0 detected] ─────────────────────────────────────────────┐
  │   ├─ createLinearIssue({ label: "severity:P0", status: "Triage" })  │
  │   ├─ insertSupabase(aas_tickets, { severity: "P0", status: "escalated" })
  │   ├─ sendTelegram(JAKARIN_CHAT_ID, P0AlertMessage)           │
  │   └─ replyLINE(userId, "รับเรื่องด่วน กำลังดำเนินการ #[id]")│
  │                                                               │
  └─ [Normal] ─────────────────────────────────────────────┐     │
      ├─ createLinearIssue({ status: "Triage", label: "severity:P1–P3" })
      ├─ insertSupabase(aas_tickets, { severity: "P1-P3", status: "triage" })
      └─ replyLINE(userId, "รับเรื่องแล้ว #[id] ทีมกำลังดำเนินการ")
                                                             │     │
Hermes Cron (ทุก 10 นาที) ◄──────────────────────────────┘     │
  │                                                               │
  ├─ listLinearIssues({ project: "AAS", status: "Triage" })       │
  ├─ for each issue:                                              │
  │   ├─ AI triage (Researcher: gemini-3.5-flash)                 │
  │   │   classify: type, priority, assign agent                  │
  │   ├─ updateLinear(issue, { status: "Todo", assignee, priority })
  │   └─ dispatch → Fix Team (if P1) or queue (if P2/P3)          │
  │                                                               │
Jakarin รับ Telegram P0 alert ◄──────────────────────────────────┘
  │
  ├─ Reply "TAKE"     → Jakarin แก้เอง
  │                    → Hermes updates Linear: "Owner: Jakarin, In Progress"
  │
  └─ Reply "DISPATCH" → Hermes ส่ง Fix Team ทันที
                         Debugger (gpt-5.5) → Patcher (codex-spark)
                         → Verifier (Antigravity) → Done
                         → notify LINE ลูกค้า
```

---

## LIFF Form Fields

| Field | Type | ใช้สำหรับ |
|-------|------|-----------|
| `client_slug` | select | ระบุลูกค้า → Linear label `client:*` |
| `issue_type` | select | ประเภทปัญหา → ดูตาราง P0 detection |
| `severity_hint` | radio | ลูกค้าระบุเอง: ปกติ / ด่วน |
| `description` | textarea | รายละเอียด |
| `screenshot` | file (optional) | แนบภาพ |

---

## P0 Detection Logic

```typescript
// support-app/src/lib/detectUrgency.ts

const P0_TYPES = ["system_down", "no_access", "data_loss"]

const P0_KEYWORDS = [
  // Thai
  "ล่ม", "พัง", "เข้าไม่ได้", "ใช้ไม่ได้เลย", "ด่วน", "หยุดทำงาน",
  "ข้อมูลหาย", "ไม่ขึ้นเลย",
  // English
  "down", "broken", "urgent", "critical", "not working", "lost data",
  "p0", "emergency", "production"
]

export function detectUrgency(formData: SupportFormData): boolean {
  if (formData.severity_hint === "urgent") return true
  if (P0_TYPES.includes(formData.issue_type)) return true
  const text = formData.description.toLowerCase()
  return P0_KEYWORDS.some(k => text.includes(k))  // ponytail: stdlib only
}
```

---

## Telegram P0 Alert Format

```
🚨 P0 URGENT — [client_name]
━━━━━━━━━━━━━━━━━━━━
📋 [issue_type]: [description สั้นๆ]
⏰ [timestamp]
🔗 Linear: https://linear.app/...

ตอบกลับ:
TAKE — ฉันแก้เอง
DISPATCH — ส่ง Fix Team
```

---

## Hermes Cron — Triage Prompt (ส่งให้ Researcher)

```
SUPPORT TRIAGE

Issue: [AAS][{client}] — {title}
Description: {description}
Type: {issue_type}
Screenshot: {url or none}

Tasks:
1. Classify severity: P0 / P1 / P2 / P3
2. Classify type: bug / config / user_error / feature_request
3. Suggest assignee: Builder B (code fix) / Builder A (UI fix) / Researcher (investigate) / Jakarin (escalate)
4. Write 1-line diagnosis hypothesis

Output JSON only:
{ "severity": "P1", "type": "bug", "assignee": "Builder B", "hypothesis": "..." }
```

---

## Linear Issue Title Pattern

```
[AAS][{client_slug}] {P0–P3} · {issue_type} · {subject สั้นๆ}

ตัวอย่าง:
[AAS][cnv] P0 · system_down · เข้าระบบไม่ได้
[AAS][hrp] P2 · bug · ยอดเงินเดือนแสดงผิด
```

---

## Hermes Telegram Approval Handler

```typescript
// รับ reply จาก Jakarin
if (reply === "TAKE") {
  await updateLinear(issueId, {
    status: "In Progress",
    comment: "[escalated] Jakarin รับงานเอง"
  })
  await sendTelegram("✅ รับแล้ว — Linear อัพเดทแล้ว")
}

if (reply === "DISPATCH") {
  await updateLinear(issueId, { status: "In Progress" })
  await dispatchFixTeam(issue)  // Debugger → Patcher → Verifier
  await sendTelegram("✅ ส่ง Fix Team แล้ว — จะแจ้งเมื่อปิดงาน")
}
```

---

## Fix Team Dispatch (เมื่อ DISPATCH หรือ cron ส่งงาน P1)

```
Hermes → Debugger (gpt-5.5)
  ├─ อ่าน issue details + screenshot
  └─ เขียน BUG_ANALYSIS.md → STOP ✋

Hermes → approve → Patcher (gpt-5.3-codex-spark)
  ├─ แก้ตาม BUG_ANALYSIS.md
  └─ TASK_RESULT.md → STOP ✋

Hermes → Verifier (Antigravity/Gemini 3.5 Flash)
  ├─ browser test ตาม acceptance
  └─ VERIFY_RESULT.md → STOP ✋

Hermes → updateLinear(status: "Done")
       → replyLINE(customer, resolution message)
       → notify Jakarin (Telegram): "✅ [AAS-XXX] ปิดแล้ว"
```

---

## Close-Loop: แจ้งลูกค้าเมื่อปิด

Linear webhook → `/api/linear/webhook` (มีอยู่แล้ว Phase 1)

```
เมื่อ status → Done AND มี [resolution] comment:
ส่ง LINE Flex ให้ลูกค้า:
  "✅ ทีมงานได้แก้ไขปัญหาเรียบร้อยแล้ว
   📋 [resolution summary]
   ⏰ ปิดงาน: [timestamp]"
```

---

## Environment Variables ที่ต้องเพิ่ม

```env
HERMES_SUPPORT_CRON_INTERVAL=10          # นาที
TELEGRAM_JAKARIN_CHAT_ID=                # chat_id ของ Jakarin
TELEGRAM_BOT_TOKEN=                      # bot token
LINEAR_AAS_PROJECT_ID=                   # project ID สำหรับ AAS
```

---

## Files ที่ต้องสร้าง/แก้ (Phase 2)

| File | Action | หมายเหตุ |
|------|--------|----------|
| `support-app/src/lib/detectUrgency.ts` | CREATE | P0 detection |
| `support-app/src/app/api/support/intake/route.ts` | CREATE | แยก endpoint จาก LINE webhook |
| `support-app/src/lib/telegram.ts` | CREATE | send alert + parse reply |
| `support-app/src/app/api/telegram/webhook/route.ts` | CREATE | รับ TAKE/DISPATCH reply |
| `support-app/src/lib/hermesTriagePrompt.ts` | CREATE | prompt template |
| `support-app/vercel.json` (cron section) | UPDATE | เพิ่ม cron job `/api/hermes/cron` |
| `support-app/src/app/api/hermes/cron/route.ts` | CREATE | Hermes cron handler |

> ⚠️ **Phase 2 — LOCKED** ห้ามเริ่มจนกว่า Jakarin approve

---

*Last updated: 2026-06-18 — Hermes 2.0 Support Architecture*
