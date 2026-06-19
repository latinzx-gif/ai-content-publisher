'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [branch, setBranch] = useState('all')

  const kpis = [
    { label: 'พนักงานทั้งหมด', value: '47', sub: '↑ 3 คนใหม่', color: 'text-gray-900' },
    { label: 'เข้างานวันนี้', value: '38', sub: 'ลา 4 · ขาด 0', color: 'text-gray-900' },
    { label: 'รออนุมัติ', value: '6', sub: 'ลา 3 · OT 2 · เอกสาร 1', color: 'text-red-700' },
    { label: 'Payroll มิ.ย.', value: '847K', sub: 'รวม OT: 38K', color: 'text-gray-900' },
  ]

  const tabs = [
    { href: '/admin/attendance', label: 'การลงเวลา', icon: '⏰' },
    { href: '/admin/requests',   label: 'คำขออนุมัติ', icon: '📋', badge: 6 },
    { href: '/admin/payroll',    label: 'เงินเดือน', icon: '💰' },
    { href: '/admin/shifts',     label: 'กะงาน', icon: '🗓' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#C41E3A] text-white px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-lg">🐼</div>
          <div>
            <p className="text-sm font-medium">中国名堂 HR</p>
            <p className="text-xs opacity-70">Admin Portal</p>
          </div>
        </div>
        <select
          value={branch}
          onChange={e => setBranch(e.target.value)}
          className="bg-white/20 text-white border-none text-xs rounded-lg px-2 py-1"
        >
          <option value="all">ทุกสาขา</option>
          <option value="silom">สาขาสีลม</option>
          <option value="siam">สาขาสยาม</option>
          <option value="asok">สาขาอโศก</option>
        </select>
      </div>

      <div className="px-4 py-4">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {kpis.map(({ label, value, sub, color }) => (
            <div key={label} className="bg-gray-100 rounded-xl p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
              <p className={`text-2xl font-medium mt-1 ${color}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Quick Nav */}
        <div className="space-y-2 mb-4">
          {tabs.map(({ href, label, icon, badge }) => (
            <Link key={href} href={href}>
              <div className="card flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{icon}</span>
                  <span className="font-medium text-sm">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {badge && (
                    <span className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5">{badge}</span>
                  )}
                  <span className="text-gray-300">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Today's Attendance Quick View */}
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">การเข้างานวันนี้</p>
          <div className="flex gap-2">
            {[
              { color: 'bg-green-500', count: 38, label: 'เข้างาน' },
              { color: 'bg-orange-400', count: 4, label: 'ลา' },
              { color: 'bg-red-500', count: 0, label: 'ขาด' },
              { color: 'bg-gray-400', count: 5, label: 'ยังไม่กด' },
            ].map(({ color, count, label }) => (
              <div key={label} className="flex-1 card text-center py-2">
                <div className={`w-2 h-2 ${color} rounded-full mx-auto mb-1`}></div>
                <p className="text-lg font-medium">{count}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
