/**
 * POST /api/attendance — Clock In / Clock Out
 * รองรับกะดึก 14:00-02:00 (crosses_midnight)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import {
  getWorkDate,
  canClockOut,
  calcWorkHours,
  isWithinRadius,
} from '@/lib/shift-utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, employee_id, lat, lng } = body  // action: 'in' | 'out'

    const supabase = createAdminClient()
    const now = new Date()

    // ดึงข้อมูลพนักงานและ shift
    const { data: emp, error: empErr } = await supabase
      .from('employees')
      .select('*, shift_type:shift_types(*), branch:branches(*)')
      .eq('id', employee_id)
      .single()

    if (empErr || !emp) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลพนักงาน' }, { status: 404 })
    }

    const shift = emp.shift_type
    const branch = emp.branch

    // ตรวจสอบ GPS
    const withinRadius = isWithinRadius(lat, lng, branch.lat, branch.lng, branch.radius_meters)
    if (!withinRadius) {
      return NextResponse.json(
        { error: 'ตำแหน่งของคุณอยู่นอกพื้นที่สาขา กรุณาเข้างานภายในร้าน' },
        { status: 400 }
      )
    }

    // คำนวณ work_date
    const workDate = getWorkDate(now, shift)
    const workDateStr = workDate.toISOString().split('T')[0]

    if (action === 'in') {
      // ตรวจว่ากด clock-in แล้วหรือยัง
      const { data: existing } = await supabase
        .from('attendance')
        .select('id, clock_in_at')
        .eq('employee_id', employee_id)
        .eq('work_date', workDateStr)
        .single()

      if (existing?.clock_in_at) {
        return NextResponse.json(
          { error: 'คุณกดเข้างานแล้ว', clock_in_at: existing.clock_in_at },
          { status: 409 }
        )
      }

      // คำนวณว่ามาสายหรือไม่
      const [startH, startM] = shift.start_time.split(':').map(Number)
      const shiftStart = new Date(workDate)
      shiftStart.setHours(startH, startM + 10, 0, 0)  // grace period 10 นาที
      const isLate = now > shiftStart
      const lateMinutes = isLate ? Math.floor((now.getTime() - shiftStart.getTime()) / 60000) : 0

      const { data, error } = await supabase.from('attendance').insert({
        employee_id,
        branch_id: emp.branch_id,
        shift_type_id: emp.shift_type_id,
        work_date: workDateStr,
        clock_in_at: now.toISOString(),
        clock_in_lat: lat,
        clock_in_lng: lng,
        clock_in_within_radius: withinRadius,
        is_late: isLate,
        late_minutes: lateMinutes,
        status: 'present',
      }).select().single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: isLate ? `เข้างานสำเร็จ (สาย ${lateMinutes} นาที)` : 'เข้างานสำเร็จ',
        data,
      })
    }

    if (action === 'out') {
      const { data: record } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employee_id)
        .eq('work_date', workDateStr)
        .single()

      if (!record) {
        return NextResponse.json({ error: 'ยังไม่ได้กดเข้างาน' }, { status: 400 })
      }

      if (record.clock_out_at) {
        return NextResponse.json({ error: 'กดออกงานแล้ว' }, { status: 409 })
      }

      // ตรวจสอบว่า clock-out ได้หรือยัง (กะดึกต้องไม่อนุญาตก่อนเที่ยงคืน)
      const clockInTime = new Date(record.clock_in_at)
      const canOut = canClockOut(clockInTime, now, shift)
      if (!canOut.allowed) {
        return NextResponse.json({ error: canOut.reason }, { status: 400 })
      }

      const { totalHours, otHours } = calcWorkHours(clockInTime, now, shift)

      const { data, error } = await supabase
        .from('attendance')
        .update({
          clock_out_at: now.toISOString(),
          clock_out_lat: lat,
          clock_out_lng: lng,
          clock_out_within_radius: withinRadius,
          total_hours: totalHours,
          overtime_hours: otHours,
        })
        .eq('id', record.id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: 'ออกงานสำเร็จ',
        data,
      })
    }

    return NextResponse.json({ error: 'action ไม่ถูกต้อง' }, { status: 400 })
  } catch (err: any) {
    console.error('[attendance]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const employeeId = searchParams.get('employee_id')
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('attendance')
    .select('*, shift_type:shift_types(name, start_time, end_time, crosses_midnight), branch:branches(name)')
    .eq('employee_id', employeeId!)
    .eq('work_date', date)
    .single()

  if (error) return NextResponse.json({ data: null })
  return NextResponse.json({ data })
}
