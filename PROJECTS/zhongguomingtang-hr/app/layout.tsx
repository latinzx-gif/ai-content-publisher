import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '中国名堂 HR Portal',
  description: 'ระบบจัดการ HR & Payroll สำหรับพนักงาน',
  themeColor: '#C41E3A',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
