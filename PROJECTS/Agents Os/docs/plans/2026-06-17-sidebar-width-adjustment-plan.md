# Sidebar Width Adjustment Plan

Goal
- ปรับ Sidebar ของ macOS SwiftUI app ให้กว้างพอดีกับข้อความเมนู โดยไม่แตะ logic อื่นของหน้าจอ

Why this change
- ปัจจุบัน Sidebar ใช้ความกว้าง default ของ `NavigationSplitView` ทำให้เมนูที่ยาว เช่น `Human Request Inbox` และ `Demo / Handoff Center` มีโอกาสถูกบีบ/ตัด
- จากการวัดข้อความแบบประมาณการจาก label จริงใน `SidebarDestination` รายการที่ยาวที่สุดคือ `Demo / Handoff Center`
- ความกว้างที่แนะนำรวม icon + padding อยู่ที่ประมาณ 209 px จึงเสนอ width เป้าหมายที่ปลอดภัยกว่าเล็กน้อยเป็น 230 px

Current code target
- File: `/Users/jakarinosk/Desktop/Agents Os/Sources/HeadOfficeAgentStudio/Views.swift`
- Current relevant block: lines 40-45

Planned change
1. แก้เฉพาะ Sidebar ใน `StudioShellView`
2. เติม `navigationSplitViewColumnWidth(min:ideal:max:)` ที่ฝั่ง `List(...)`
3. ใช้ค่าเสนอ:
   - min: 220
   - ideal: 230
   - max: 250
4. ไม่เปลี่ยน enum menu, icon, detail pane, หรือ navigation behavior

Exact file/line impact
- Modify: `/Users/jakarinosk/Desktop/Agents Os/Sources/HeadOfficeAgentStudio/Views.swift:40-45`
- Likely patch shape:
  - existing:
    - `List(SidebarDestination.allCases, selection: $selection) { ... }`
    - `.navigationTitle("Head Office Agent Studio")`
  - proposed addition:
    - `.navigationSplitViewColumnWidth(min: 220, ideal: 230, max: 250)`

Expected result
- Sidebar กว้างพอสำหรับทุก label ปัจจุบัน
- ลดการ truncation ของเมนูยาว
- ยังไม่กินพื้นที่ detail pane มากเกินไป

Verification after approval
1. `swift build`
2. Launch app: `./.build/debug/HeadOfficeAgentStudio`
3. Visual QA เช็กว่า menu ยาวสุดแสดงครบ
4. Capture screenshot before/after ไว้ใน `docs/qa/`

Risks / tradeoffs
- ถ้าตั้ง width ใหญ่เกินไป detail pane จะแคบลงโดยไม่จำเป็น
- ถ้าในอนาคตมีชื่อเมนูยาวกว่านี้ อาจต้องขยับ ideal width อีกเล็กน้อย

Approval needed
- งานนี้เป็น UI layout change จึงรออนุมัติจากคุณก่อนลงมือแก้ `Views.swift`
