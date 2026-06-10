---
name: workflow-supabase-migration
description: >-
  Safe Supabase schema migration protocol: plan → test locally → apply remote →
  verify RLS. Auto-trigger when task touches database schema, tables, or policies.
---

# Skill: Supabase Migration (Safe)

## Auto-Trigger
โหลด skill นี้อัตโนมัติถ้า task แตะ: `schema` / `migration` / `table` / `RLS` / `policy` / `supabase`

---

## Step 1 — Plan ก่อน migrate เสมอ

เขียนตอบให้ได้ก่อน:
- เพิ่ม / แก้ / ลบ อะไร
- มี data เดิมที่จะกระทบไหม (breaking change?)
- RLS policy ต้องอัปเดตด้วยไหม
- Rollback ทำยังไงถ้า fail

**ถ้าเป็น breaking change บน table ที่มี data → แจ้ง user ก่อนเสมอ**

---

## Step 2 — เขียน migration file

```bash
# สร้าง migration ใหม่
supabase migration new <ชื่อ_migration>
# เช่น: supabase migration new add_post_tags_table
```

เขียน SQL ใน migration file:
```sql
-- ✅ ปลอดภัย: ADD COLUMN with DEFAULT
ALTER TABLE acp_posts ADD COLUMN tags text[] DEFAULT '{}';

-- ✅ ปลอดภัย: CREATE TABLE
CREATE TABLE acp_tags (...);

-- ⚠️ ระวัง: DROP COLUMN (irreversible)
-- ต้องมี user approve ก่อน

-- ⚠️ ระวัง: ALTER TYPE (อาจ lock table)
-- ทำใน maintenance window
```

---

## Step 3 — Test locally ก่อน

```bash
# Start local Supabase
supabase start

# Apply migration locally
supabase db reset   # reset + apply ทุก migrations
# หรือ
supabase migration up

# ตรวจ schema
supabase db diff
```

ตรวจ:
- [ ] Migration รันได้ไม่ error
- [ ] Table structure ถูกต้อง
- [ ] ไม่มี orphaned data

---

## Step 4 — Apply remote (production)

```bash
# Apply ไป remote
supabase db push

# หรือผ่าน dashboard
# Supabase Dashboard → SQL Editor → run migration
```

```
# MCP (ถ้าใช้ Supabase MCP)
# mcp_supabase_apply_migration
```

---

## Step 5 — Verify RLS

หลัง migrate ทุกครั้ง → ตรวจ RLS ใหม่:

```sql
-- ตรวจ RLS enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- ตรวจ policies
SELECT tablename, policyname, cmd, qual 
FROM pg_policies WHERE schemaname = 'public';
```

ถ้าสร้าง table ใหม่ → ต้อง enable RLS + เพิ่ม policy ก่อนใช้งาน:

```sql
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own data" ON new_table
  FOR ALL USING (auth.uid() = user_id);
```

---

## Output: เพิ่มใน TASK_RESULT.md

```markdown
## Migration Applied
- File: supabase/migrations/[timestamp]_[name].sql
- Tables affected: [list]
- RLS: enabled + policies created

## Rollback Plan
[SQL หรือ steps ถ้าต้อง rollback]
```
