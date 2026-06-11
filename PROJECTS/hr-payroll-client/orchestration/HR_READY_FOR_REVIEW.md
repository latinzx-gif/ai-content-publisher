# HR Admin — Ready for Batch Review

**วันที่:** 2026-06-11  
**สถานะ:** Feature-complete ฝั่ง HR — รอ user + Cursor review ร่วมกัน

---

## สรุปสิ่งที่ปิดในรอบนี้

| Task | โมดูล | สถานะโค้ด | ทดสอบ |
|------|--------|-----------|-------|
| **T15** | `/admin/attendance` — filter, สรุปชม., CSV | ✅ built | manual |
| **T17** | Leave request — balance check + Flex + API | ✅ **ปิด gap วันนี้** | `test-leave-request.mjs` 10/10 |
| **T18** | Leave approval web (`LeaveDecisionActions`) | ✅ built | manual |
| **T19** | Balance update + LINE notify on decide | ✅ built | manual |
| **T20** | Leaves — calendar, report, balances | ✅ built | manual |
| **T22** | Visa alert cron + edge fn | ✅ built | manual |
| **T23** | Alerts dashboard (probation/visa/permit) | ✅ built | manual |
| **T24+T25** | Evening summary + HR group push | ✅ built | manual |

**UI polish (นอก Taskmaster):** Dashboard one-screen layout, sidebar branding ตาม mockup 12441

---

## Quality gates (ผ่านแล้ว)

```bash
cd hr-app
node scripts/test-leave-request.mjs   # 10/10
node scripts/test-employee-profile.mjs # 7/7
npm run build && npm run typecheck && npm run lint  # pass (1 RHF warning)
```

---

## Demo path สำหรับ review

1. **Login** — `/login` (LINE OAuth ผ่าน ngrok `NEXT_PUBLIC_BASE_URL`)
2. **Dashboard** — `/admin` (KPI 6 + widgets 8 ช่อง, no page scroll)
3. **Employees** — `/admin/employees` → profile `[id]`
4. **Attendance** — `/admin/attendance` + Export CSV
5. **Leaves** — `/admin/leaves` → อนุมัติ/ปฏิเสธ + calendar/report/balances tabs
6. **Alerts** — `/admin/alerts` (probation / visa / work permit)
7. **LIFF Leave** — `/liff/leave` (submit → balance check → LINE confirm)

---

## สิ่งที่ยังไม่ทำ (รอหลัง review)

| Task | รายละเอียด |
|------|------------|
| T26–T30 | Security, E2E, deploy, demo, audit |
| Phase 2 | เอกสาร, ร้องเรียน, ประกาศ HR |
| T31 | Settings admin UI |

---

## จุดที่ควรโฟกัสตอน review

- [ ] Dashboard layout บนจอ 1366×768 / 1920×1080
- [ ] Sidebar logo + promo card ขนาด
- [ ] Leave flow end-to-end: LIFF submit → HR approve → balance หัก → LINE แจ้งพนักงาน
- [ ] Attendance filter + CSV ข้อมูลถูกต้อง
- [ ] Alerts tab แสดงครบ 3 ประเภท

---

*พิมพ์ `review` เมื่อพร้อมให้ Cursor ตรวจ acceptance + approve batch*
