# Paid Hours + LINE/LIFF Checkout Summary Fix Plan

Goal: ปรับ logic attendance/payroll ให้คิดเฉพาะชั่วโมงที่จ่ายได้จริงในกรอบเวลากะ และปรับข้อความใน LINE/LIFF checkout summary ไม่ให้แจ้งว่า “เกินเวลามาตรฐาน” อีก

Context:
- ปัจจุบัน checkout คิด work_hours จากเวลาจริง check_in_at → check_out_at ทั้งหมด
- ตัวอย่าง 10:55–22:05 จะถูกคิด 11.17 ชม. แม้เวลาจ่ายควรถูก cap อยู่ในกรอบกะ
- Flex message checkout มี footer `line.checkout.footerOt` ที่แจ้ง “เกินเวลามาตรฐาน ...” จาก `overtimeMinutes`
- ผู้ใช้ต้องการให้เตือน/สรุป “นับแค่ชั่วโมงที่ได้จริงตามที่ทำครบพอ” และไม่ต้องแจ้งว่าเกินมาเท่าไหร่

Proposed policy:
- Regular paid hours = overlap ระหว่างเวลาทำงานจริง `[check_in_at, check_out_at]` กับกรอบกะ `[scheduled_start, scheduled_end]`
- เข้างานก่อนเวลา: ไม่เพิ่มชั่วโมงจ่าย
- เลิกงานหลังเวลา: ไม่เพิ่มชั่วโมงจ่ายอัตโนมัติ
- OT ต้องมาจาก approved OT request เท่านั้น ไม่ใช่ checkout หลังเวลา
- ถ้าไม่พบกะ/default time ให้ fallback เป็น logic เดิมเพื่อไม่ทำให้พนักงานที่ยังไม่ตั้งกะถูกคิด 0 ชม.

Important note:
- ใน seed/migration พบ Branch Day 10:00–22:00 แต่ `standard_hours = 10.00`
- จาก requirement ล่าสุด ฟาเดลยืนยันว่า Branch Day 10:00–22:00 = 12 ชม.
- ดังนั้น implementation รอบนี้ควร “คำนวณจากช่วงเวลา start/end” ไม่ควรใช้ `standard_hours` เป็น cap เว้นแต่มี policy หักพักแยกต่างหาก

Likely files to change:
1. `hr-app/src/lib/attendance/check-out.ts`
   - โหลด employee work shift / default_check_in_time / default_check_out_time เพิ่ม
   - เปลี่ยน `workHours` จาก raw actual duration เป็น paid duration ในกรอบกะ
   - return `workMinutes` เป็น paid minutes เพื่อให้ LINE summary แสดงชั่วโมงจ่ายจริง
   - เอา dependency ต่อ `STANDARD_WORK_MINUTES` / `overtimeMinutes` ออกจาก flow หรือส่ง 0 เสมอชั่วคราว

2. `hr-app/src/lib/attendance/manual.ts`
   - manual LIFF save ใช้ paid duration แบบเดียวกับ checkout ปกติ
   - finalWorkHours ต้องเป็น paid hours ไม่ใช่ raw check-in → checkout
   - รองรับ full/checkin/checkout existing record เหมือนเดิม

3. `hr-app/src/lib/attendance/hr-manage.ts`
   - HR create/update attendance ควรใช้ helper เดียวกันเมื่อไม่ได้กรอก workHours เอง
   - ถ้า HR กรอก workHours เอง ให้ถือว่า override manual ตามเดิม

4. `hr-app/src/lib/attendance/paid-work-time.ts` (new helper)
   - รวม logic คำนวณ paid minutes/hours ไว้จุดเดียว
   - input: date, checkInAt, checkOutAt, shift, default_check_in_time, default_check_out_time
   - output: `{ rawMinutes, paidMinutes, paidHours, windowStart, windowEnd, capped: boolean }`

5. `hr-app/src/lib/line/flex/checkout.ts`
   - ไม่แสดง `line.checkout.footerOt`
   - footer ใช้ข้อความกลาง เช่น “บันทึกเวลาเข้า-ออกเรียบร้อยแล้ว ระบบคิดเฉพาะชั่วโมงในกรอบกะ”
   - หรือใช้ `line.checkout.footer` เดิมถ้าไม่อยากเพิ่ม translation

6. `hr-app/src/lib/line/handlers/message.ts`
   - ส่ง paid `workMinutes` เข้า checkoutSummaryFlex
   - ไม่จำเป็นต้องส่ง `overtimeMinutes` หรือส่ง 0 เพื่อ compatibility

7. `hr-app/src/lib/i18n/messages.ts` และ locale อื่น ๆ
   - ปรับ/เลิกใช้ `line.checkout.footerOt`
   - เพิ่มข้อความ footer ใหม่ถ้าต้องการความชัดเจน
   - ต้อง sync th/en/zh/my ถ้า key ถูกใช้ในทุก locale

Implementation steps:

Task 1: Add paid-hours helper + unit tests
- Create `src/lib/attendance/paid-work-time.ts`
- Create `src/lib/attendance/paid-work-time.test.ts`
- Test cases:
  1. Shift 11:00–22:00, actual 10:55–22:05 => paid 660 นาที = 11.00 ชม.
  2. Shift 10:00–22:00, actual 10:55–22:05 => paid 665 นาที = 11.08 ชม.
  3. Shift 10:00–22:00, actual 09:50–22:10 => paid 720 นาที = 12.00 ชม.
  4. Actual 11:15–21:30 in 10:00–22:00 => paid 615 นาที = 10.25 ชม.
  5. No shift/default window => fallback raw duration, to avoid breaking unassigned employees
  6. crosses_midnight shift if currently supported

Task 2: Wire helper into normal LINE checkout
- Modify `check-out.ts`
- Select employee `work_shift_id`, `default_check_in_time`, `default_check_out_time`
- Load active shift with start/end/crosses_midnight
- Calculate rawMinutes for audit/display if needed, but store `paidHours` in `hr_attendance.work_hours`
- `finalizeAttendanceRecord(... workHours: paidHours)`
- Return `workMinutes: paidMinutes`
- `overtimeMinutes` should be removed or set to 0 so no footer warning appears

Task 3: Wire helper into LIFF manual attendance
- Modify `manual.ts`
- Resolve employee default_check_out_time too
- Use paid helper for `finalWorkHours`
- `finalizeAttendanceRecord` receives paid hours
- Ensure retro/quota behavior unchanged

Task 4: Wire helper into HR manual create/update
- Modify `hr-manage.ts`
- If input.workHours is blank and checkout exists, compute paid hours by helper
- If HR typed workHours manually, keep override behavior

Task 5: Update checkout Flex copy
- Modify `line/flex/checkout.ts`
- Remove conditional footer based on overtimeMinutes
- Always show non-OT footer
- Suggested Thai text: “บันทึกเวลาเข้า-ออกเรียบร้อยแล้ว ระบบคิดเฉพาะชั่วโมงในกรอบกะ”
- Keep total row as paid time only

Task 6: Regression tests
- Run targeted tests:
  - `node --test` / project test command for `paid-work-time.test.ts`
  - existing attendance tests: `late.test.ts`, `daily-roster.test.ts`, `retro-limit.test.ts`
- Run typecheck/build according to project constraints

Acceptance criteria:
- Branch Day 10:00–22:00, actual 09:50–22:10 => payroll regular = 12.00 ชม.
- Branch Day 10:00–22:00, actual 10:55–22:05 => payroll regular = 11.08 ชม.
- 11:00–22:00, actual 10:55–22:05 => payroll regular = 11.00 ชม.
- LINE checkout summary “รวมเวลา” shows paid time only
- No message says “เกินเวลามาตรฐาน ...”
- Approved OT request still records overtime separately via `overtime-decide.ts`
- No schema migration required

Risks / decisions:
- Existing records already saved as raw hours will not be corrected unless we run a backfill; avoid production DB writes unless explicitly approved
- Need decide whether to update old hr_payroll_hour_lines for historical records later
- If company actually has unpaid break inside 10:00–22:00, need separate break policy; current requested rule says count 12 ชม.

Recommended execution:
- Use agy for code edits per user preference:
  `~/.local/bin/agy --prompt --dangerously-skip-permissions < /tmp/paid-hours-fix.md`
- Do not commit/push until typecheck + build pass and user approves
