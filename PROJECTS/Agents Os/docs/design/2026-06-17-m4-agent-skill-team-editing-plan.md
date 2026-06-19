# Milestone 4 — Agent / Skill / Team Editing UX Plan

Goal: ปิดช่องว่างของหน้า Agent Library, Skill Library และ Team Builder ที่ตอนนี้ยัง create-only เป็นหลัก โดยเพิ่ม edit flow, project assignment ที่ชัดขึ้น และ feedback หลังบันทึกให้ใช้งานได้จริงใน V1 shell

Status: Plan prepared before UI implementation

## Scope
- เพิ่มการแก้ไข AgentDefinition, SkillDefinition, TeamDefinition จาก UI
- เพิ่มปุ่ม Edit ชัดเจนใน list ของทั้ง 3 หน้า
- เพิ่ม form state สำหรับแก้ไข record เดิม แยกจาก create state
- ทำให้ Team Builder เปลี่ยน project assignment ของ team เดิมได้
- คง delete flow เดิมไว้
- ไม่แตะ runtime execution จริง
- ไม่เปลี่ยน schema หลักของ records

## Files expected to change
1. `Sources/HeadOfficeAgentStudio/Services.swift`
   - around `func createAgent` / `deleteAgents` (ประมาณบรรทัด 1226–1248)
   - around `func createSkill` / `deleteSkills` (ประมาณบรรทัด 1250–1269)
   - around `func createTeam` / `deleteTeams` (ประมาณบรรทัด 1271–1292)
   - เพิ่ม methods:
     - `updateAgent(...)`
     - `updateSkill(...)`
     - `updateTeam(...)`
2. `Sources/HeadOfficeAgentStudio/Views.swift`
   - `AgentLibraryView` (ประมาณบรรทัด 758–861)
   - `SkillLibraryView` (ประมาณบรรทัด 863–961)
   - `TeamBuilderView` (ประมาณบรรทัด 963–1072)
   - เพิ่ม edit sheets / selected item state / action buttons
3. `docs/design/2026-06-17-m4-agent-skill-team-before-after.html`
   - visual before/after mockup สำหรับขออนุมัติก่อนลงมือ
4. `docs/qa/2026-06-17-milestone-4-agent-skill-team-editing-qa.md`
   - จะเขียนหลัง implementation + verification

## UX proposal

### A. Agent Library
Before:
- ซ้าย = create form
- ขวา = list อย่างเดียว
- ลบได้ แต่แก้ไม่ได้

After:
- ซ้าย = create form คงเดิม
- ขวา = list + action row ต่อ item
- เพิ่มปุ่ม `Edit` และ `Delete`
- กด `Edit` แล้วเปิด sheet เพื่อแก้:
  - name
  - role
  - goal
  - runtime
  - model
  - skill names
  - output contract
- บันทึกแล้ว list refresh ทันที

### B. Skill Library
Before:
- create form + list เท่านั้น
- ไม่มีรายละเอียด checklist/output contract ตอนแก้

After:
- เพิ่ม `Edit` ต่อ item
- ใช้ sheet แก้ field เดิมทั้งหมด
- เก็บ type เดิมได้และแก้ได้
- แสดงสถานะบันทึกสำเร็จ/ผิดพลาดใต้หัว section

### C. Team Builder
Before:
- สร้างทีมใหม่ได้
- team เดิมยังแก้ lead, members, workflow, project assignment ไม่ได้

After:
- เพิ่ม `Edit` ต่อ item
- sheet แก้ได้ทั้ง:
  - team name
  - purpose
  - lead agent
  - member agent names
  - workflow
  - review rules
  - runtime preference
  - project assignment (`template` หรือ project slug จริง)
- ถ้าเลือก project จริง ให้ label ใน list แสดงชื่อ slug/project ชัดขึ้น

## Implementation steps
1. เพิ่ม update methods ใน `StudioStore`
2. เพิ่ม local state สำหรับ selected editing item ใน 3 views
3. เพิ่มปุ่ม Edit ใน list item แต่ละ record
4. เพิ่ม sheet component สำหรับ Agent / Skill / Team
5. bind picker defaults จาก store ตอนเปิด sheet
6. save success → reload list + status message
7. run `swift build`
8. launch app และตรวจ visual smoke
9. บันทึก QA evidence

## Verification plan
- Build: `swift build`
- Open app bundle
- Visual checks:
  - Agent Library มี Edit button และ save ได้
  - Skill Library มี Edit button และ save ได้
  - Team Builder เปลี่ยน project assignment ได้
- Smoke data checks:
  - update แล้วค่าใหม่แสดงใน list ทันที
  - delete flow เดิมยังทำงาน
  - create flow เดิมยังไม่พัง

## Risks / notes
- ถ้าใช้ list row action เยอะเกินไป ความกว้างอาจแน่นบนหน้าต่างเล็ก
- Team picker ต้อง handle กรณี store.projects ว่าง
- ห้ามสื่อว่า edit runtime execution behavior ได้จริง เพราะ M4 เป็นแค่ editing UX

## Approval gate
ตาม workflow ปัจจุบัน งาน UI change นี้ควรเริ่ม implement หลังผู้ใช้อนุมัติ plan + mockup ไฟล์ HTML ก่อน
