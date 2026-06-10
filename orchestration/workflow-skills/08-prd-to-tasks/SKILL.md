---
name: workflow-prd-to-tasks
description: >-
  Convert a PRD or feature brief into a structured Taskmaster backlog with
  correct dependencies, phase locks, and priorities. Use at project start
  or when adding a new feature set.
---

# Skill: PRD → Taskmaster Tasks

## When to Use
- เริ่ม project ใหม่ มี PRD หรือ brief
- เพิ่ม feature set ใหม่เข้า backlog
- User พิมพ์ "parse PRD" / "แตก task จาก brief"

---

## Step 1 — อ่านและวิเคราะห์ PRD

สิ่งที่ต้องหาจาก PRD:
- Core flow: ขั้นตอนหลักกี่ขั้น
- Dependencies: งานไหนต้องทำก่อน
- Phase boundary: อะไรคือ Phase 1 / Phase 2+
- Blockers: งานไหนรอ external (API key, auth, user action)

---

## Step 2 — แตก tasks ให้ได้ขนาดที่ถูกต้อง

กฎ task sizing:
```
✅ 1 task = Claude/Codex ทำเสร็จใน 1 session (< 4 ชั่วโมง)
✅ output ชัด — 1 file หรือ 1 feature เล็กๆ
❌ ถ้า task มี > 5 files → แตกเป็น subtasks
❌ ถ้า task พูดถึง 2 concerns — แยกเป็น 2 tasks
```

---

## Step 3 — Parse ผ่าน Taskmaster

```bash
# CLI
task-master parse-prd --input=docs/PRD.md

# ถ้าไม่มีไฟล์ PRD — เขียน brief เป็น markdown แล้ว parse
task-master parse-prd --input=docs/brief.md

# MCP
# mcp_taskmaster-ai_parse_prd
```

---

## Step 4 — ตรวจ + lock Phase 2+

```bash
task-master list   # ดู tasks ทั้งหมด
```

tasks ที่เป็น Phase 2+ → set blocked:
```bash
task-master set-status --id=<id> --status=blocked
```

ตรวจ dependencies ถูกต้องไหม:
```bash
task-master show <id>   # ดู dependencies ของแต่ละ task
```

---

## Step 5 — เพิ่ม tasks ที่ parser มักพลาด

parser มักไม่สร้าง tasks เหล่านี้ — ต้องเพิ่มเอง:
```bash
task-master add-task --title="Project Init + GROUND_TRUTH" --priority=high
task-master add-task --title="Security Review pre-launch" --priority=high
task-master add-task --title="Delivery Audit + Demo Prep" --priority=medium
```

---

## Output ที่ต้องมีก่อนจบ

- [ ] tasks.json มี tasks ครบตาม PRD
- [ ] Phase 2+ tasks status = blocked
- [ ] Dependencies ถูกต้อง
- [ ] มี task สำหรับ Security Review + Delivery Audit
- [ ] บอก user: "Backlog พร้อม — [N] tasks, [M] Phase 1, [K] blocked"
