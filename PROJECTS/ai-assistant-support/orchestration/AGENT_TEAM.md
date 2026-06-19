# AGENT_TEAM.md — AI Assistant Support

> **Last updated:** 2026-06-16
> **Orchestrator:** Hermes Agent

---

## 🏢 โครงสร้างทีม

```
┌──────────────────────────────────────────────────────────┐
│              🧠 HERMES Agent (Orchestrator)              │
│       สั่งงาน → ตรวจสอบ → จัดคิว → รายงานผล             │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  Claude Code │  │  Codex CLI   │  │  agy           │  │
│  │  Integration │  │  Scaffold    │  │  UI / Design   │  │
│  │  + API Logic │  │  + DB        │  │  + Flex Msg    │  │
│  └──────────────┘  └──────────────┘  └────────────────┘  │
│                                                           │
│  ┌──────────────────────────────────────────────────┐    │
│  │         Gemini CLI (สำรอง / backup)               │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## 🎯 BUILD Phase — Agent Roles

| Agent | OAuth Status | บทบาทหลัก | ใช้เมื่อ |
|-------|-------------|-----------|--------|
| **Hermes** | ✅ Codex runtime (ChatGPT subscription) | Orchestrator — หลัก | ทุกงาน ใช้ Codex subscription |
| **Claude Code** | ✅ logged in | Integration, LINE, Linear, webhook | งานเชื่อมต่อระบบ, logic ที่มีอยู่ |
| **Codex CLI** | ✅ logged in | Scaffold ไฟล์ใหม่, DB schema, migration | งานใหม่ isolated, boilerplate |
| **agy** | ✅ ใช้ได้ | UI, CSS, Flex message styling | แก้ดีไซน์, ปรับ Flex |
| **Gemini CLI** | ✅ logged in | DB query, backend logic, backup agent | สำรอง, งาน DB/API |

---

## 🕐 OPERATIONS Phase — Scheduled Tasks

| Cron | Agent | Frequency | หน้าที่ |
|------|-------|-----------|--------|
| 📥 **Queue Monitor** | Codex CLI | ทุก 1 ชม. | เช็ค Linear `[AAS]` ใหม่ → รายงาน |
| 🔄 **Notify Retry** | Claude Code | ทุก 30 นาที | ตรวจ ticket ที่ LINE push ล้มเหลว → retry |
| 📊 **Daily Summary** | Claude Code | ทุก 8:00 น. | สรุป ticket วันก่อน: เปิดใหม่ / resolved แยก client |

---

## 🧠 Agent Assignment Matrix

| งาน | Agent หลัก | Agent สำรอง |
|-----|-----------|------------|
| LINE webhook / LIFF / Flex | **Claude Code** | Hermes |
| Linear API / Webhook | **Claude Code** | Hermes |
| Supabase / DB | **Gemini CLI** | Codex CLI |
| UI / Flex styling | **agy** | Claude Code |
| Scaffold ไฟล์ใหม่ | **Codex CLI** | Gemini CLI |
| Verify / E2E Test | **Hermes** | Codex CLI (review) |
| Monitor / Cron | **Hermes** (จัด) | Codex CLI (รัน) |

---

### คำสั่งเรียกใช้แต่ละ Agent

```bash
# Claude Code (non-interactive)
claude -p "<context + task>"

# Codex CLI (non-interactive)  — ต้อง login ก่อน
codex exec -s workspace-write "<context + task>"

# agy (non-interactive)
agy --prompt "<task>" --dangerously-skip-permissions

# Gemini CLI (non-interactive)
gemini --prompt "<task>" --skip-trust
```