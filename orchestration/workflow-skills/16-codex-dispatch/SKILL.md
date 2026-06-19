---
name: workflow-codex-dispatch
description: >-
  Protocol for dispatching tasks to Codex CLI. Codex does NOT read the codebase
  automatically — all context must be provided explicitly. Use when routing a
  task to Codex (new files, isolated features, boilerplate generation).
---

# Skill: Codex Dispatch

## When to Use

Cursor เลือก route task นี้ไปที่ Codex เมื่อ:
- สร้างไฟล์ใหม่ทั้งหมด (ไม่แตะ logic เดิม)
- Feature ใหม่ที่ isolated — ไม่ต้องอ่าน component เดิม
- CRUD boilerplate / schema / migration file ใหม่
- UI component ใหม่จาก spec ที่ชัดเจน

**ห้ามส่ง Codex เมื่อ:**
- แก้ bug ใน logic เดิม → ใช้ Claude Code แทน
- integrate กับ module ที่มีอยู่ → ใช้ Claude Code แทน
- ไม่แน่ใจ → ใช้ Claude Code (safe default)

---

## Template Context ที่ต้องส่งทุกครั้ง

Codex ไม่อ่าน context เองตาม protocol — ต้องใส่ทุกอย่างใน prompt:

```
## Tech Stack
- Framework: Next.js 15 App Router
- Language: TypeScript strict
- Database: Supabase (PostgreSQL) — prefix: acp_
- Auth: Supabase magic link + password
- Styling: Tailwind CSS
- State: Zustand
- API: Next.js Route Handlers (/api/*)

## Project Structure
- App: src/app/
- Features: src/features/[name]/
- Components: src/components/
- Lib: src/lib/
- API routes: src/app/api/

## Forbidden (ห้ามทำในทุกกรณี)
- ห้ามเพิ่ม dependency ใหม่โดยไม่บอก
- ห้ามแตะ auth / security / payment
- ห้ามลบ / แก้ file ที่ไม่อยู่ใน Allowed Files
- ห้าม self-approve หรือ start task ถัดไปเอง
- ห้าม hard delete ข้อมูล DB

## Allowed Files (แตะได้เฉพาะนี้)
[ระบุ list ชัดเจน]

## Task
[เนื้อหา CURRENT_TASK.md ทั้งหมด]

## Acceptance Criteria
[criteria จาก CURRENT_TASK.md]

## Output Required
เขียน TASK_RESULT.md + CURSOR_REVIEW_REQUEST.md แล้ว STOP
ห้าม commit หรือ push เอง
```

---

## Step 1 — เตรียม context ก่อนส่ง

```bash
# ดู tech stack จริง
cat package.json | grep '"dependencies"' -A 30

# ดู folder structure
find src -type d | head -30

# ดูตาราง DB ที่มี (ถ้า task เกี่ยว DB)
ls supabase/migrations/ | tail -5
```

---

## Step 2 — ระบุ Allowed Files ให้ชัด

```markdown
## Allowed Files
สร้างใหม่:
- src/features/[module]/components/[ComponentName].tsx
- src/features/[module]/hooks/use[Name].ts
- src/app/api/[route]/route.ts

ห้ามแตะ:
- src/features/prd/ (ยกเว้นถ้า task เกี่ยว)
- src/lib/agents/ 
- supabase/migrations/ (ยกเว้นถ้า task = migration ใหม่)
- src/app/page.tsx
```

---

## Step 3 — ตรวจ output ก่อน approve

หลัง Codex ส่ง TASK_RESULT.md กลับมา:

```bash
# ตรวจว่าแตะแค่ allowed files
git diff --name-only

# ตรวจ type error
npm run typecheck

# ตรวจ lint
npm run lint

# ตรวจ build
npm run build
```

ถ้า Codex แตะไฟล์นอก Allowed → REJECT ทันที แจ้งให้ revert

---

## ⚠️ กฎเหล็ก Codex

```
1. Codex ไม่รู้ context นอกจากที่ส่งให้ → ส่งให้ครบทุกครั้ง
2. Codex ห้าม self-approve → Cursor ต้อง review เสมอ
3. Codex ห้าม commit/push → Cursor ทำเอง หลัง review ผ่าน
4. ถ้า Codex integrate กับ logic เดิม → หยุด ส่ง Claude Code แทน
```

---

## Codex Dispatch Template (copy ไปใช้)

```
You are Codex CLI working on a Next.js 15 SaaS project.

## Your Role
Implementer — สร้างไฟล์ใหม่ตาม spec ที่ให้เท่านั้น
ห้าม self-approve ห้าม start task ถัดไปเอง ห้าม commit

## Tech Stack
[แทนที่ด้วย stack จริง]

## Forbidden
[แทนที่ด้วย forbidden list]

## Allowed Files
[แทนที่ด้วย list จริง]

## Task
[แทนที่ด้วย CURRENT_TASK.md content]

## Done When
[แทนที่ด้วย acceptance criteria]

## Output
เขียน _agent/TASK_RESULT.md + _agent/CURSOR_REVIEW_REQUEST.md แล้ว STOP
```
