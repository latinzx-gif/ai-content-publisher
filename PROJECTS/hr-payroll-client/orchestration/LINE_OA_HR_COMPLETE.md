# LINE OA HR — Phase 1 Feature Complete

**วันที่:** 2026-06-10  
**สถานะ:** Feature scope ครบ — พร้อมเริ่มโปรเจกต์ Dashboard ถัดไป

---

## สรุปสิ่งที่ทำครบ (T01–T25)

### LINE ฝั่งพนักงาน
| Feature | Task | สถานะ |
|---------|------|--------|
| Rich Menu 6 ปุ่ม | T06 | ✅ |
| เช็คอิน Geo + QR | T07, T11 | ✅ |
| เช็คเอาท์ + สรุปชม. | T08 | ✅ |
| Flex templates | T09 | ✅ |
| Push เตือนเช้า | T10 | ✅ |
| ฟอร์มลา LIFF + submit | T16, T17 | ✅ |
| สรุปเย็น (LINE push) | T24 | ✅ |
| เอกสาร/ร้องเรียน/ประกาศ | P2 | 🔒 stub guide |

### Web Admin HR
| Feature | Task | สถานะ |
|---------|------|--------|
| Shell + auth | T05 | ✅ |
| Dashboard KPI | T12 | ✅ |
| รายชื่อพนักงาน | T13 | ✅ |
| Profile | T14 | ✅ |
| Attendance history | T15 | ✅ |
| Leave approval | T18, T19 | ✅ |
| ปฏิทิน/รายงาน/ยอดลา | T20 | ✅ |
| Alert dashboard | T23 | ✅ |

### Cron / Backend
| Feature | Task | สถานะ |
|---------|------|--------|
| Probation alert | T21 | ✅ |
| Visa/work permit alert | T22 | ✅ |
| HR group สรุปรายวัน | T25 | ✅ (รวมใน evening-summary) |

---

## ยังไม่ทำ (Delivery — ไม่ block เริ่ม Dashboard อื่น)

| Task | รายละเอียด |
|------|------------|
| T26 | Security review |
| T27 | E2E tests |
| T28 | Production deploy |
| T29 | Demo prep |
| T30 | Delivery audit |
| P2 | เอกสาร, ร้องเรียน, ประกาศ HR |
| Settings | ตั้งค่าระบบ (T31) |

---

## ก่อน production (checklist สั้น)

1. `supabase db reset` หรือ apply migrations ใหม่ทั้งหมด
2. Deploy Edge Functions: `morning-push`, `probation-alert`, `visa-alert`, `evening-summary`
3. ตั้ง env: `HR_LINE_GROUP_ID`, LINE tokens, `NEXT_PUBLIC_BASE_URL`
4. อัปเดต LINE Webhook URL เป็น production

---

## เริ่ม Dashboard ถัดไปได้

LINE OA HR Phase 1 **feature-complete** แล้ว — งานที่เหลือเป็น delivery/QA และ Phase 2 (locked)

*Orchestrator note: โปรเจกต์ head-office dashboard แยกจาก hr-payroll-client*
