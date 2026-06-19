# Milestone 5 — Task Board and Review Loop Hardening Plan

Goal: ทำให้ Task Board จาก manual/mock board แบบปุ่มกระจัดกระจาย กลายเป็น delivery pipeline ที่ชัดขึ้น มี review/audit approval gate ที่ trace ได้ และ Run Log / Human Request เชื่อมกันเป็นหลักฐานชุดเดียวสำหรับ V1

Status: Plan prepared before UI implementation

## Scope
- ปรับ task pipeline หลักให้สื่อเป็น 5 ช่วงงานชัดเจน: `open → in_progress → review → audit → done`
- เก็บสถานะพิเศษ เช่น approval pending, blocked, need_fix, cancelled เป็น gate/badge ไม่ใช่ทำให้บอร์ดแตกเป็นหลายคอลัมน์ย่อยจนอ่านยาก
- เพิ่ม review gate และ audit gate ที่ผูกกับ Human Request Inbox แบบ traceable
- เพิ่ม metadata ใน Run Log เพื่อเก็บผลลัพธ์ที่เปิดต่อได้ เช่น result path, related request, error summary
- เพิ่ม action grouping ใน Task Card เพื่อให้ผู้ใช้เห็น “next step” ชัดกว่าปุ่มเรียงยาวทั้งหมด
- คงแนวคิด local-first / manual-first / no autonomous execution เหมือนเดิม
- ไม่แตะ real runtime launch ใน milestone นี้

## Current pain points from code inspection
1. `Task Board` ตอนนี้แสดงคอลัมน์ตาม `taskStatusOptions` ทั้งหมด ทำให้มี 11 คอลัมน์ (`todo`, `assigned`, `awaiting_approval`, `launch_blocked`, `running`, `review`, `audit`, `need_fix`, `blocked`, `cancelled`, `done`) และผู้ใช้ต้องตีความเองว่าอะไรคือ stage หลัก
2. `TaskCardView` มีปุ่มจำนวนมากอยู่ใน card เดียว ทำให้ลำดับงานไม่เด่น
3. `transitionTask(...)` เขียน run log ได้ แต่ยังไม่มี field สำหรับ result path / error / related request / gate note
4. `HumanRequestInboxView` กับ `RunLogView` ยังเป็น “ข้างเคียง” มากกว่า “ส่วนหนึ่งของ pipeline”
5. approval/review/audit ยัง trace กลับหา decision evidence ได้ไม่แน่นพอ

## Files expected to change
1. `Sources/HeadOfficeAgentStudio/Models.swift`
   - `StudioTask` around lines 97–115
   - `TaskRunLog` around lines 117–130
   - `HumanRequestItem` around lines 132–148
   - คาดว่าจะเพิ่ม fields กลุ่มนี้:
     - task primary stage / gate state summary (ถ้าจำเป็น)
     - run log result path
     - run log error summary
     - run log related request id or request title
     - request type / linked stage / resolution note helpers

2. `Sources/HeadOfficeAgentStudio/Services.swift`
   - status constants around lines 21–33
   - `createRuntimePlanningRequest(...)` around 1154–1198
   - `queueRuntimeApproval(...)` / `markRuntimeLaunchBlocked(...)` around 1200–1224
   - `seedInitialTaskBoard(...)` around 1428–1445
   - `transitionTask(...)` around 1447–1496
   - `createHumanRequest(...)` / request update methods around 1498–1545
   - `createRunLog(...)` around 1590–1603
   - คาดว่าจะเพิ่ม methods แยก เช่น:
     - `advanceTaskToNextStage(...)`
     - `sendTaskToReview(...)`
     - `approveReview(...)`
     - `requestAudit(...)`
     - `failAudit(...)`
     - `resolveRequestAndSyncTask(...)`
     - `appendRunLog(...)` with richer metadata

3. `Sources/HeadOfficeAgentStudio/Views.swift`
   - `TaskBoardView` around 1571–1727
   - `TaskStatusColumn` around 1729–1754
   - `TaskCardView` around 1756–1865
   - `RunLogView` around 1867–1921
   - `HumanRequestInboxView` around 1923–2010
   - `HumanRequestRow` around 2012–2105
   - คาดว่าจะเพิ่ม/ปรับ:
     - stage summary cards
     - 5 primary pipeline columns
     - gate rail / approval rail
     - richer run log rows
     - request row actions ที่ sync กลับ task stage

4. `docs/design/2026-06-18-m5-task-board-review-loop-before-after.html`
   - visual before/after mockup สำหรับอนุมัติก่อนลงมือ

5. `docs/qa/2026-06-18-milestone-5-task-board-review-loop-qa.md`
   - จะเขียนหลัง implementation + verification

## UX proposal

### A. Task Board structure
Before:
- ซ้าย = create form
- ขวา = board ที่แตกตามทุก status
- ผู้ใช้ต้องไล่ดูหลายคอลัมน์เพื่อเข้าใจ flow

After:
- แถวบน = summary cards (`Open`, `In Progress`, `Review Gate`, `Audit Gate`, `Done`, `Blocked`)
- ส่วนกลาง = board 5 คอลัมน์หลัก
  - `Open`
  - `In Progress`
  - `Review`
  - `Audit`
  - `Done`
- สถานะพิเศษไม่สร้างคอลัมน์ใหม่ แต่แสดงเป็น badge ใน card เช่น:
  - `Approval Pending`
  - `Need Fix`
  - `Blocked`
  - `Cancelled`
- ด้านขวาหรือด้านบนเพิ่ม `Gate / Request Rail` สรุป requests เปิดอยู่ของ project ที่เลือก

### B. Task Card actions
Before:
- มีปุ่มหลายชุดใน card เดียว
- “ทำอะไรต่อ” ยังไม่ชัด

After:
- ใช้ action group ตาม stage ปัจจุบัน
- แสดง primary action เด่น 1 ปุ่ม และ secondary actions รองลงมา
- ตัวอย่าง:
  - Open → `Start Work`
  - In Progress → `Send to Review`
  - Review → `Approve Review` / `Request Fix`
  - Audit → `Pass Audit` / `Fail Audit`
- ถ้ามี gate/request เปิดอยู่ ให้โชว์ banner ด้านบน card พร้อม shortcut ไป inbox

### C. Review / Audit gating
- การส่งเข้า review สร้าง run log + optional request evidence
- การอนุมัติ review สร้าง log ว่าใคร/เมื่อไรผ่าน gate นี้
- การส่งเข้า audit ทำเหมือนกัน
- ถ้า review fail หรือ audit fail ให้ task กลับ `in_progress` พร้อม badge `Need Fix` และมี evidence ใน log
- ถ้าต้องขอ human decision ให้สร้าง linked request ที่เปิดจาก card หรือ inbox ได้

### D. Run Log improvement
Before:
- แสดง summary + monospaced text อย่างเดียว

After:
- แต่ละ row มี:
  - status/stage badge
  - short summary
  - started / ended timestamp
  - result artifact path (ถ้ามี)
  - related request indicator (ถ้ามี)
  - error summary (ถ้ามี)
  - expandable evidence text
- เพิ่มปุ่ม `Open Artifact` เมื่อ path มีจริง

### E. Human Request Inbox improvement
Before:
- แก้ status/request response ได้ แต่ยังไม่ชัดว่า request นี้คุม gate ไหนของ task

After:
- row แสดง `request type` เช่น Approval / Scope / Review / Audit / Blocker
- แสดง linked task + intended next step
- ปุ่มตอบสนองทำให้ task sync กลับ stage ที่ถูกต้อง เช่น:
  - approve review gate → task ไป `audit`
  - approve audit gate → task ไป `done`
  - request fix → task กลับ `in_progress`
  - block / clarification → task คงสถานะ blocked หรือ review pending

## Data/model proposal
- ใช้ `status` ของ task เป็น primary delivery stage ที่ลดจำนวนลง
- เพิ่ม auxiliary metadata สำหรับ gate/blocker แทนการแตก statuses ออกหมด
- เพิ่ม metadata ใน run log เพื่อให้เปิด evidence ได้จริง
- เพิ่ม metadata ใน request เพื่อระบุประเภทและ target stage

แนวทางนี้ช่วยให้ UI อ่านง่ายขึ้นโดยไม่หลอกว่า runtime จริงทำงานแล้ว

## Implementation steps
1. ปรับ model fields ที่จำเป็นใน `Models.swift`
2. ปรับ status strategy และ helper methods ใน `Services.swift`
3. แยก stage transitions ให้ตรงกับ review/audit gate
4. เพิ่ม linked request + linked run log metadata
5. redesign `TaskBoardView` ให้เหลือ 5 primary columns + summary/gate rail
6. ลดจำนวน action ใน `TaskCardView` และจัดเป็น primary/secondary actions
7. ปรับ `RunLogView` ให้แสดง artifact/error/request context
8. ปรับ `HumanRequestInboxView` และ `HumanRequestRow` ให้ sync task stage ได้
9. run `swift build`
10. launch app และตรวจ visual QA ของ Task Board / Run Log / Inbox
11. เขียน QA evidence

## Verification plan
- Build: `swift build`
- Open packaged app
- Engineering checks:
  - create task ได้
  - task ผ่าน `open → in_progress → review → audit → done` ได้
  - review fail / audit fail กลับเข้าแก้ได้
  - request resolution sync task stage ถูก
  - run logs เก็บ result/error/request metadata ได้
- Visual checks:
  - board เหลือ 5 คอลัมน์หลัก อ่าน flow ง่ายขึ้น
  - task card มี next action ชัด
  - run log เห็น evidence fields ใหม่
  - request inbox เห็น request type + linked task/gate

## Risks / notes
- ถ้าพยายามเก็บ backward compatibility กับ status เดิมทุกตัว อาจทำให้ logic ซับซ้อนเกิน milestone นี้
- ต้องระวังไม่ทำให้ manual/mock V1 ดูเหมือนมี agent runtime จริงทำงานอัตโนมัติ
- request resolution ต้อง update ทั้ง request และ task อย่าง atomic ที่สุดเท่าที่ทำได้ใน store ปัจจุบัน
- ถ้าพบว่าต้องเพิ่มหลาย field มากเกินไป อาจเลือกเก็บบางส่วนเป็น derived UI state แทน เพื่อคุม scope

## Approval gate
ตาม workflow ปัจจุบัน งาน UI change นี้ควรเริ่ม implement หลังผู้ใช้อนุมัติ plan + mockup HTML ก่อน
