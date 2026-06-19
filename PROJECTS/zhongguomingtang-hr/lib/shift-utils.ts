/**
 * shift-utils.ts
 * Logic สำหรับ shift ทั้ง 3 ประเภท โดยเฉพาะกะดึก 14:00-02:00
 */
import { format, addDays, subDays, parseISO, isAfter, isBefore, differenceInMinutes } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

const TZ = 'Asia/Bangkok'

export type ShiftType = {
  id: string
  name: string
  start_time: string   // 'HH:MM'
  end_time: string     // 'HH:MM'
  crosses_midnight: boolean
  min_clockout_minutes: number  // นาทีก่อน end_time ที่ยังไม่ให้ clock-out (ค่าลบ = ก่อน end)
}

/** แปลง HH:MM string เป็น Date object วันเดิม */
function parseTimeOnDate(date: Date, time: string): Date {
  const [h, m] = time.split(':').map(Number)
  const d = new Date(date)
  d.setHours(h, m, 0, 0)
  return d
}

/**
 * คำนวณ work_date ของการ clock-in
 * กะดึก: ถ้า clock-in หลังเที่ยงคืน (00:00-05:59) → work_date เป็นวันก่อนหน้า
 */
export function getWorkDate(clockInTime: Date, shift: ShiftType): Date {
  const bkkTime = toZonedTime(clockInTime, TZ)
  const hour = bkkTime.getHours()

  if (shift.crosses_midnight && hour < 6) {
    return subDays(bkkTime, 1)
  }
  return bkkTime
}

/**
 * ตรวจสอบว่า clock-out ในเวลาที่ถูกต้องหรือไม่
 * กะดึก 14:00-02:00:
 *   - ไม่อนุญาต clock-out ก่อน 00:30 ของวันถัดไป (เว้นแต่มีเหตุฉุกเฉิน)
 *   - ช่วงเวลา valid clock-out: 22:00 - 06:00 (next day)
 */
export function canClockOut(
  clockInTime: Date,
  nowTime: Date,
  shift: ShiftType
): { allowed: boolean; reason?: string } {
  const bkkNow = toZonedTime(nowTime, TZ)
  const bkkClockIn = toZonedTime(clockInTime, TZ)

  const [endH, endM] = shift.end_time.split(':').map(Number)
  const minutesWorked = differenceInMinutes(bkkNow, bkkClockIn)

  // ทำงานน้อยกว่า 1 ชั่วโมง
  if (minutesWorked < 60) {
    return { allowed: false, reason: 'ทำงานน้อยกว่า 1 ชั่วโมง กรุณาติดต่อหัวหน้า' }
  }

  if (shift.crosses_midnight) {
    const hour = bkkNow.getHours()
    // กะดึก: ไม่อนุญาต clock-out ระหว่าง 20:00-23:59 (ยังไม่ถึงเวลา)
    // อนุญาต clock-out ตั้งแต่ 00:00 - 06:00 (วันถัดไป)
    if (hour >= 20 && hour <= 23) {
      const minutesToMidnight = (24 - hour) * 60 - bkkNow.getMinutes()
      return {
        allowed: false,
        reason: `กะดึกยังไม่สิ้นสุด สามารถกดออกงานได้หลัง 00:00 น. (อีก ${minutesToMidnight} นาที)`,
      }
    }
  }

  return { allowed: true }
}

/**
 * คำนวณชั่วโมงทำงานและ OT
 */
export function calcWorkHours(
  clockIn: Date,
  clockOut: Date,
  shift: ShiftType
): { totalHours: number; regularHours: number; otHours: number } {
  const totalMinutes = differenceInMinutes(clockOut, clockIn)
  const totalHours = totalMinutes / 60

  // ชั่วโมงปกติ (ตาม shift)
  const shiftDurationH = shift.crosses_midnight
    ? (24 - parseInt(shift.start_time)) + parseInt(shift.end_time)  // rough
    : parseInt(shift.end_time) - parseInt(shift.start_time)

  const regularHours = Math.min(totalHours, shiftDurationH)
  const otHours = Math.max(0, totalHours - shiftDurationH)

  return {
    totalHours: parseFloat(totalHours.toFixed(2)),
    regularHours: parseFloat(regularHours.toFixed(2)),
    otHours: parseFloat(otHours.toFixed(2)),
  }
}

/**
 * คำนวณค่า OT
 * กฎแรงงาน: วันทำงานปกติ x1.5 | วันหยุด x2 | วันหยุดนักขัตฤกษ์ x3
 */
export function calcOtAmount(
  otHours: number,
  hourlyRate: number,
  otType: 'weekday' | 'weekend' | 'holiday'
): number {
  const multipliers = { weekday: 1.5, weekend: 2.0, holiday: 3.0 }
  return parseFloat((otHours * hourlyRate * multipliers[otType]).toFixed(2))
}

/**
 * ชั่วโมงทำงานต่อวัน → hourly rate
 */
export function getHourlyRate(monthlySalary: number, workDaysPerMonth = 26): number {
  return monthlySalary / workDaysPerMonth / 8
}

/**
 * ตรวจสอบว่า GPS อยู่ในรัศมีสาขา
 */
export function isWithinRadius(
  userLat: number, userLng: number,
  branchLat: number, branchLng: number,
  radiusMeters: number
): boolean {
  const R = 6371000 // Earth radius in meters
  const dLat = ((branchLat - userLat) * Math.PI) / 180
  const dLng = ((branchLng - userLng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((userLat * Math.PI) / 180) *
      Math.cos((branchLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return distance <= radiusMeters
}

/**
 * สร้าง request number
 */
export function generateRequestNumber(prefix: 'LV' | 'OT' | 'DOC' | 'CPL'): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `${prefix}${y}${m}${rand}`
}
