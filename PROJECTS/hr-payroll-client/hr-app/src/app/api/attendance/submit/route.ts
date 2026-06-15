import { NextResponse } from "next/server"

import { submitDailyAttendance } from "@/lib/attendance/submit-daily"
import { getCurrentEmployee } from "@/lib/auth/session"
import { notifyHr } from "@/lib/line/notify-hr"

export async function POST() {
  const employee = await getCurrentEmployee()
  if (!employee || employee.status !== "active" || !employee.line_user_id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const result = await submitDailyAttendance({ lineUserId: employee.line_user_id })

  switch (result.status) {
    case "success": {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://hr-app-two-iota.vercel.app"
      await notifyHr([
        {
          type: "text",
          text: [
            "📋 สรุปเข้างานรอ HR อนุมัติ",
            `พนักงาน: ${result.employeeName}`,
            `อนุมัติ: ${baseUrl}/admin/attendance`,
          ].join("\n"),
        },
      ]).catch((err) => console.error("attendance submit HR notify:", err))
      return NextResponse.json({ ok: true, expiresAt: result.expiresAt })
    }
    case "not_checked_in":
      return NextResponse.json({ error: "ยังไม่มีการเช็คอินวันนี้" }, { status: 400 })
    case "not_checked_out":
      return NextResponse.json({ error: "กรุณาเช็คเอาท์ก่อนยื่นสรุปวัน" }, { status: 400 })
    case "already_submitted":
      return NextResponse.json({ error: "ยื่นสรุปวันนี้แล้ว" }, { status: 409 })
    case "not_registered":
      return NextResponse.json({ error: "not registered" }, { status: 404 })
  }
}
