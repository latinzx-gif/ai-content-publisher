'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

export default function ClockPage() {
  const [now, setNow] = useState(new Date())
  const [attendance, setAttendance] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [gpsStatus, setGpsStatus] = useState<'checking' | 'ok' | 'fail'>('checking')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  // อัปเดตนาฬิกาทุก 1 วินาที
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // ขอ GPS
  useEffect(() => {
    if (!navigator.geolocation) { setGpsStatus('fail'); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGpsStatus('ok')
      },
      () => setGpsStatus('fail'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  // ดึงสถานะวันนี้
  useEffect(() => {
    const empId = localStorage.getItem('employee_id')
    if (!empId) return
    fetch(`/api/attendance?employee_id=${empId}`)
      .then(r => r.json())
      .then(({ data }) => setAttendance(data))
  }, [])

  async function handleClock(action: 'in' | 'out') {
    if (gpsStatus !== 'ok' || !coords) {
      setMessage('ไม่สามารถระบุตำแหน่ง GPS ได้ กรุณาเปิดสิทธิ์ Location')
      setStatus('error')
      return
    }
    setLoading(true)
    const empId = localStorage.getItem('employee_id')
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, employee_id: empId, lat: coords.lat, lng: coords.lng }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setMessage(data.message)
      setStatus('success')
      setAttendance(data.data)
    } else {
      setMessage(data.error)
      setStatus('error')
    }
  }

  const timeStr = format(now, 'HH:mm:ss')
  const dateStr = format(now, 'EEEE d MMMM yyyy', { locale: th })
  const hasClockIn = !!attendance?.clock_in_at
  const hasClockOut = !!attendance?.clock_out_at

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#C41E3A] text-white px-4 py-3">
        <button onClick={() => history.back()} className="text-sm opacity-80 mb-2 flex items-center gap-1">
          ← ย้อนกลับ
        </button>
        <h1 className="text-lg font-medium">บันทึกเวลางาน</h1>
      </div>

      {/* GPS Map Placeholder */}
      <div className="h-36 bg-green-50 flex flex-col items-center justify-center relative">
        <div className="text-3xl">📍</div>
        <div className={`mt-1 text-xs px-3 py-1 rounded-full ${
          gpsStatus === 'ok' ? 'bg-green-100 text-green-800' :
          gpsStatus === 'fail' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {gpsStatus === 'ok' ? '✓ อยู่ในพื้นที่สาขา' :
           gpsStatus === 'fail' ? '✗ ไม่สามารถระบุตำแหน่ง' : 'กำลังตรวจสอบ GPS...'}
        </div>
      </div>

      {/* Clock */}
      <div className="px-4 py-4">
        <div className="text-5xl font-light text-center tracking-tight">{timeStr.slice(0, 5)}</div>
        <div className="text-sm text-gray-500 text-center mt-1">{dateStr}</div>

        {/* Shift Info */}
        <div className="card mt-4 space-y-2">
          {[
            ['กะงาน', 'กะดึก (14:00 – 02:00)'],
            ['สาขา', 'สาขาสีลม'],
            ['เข้างานวันนี้', hasClockIn ? format(new Date(attendance.clock_in_at), 'HH:mm') : '–'],
            ['ออกงาน', hasClockOut ? format(new Date(attendance.clock_out_at), 'HH:mm') : attendance?.clock_out_at ? '–' : 'วันเสาร์ 02:00 น.'],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between items-center text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium">{val}</span>
            </div>
          ))}
        </div>

        {/* Alert for night shift */}
        <div className="mt-3 bg-red-50 rounded-xl p-3 text-xs text-red-800">
          ⚠️ กะดึก: สามารถกดออกงานได้หลัง 00:00 น. ของวันถัดไปเท่านั้น
        </div>

        {/* Status Message */}
        {status !== 'idle' && (
          <div className={`mt-3 p-3 rounded-xl text-sm text-center ${
            status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          {!hasClockIn && (
            <button
              onClick={() => handleClock('in')}
              disabled={loading || gpsStatus !== 'ok'}
              className="btn-primary"
            >
              {loading ? 'กำลังบันทึก...' : '⏰ กดเข้างาน'}
            </button>
          )}
          {hasClockIn && !hasClockOut && (
            <button
              onClick={() => handleClock('out')}
              disabled={loading || gpsStatus !== 'ok'}
              className="btn-outline"
            >
              {loading ? 'กำลังบันทึก...' : '🏠 กดออกงาน'}
            </button>
          )}
          {hasClockOut && (
            <div className="text-center py-4 text-green-700 font-medium">
              ✓ บันทึกเวลาครบแล้ว
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
