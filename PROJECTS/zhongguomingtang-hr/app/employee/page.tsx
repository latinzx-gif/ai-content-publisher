'use client'
import Link from 'next/link'

const menuItems = [
  { href: '/employee/clock',     icon: '⏰', label: 'บันทึกเวลา',       sub: 'เข้า-ออกงาน',              color: 'bg-red-50' },
  { href: '/employee/leave',     icon: '📋', label: 'ขอลา',             sub: 'ลาป่วย/กิจ/พักร้อน',      color: 'bg-orange-50' },
  { href: '/employee/ot',        icon: '⌚', label: 'ขอ OT',            sub: 'ทำงานล่วงเวลา',            color: 'bg-yellow-50' },
  { href: '/employee/documents', icon: '📄', label: 'ขอเอกสาร',         sub: 'หนังสือรับรอง/Payslip',    color: 'bg-blue-50' },
  { href: '/employee/complaint', icon: '📢', label: 'ร้องเรียน',         sub: 'แจ้งปัญหา (ปิดบัง)',        color: 'bg-green-50' },
  { href: '/employee/history',   icon: '📑', label: 'ประวัติคำขอ',       sub: 'ติดตามสถานะ',              color: 'bg-purple-50' },
]

export default function EmployeeHome() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#C41E3A] text-white px-4 pt-10 pb-6">
        <p className="text-sm opacity-80">สวัสดี 👋</p>
        <h1 className="text-xl font-medium mt-1">คุณสมชาย พิทักษ์ดี</h1>
        <div className="inline-flex items-center gap-1 mt-2 bg-white/20 rounded-full px-3 py-1 text-xs">
          📍 สาขาสีลม · กะดึก 14:00–02:00
        </div>
      </div>

      {/* Shift Card */}
      <div className="mx-4 -mt-4 card">
        <p className="text-xs text-gray-400">วันศุกร์ที่ 19 มิถุนายน 2569 · กะดึก</p>
        <div className="flex justify-between items-center mt-2">
          <div>
            <p className="text-2xl font-medium">14:00 – 02:00</p>
            <p className="text-xs text-gray-400 mt-0.5">ออกงาน: เสาร์ 02:00 น.</p>
          </div>
          <span className="bg-red-50 text-red-800 text-xs px-3 py-1 rounded-full font-medium">กะดึก</span>
        </div>
        <Link href="/employee/clock">
          <button className="btn-primary mt-3 text-sm">⏰ กดเข้างาน</button>
        </Link>
      </div>

      {/* Menu Grid */}
      <div className="px-4 mt-4 pb-8">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">เมนูหลัก</p>
        <div className="grid grid-cols-2 gap-3">
          {menuItems.map(({ href, icon, label, sub, color }) => (
            <Link key={href} href={href}>
              <div className="card hover:shadow-md transition-shadow cursor-pointer">
                <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center text-xl mb-2`}>
                  {icon}
                </div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
