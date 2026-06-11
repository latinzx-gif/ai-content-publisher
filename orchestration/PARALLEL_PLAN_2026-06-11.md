# PARALLEL PLAN 2026-06-11 — 3 หน้าต่าง Claude Code พร้อมกัน

> สร้างโดย Claude Code ตามคำสั่ง user (บอส) — แบ่งงานค้างหลัง P1-FIX-01 / P1-LINT-01 / P1-DEMO-FINAL
> เป็น 3 ส่วนที่ scope ไฟล์ไม่ชนกัน เปิด 3 หน้าต่างใน `/Users/jakarinosk/HEAD-OFFICE/head-office-app`

## ข้อเท็จจริงตั้งต้น (เช็คแล้ว 2026-06-11)

- Supabase `luxegqsccaodcikxhwrm` กลับมาออนไลน์แล้ว (เคย 503/paused)
- Storage bucket `acp-images` มีบน live แล้ว → migration `20260611100000` apply แล้ว
- Migration `20260611090000_acp_posts_status_rejected.sql` **ยังไม่ยืนยัน** ว่า apply (เช็ค read-only ไม่ได้)
- MCP + Supabase CLI ในเครื่องนี้ **ไม่มีสิทธิ์** เข้า project นี้ (login คนละ account)
- `.env.local`: `AI_CONTENT_DISABLE_API_AUTH=false` ทั้งคู่แล้ว (real Supabase mode)
- P1-04 refactor เสร็จ (page.tsx = 13 บรรทัด), P1-LINT-01 เสร็จ (commit `afe6af3`)
- Working tree ค้าง: 49 modified / 32 untracked / 16 deleted (งาน P1-DEMO-FINAL)
- เอกสาร GROUND_TRUTH.md / CLAUDE.md / CURRENT_TASK.md ยัง stale (อ้าง P1-04e/P1-04t active)

## กติกากลาง (ทุกหน้าต่าง)

1. **หน้าต่าง 2 เท่านั้น**ที่แตะ git ได้ — หน้าต่าง 1 และ 3 ห้าม commit / checkout / stash / reset เด็ดขาด
2. หน้าต่าง 2 ต้อง `git add <ไฟล์ระบุชื่อ>` เท่านั้น — **ห้าม `git add -A` / `git add .`**
3. ห้ามทุกหน้าต่างแก้ `.env.local`
4. Report เขียนลง `reports/` ด้วยชื่อไฟล์ไม่ซ้ำกัน (กำหนดไว้ในแต่ละ prompt แล้ว)
5. ห้ามแตะของต้องห้ามใน `orchestration/GROUND_TRUTH.md` ข้อ 5 (Phase 2/3 LOCKED)

## สรุป 3 ส่วน

| หน้าต่าง | งาน | Scope ไฟล์ | Git |
|---------|-----|-----------|-----|
| 1 | Live DB migration + E2E verification | `supabase/`, `reports/LIVE_DB_E2E_VERIFICATION_2026-06-11.md`, รัน e2e | ❌ |
| 2 | Docs sync + git housekeeping | `*.md` (orchestration + app docs), git commits | ✅ (เฉพาะหน้าต่างนี้) |
| 3 | Security/RLS audit ก่อน demo | read-only + `reports/SECURITY_RLS_AUDIT_2026-06-11.md` | ❌ |

Prompt เต็มของแต่ละหน้าต่างอยู่ด้านล่าง — copy ทั้ง block ไปวางได้เลย

---

## PROMPT หน้าต่าง 1 — Live DB + E2E Verification

```
ทำงานใน /Users/jakarinosk/HEAD-OFFICE/head-office-app — งานนี้คือส่วนที่ 1 จาก 3 หน้าต่างที่รันพร้อมกัน
อ่านแผนรวมที่ ../orchestration/PARALLEL_PLAN_2026-06-11.md ก่อน

## เป้าหมาย
ปิด blocker จาก P1-FIX-01: ยืนยัน/apply migration ที่ค้างบน Supabase live แล้วรัน E2E ที่เคยถูกบล็อกเพราะ DB ล่ม

## ข้อเท็จจริง
- Supabase project: luxegqsccaodcikxhwrm (กลับมาออนไลน์แล้ว เคย 503)
- bucket acp-images มีบน live แล้ว → migration 20260611100000_acp_images_storage_bucket.sql apply แล้ว
- migration supabase/migrations/20260611090000_acp_posts_status_rejected.sql ยังไม่ยืนยันว่า apply
  (เพิ่ม 'rejected' + 'publishing' เข้า CHECK constraint ของ acp_posts — ถ้ายังไม่ apply ปุ่ม Reject พังบน live)
- MCP และ Supabase CLI ในเครื่องนี้ไม่มีสิทธิ์เข้า project นี้ (login คนละ account — เห็นแค่ Inventory System Project)
- permission classifier บล็อกการเขียน production DB ด้วย service role key — อย่าพยายาม insert/delete probe เอง

## ขั้นตอน
1. ถามให้ผมเลือกวิธี apply migration:
   a. ผมรัน SQL เองใน Supabase dashboard SQL editor (ไฟล์ idempotent — รันซ้ำได้ปลอดภัย) แล้วบอกเมื่อเสร็จ
   b. ผมพิมพ์ `! supabase login` เพื่อ login account เจ้าของ project แล้วคุณ link + `supabase db push` ให้
2. หลังผมยืนยันว่า migration apply แล้ว รัน E2E (auth bypass ต้องปิด — เช็คว่า .env.local มี
   AI_CONTENT_DISABLE_API_AUTH=false และ NEXT_PUBLIC_AI_CONTENT_DISABLE_API_AUTH=false อยู่แล้ว ห้ามแก้ไฟล์นี้):
   npm run test:e2e:auth && npm run test:e2e:all
   ถ้า auth state (playwright/.auth/publisher.json) หมดอายุ/ไม่มี ให้แนะนำวิธี regenerate แล้วรอผม
3. Verify บน live: ปุ่ม Reject เขียน status 'rejected' ได้ และ image generation เก็บรูปลง bucket acp-images
   (URL ชี้ supabase.co/storage ไม่ใช่ URL ชั่วคราวของ DALL-E)
4. เขียนผลทั้งหมดลง reports/LIVE_DB_E2E_VERIFICATION_2026-06-11.md

## ข้อห้าม
- ห้าม commit/checkout/stash git ใดๆ (หน้าต่างอื่นดูแล git อยู่)
- ห้ามแก้ src/ และ .env.local — งานนี้ verify อย่างเดียว ถ้าเจอบั๊กให้บันทึกใน report ไม่ต้องแก้
- ห้ามเขียน production DB นอกเหนือจากที่เกิดจาก E2E suite ปกติ
```

---

## PROMPT หน้าต่าง 2 — Docs Sync + Git Housekeeping

```
ทำงานใน /Users/jakarinosk/HEAD-OFFICE/head-office-app — งานนี้คือส่วนที่ 2 จาก 3 หน้าต่างที่รันพร้อมกัน
อ่านแผนรวมที่ ../orchestration/PARALLEL_PLAN_2026-06-11.md ก่อน
หน้าต่างนี้เป็นหน้าต่างเดียวที่ได้รับอนุญาตให้ใช้ git commit

## เป้าหมาย
1. Sync เอกสาร orchestration ให้ตรงความจริงของ code
2. Review + commit งานค้างใน working tree เป็น logical chunks

## ข้อเท็จจริงที่เอกสารยังไม่ update (เช็คจาก code แล้ว 2026-06-11)
- P1-04 refactor เสร็จสมบูรณ์: src/app/page.tsx เหลือ 13 บรรทัด (thin shell), components ทั้งหมดอยู่ใน
  src/features/prd/components/ รวมถึง EndToEndWorkflowSimulation.tsx และ TopBar.tsx
  แต่ ../orchestration/GROUND_TRUTH.md ข้อ 4 ยังบอก active task = P1-04t และ CLAUDE.md ยังบอก P1-04e
- P1-FIX-01 (workflow integrity, commit 764d659) และ P1-LINT-01 (commit afe6af3) เสร็จแล้ว
- P1-DEMO-FINAL อยู่ในสถานะ DEMO READY ตาม ../orchestration/CURRENT_TASK.md
- รายละเอียด P1-FIX-01: _agent/archive/P1-FIX-01/TASK_RESULT.md

## ขั้นตอน
1. อัปเดต ../orchestration/GROUND_TRUTH.md: ข้อ 3 Phase Status (Phase 1 refactor → CLOSED),
   ข้อ 4 Active Task (P1-04t เสร็จแล้ว — เปลี่ยนเป็นสถานะปัจจุบัน/งานถัดไปใน queue), วันที่ header
2. อัปเดต CLAUDE.md ส่วน "Current State" ให้ตรงกัน (P1-04 เสร็จ, demo ready, วันที่)
3. Review working tree (ประมาณ 49 modified / 32 untracked / 16 deleted — งาน P1-DEMO-FINAL ของ Cursor):
   ดู git diff เป็นกลุ่มๆ สรุปว่าแต่ละกลุ่มคืออะไร แล้ว commit แยกเป็น logical chunks เช่น
   docs cleanup / e2e + playwright / publisher auth + login / agent daemon / config
4. ก่อน commit แต่ละก้อน ให้แสดงรายชื่อไฟล์ + ข้อความ commit ให้ผมเห็น (ไม่ต้องรอ approve ทีละก้อน
   แต่ถ้าก้อนไหนน่าสงสัยว่าเป็นงานครึ่งๆ กลางๆ ให้ถามก่อน)
5. เสร็จแล้วสรุป: commit อะไรไปบ้าง เหลืออะไรไม่ commit เพราะอะไร

## ข้อห้าม (สำคัญมาก — มีอีก 2 หน้าต่างทำงานใน checkout เดียวกัน)
- ห้าม git add -A / git add . เด็ดขาด — add เฉพาะไฟล์ระบุชื่อเท่านั้น
- ห้าม commit ไฟล์ใน reports/ ที่ชื่อมี 2026-06-11 (หน้าต่างอื่นกำลังเขียนอยู่):
  LIVE_DB_E2E_VERIFICATION_2026-06-11.md, SECURITY_RLS_AUDIT_2026-06-11.md
- ห้าม git checkout / stash / reset / push (push ต่อเมื่อผมสั่ง)
- ห้ามแก้ src/ — งานนี้ docs + git เท่านั้น
- ห้ามแก้ .env.local
```

---

## PROMPT หน้าต่าง 3 — Security/RLS Audit ก่อน Demo

```
ทำงานใน /Users/jakarinosk/HEAD-OFFICE/head-office-app — งานนี้คือส่วนที่ 3 จาก 3 หน้าต่างที่รันพร้อมกัน
อ่านแผนรวมที่ ../orchestration/PARALLEL_PLAN_2026-06-11.md ก่อน
งานนี้ READ-ONLY ทั้งหมด — output มีไฟล์เดียวคือ report

## เป้าหมาย
Security audit ก่อน demo กับลูกค้าด้วยข้อมูลจริง — ตอนนี้ auth bypass ปิดแล้ว
(AI_CONTENT_DISABLE_API_AUTH=false) แปลว่า app คุยกับ Supabase production จริง

## ขั้นตอน
1. ใช้ skill supabase-rls-security-auditor เป็นแกนหลัก ตรวจ:
   - RLS policies ของตาราง acp_posts, acp_post_content, acp_post_images, acp_audit_logs
     บน project luxegqsccaodcikxhwrm (ตรวจจาก migration files ใน supabase/migrations/ — 
     MCP เข้า project นี้ไม่ได้ และห้ามเขียน production DB)
   - Storage bucket acp-images: policy public read / service-role write ตาม
     migration 20260611100000_acp_images_storage_bucket.sql เหมาะสมไหม
   - SUPABASE_SERVICE_ROLE_KEY ใช้เฉพาะ server-side จริงไหม — grep หาว่ามีหลุดไป client
     component / NEXT_PUBLIC_* / log ไหม
   - API routes ใน src/app/api/** : route ไหนไม่มี auth check, route ไหนเชื่อ input จาก client
   - secrets อื่นใน .env.local (อ่านชื่อ key ได้ ห้าม print ค่า): มีตัวไหนรั่วผ่าน NEXT_PUBLIC_ หรือ
     ถูก hardcode ใน src/ ไหม
   - shared-database risk: ตาราง/bucket อื่นของ head-office-app ที่ acp_ code มองเห็นโดยไม่ตั้งใจ
2. จัดความรุนแรงเป็น Critical / Major / Minor ตามเกณฑ์ใน AGENTS.md ข้อ 11
3. เขียน report ไฟล์เดียว: reports/SECURITY_RLS_AUDIT_2026-06-11.md
   โครง: scope ที่ตรวจ / findings เรียงตาม severity พร้อมไฟล์:บรรทัด / คำแนะนำแก้ / ข้อจำกัดการตรวจ

## ข้อห้าม
- ห้ามแก้ไฟล์ใดๆ ยกเว้น report ไฟล์เดียวข้างบน
- ห้าม commit/checkout git ใดๆ (หน้าต่างอื่นดูแล git อยู่)
- ห้าม print ค่า secret / key ใดๆ ลง output หรือ report — อ้างชื่อ env var ได้เท่านั้น
- ห้ามเขียนหรือแก้ production DB — ตรวจจาก code + migration files + read-only API เท่านั้น
- ถ้าเจอช่องโหว่ ห้ามแก้เอง — บันทึกใน report พร้อมข้อเสนอแนะ
```

---

## ลำดับการรัน

- เปิดได้พร้อมกันทั้ง 3 หน้าต่างเลย ไม่มี dependency ระหว่างกัน
- หน้าต่าง 1 จะหยุดรอ user ตอนเลือกวิธี apply migration (dashboard หรือ supabase login)
- หลังทั้ง 3 จบ: กลับมาหน้าต่าง 2 เพื่อ commit report 2 ไฟล์จากหน้าต่าง 1 และ 3 + docs ที่อัปเดต
