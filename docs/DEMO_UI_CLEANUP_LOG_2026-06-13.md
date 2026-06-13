# Demo UI Clean-up Activity Log

## 2026-06-13

- ทำ UI clean-up รอบแรกและรอบต่อเนื่องสำหรับ `/publisher/index` (ai-law-content demo) ให้ลดจุด UX ที่หลอกผู้ใช้
- ติดตามการแก้ไขจริงที่เกิดขึ้น:
  - ปรับให้หน้า Approvals ส่งคอมเมนต์ที่กดแล้วเก็บจริง (ไม่หาย)
  - ปรับให้ปุ่ม Comment ในแผงข้างขวา (DemoRightPanel) บันทึกคอมเมนต์จริง
  - แก้ Sidebar หลักให้ชี้ไปเส้นทางเดโมหลักเฉพาะ (`/publisher/index/*`) ลดความสับสนจาก legacy
  - แก้ลิงก์ settings ให้กลับเส้นทางหลักถูกต้อง (`/publisher/index/settings`)
  - ลบคอมเมนต์โค้ดสถานะเก่าใน Demo sidebar
  - ทำปุ่มเดโมที่ยังไม่ทำงานให้มีผล/ข้อความตอบกลับที่ชัดเจนแทนการกดแล้วเงียบ (Filter / Media / Share / Star / Request approvals / Sliders / Note / Show next month)

### แก้ไขไฟล์
- [src/app/publisher/ai-law-content/approvals/page.tsx](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/app/publisher/ai-law-content/approvals/page.tsx)
- [src/components/publisher/ai-law-content/DemoRightPanel.tsx](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/components/publisher/ai-law-content/DemoRightPanel.tsx)
- [src/components/publisher/Sidebar.tsx](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/components/publisher/Sidebar.tsx)
- [src/app/publisher/settings/page.tsx](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/app/publisher/settings/page.tsx)
- [src/components/publisher/ai-law-content/DemoSidebar.tsx](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/components/publisher/ai-law-content/DemoSidebar.tsx)
- [src/components/publisher/ai-law-content/DemoCalendarView.tsx](/Users/jakarinosk/HEAD-OFFICE/head-office-app/src/components/publisher/ai-law-content/DemoCalendarView.tsx)

### สถานะหลังรอบนี้
- เริ่มลดความไม่แน่นอนของ UX ได้แล้ว
- ยังควรทำรอบถัดไป: ตัดปุ่มที่ยังเป็น “placeholder feedback” ออก/แปลงเป็น component จริง และ unify ความสัมพันธ์กับ mock/stub ของหน้าใหม่ทั้งหมด
- 2026-06-13 (ต่อ): แก้ build blocker โดยเพิ่ม `src/lib/agents/runtime/prompts.ts` ที่ให้ `CONTENT_AGENT_PROMPT(...)` กลับสู่เส้นทาง import เดิมสำหรับหน้า demo create/quick form เพื่อให้ TypeScript resolution ผ่าน และลดปัญหา deploy.
