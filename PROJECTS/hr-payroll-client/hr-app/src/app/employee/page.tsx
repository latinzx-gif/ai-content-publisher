import { redirect } from "next/navigation"

import { PendingRegistrationCard } from "@/components/auth/PendingRegistrationCard"
import {
  isPendingRegistration,
  PENDING_REGISTRATION_PATH,
} from "@/lib/auth/employee-access"
import { adminLoginPath } from "@/lib/auth/roles"
import { getCurrentEmployee } from "@/lib/auth/session"

export default async function EmployeeInfoPage() {
  const employee = await getCurrentEmployee()
  if (!employee) {
    redirect("/login")
  }

  if (employee.role !== "employee" && employee.role !== "dev") {
    redirect(adminLoginPath(employee.role, employee.status))
  }

  if (isPendingRegistration(employee)) {
    redirect(PENDING_REGISTRATION_PATH)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border/80 bg-card p-6 shadow-lg text-center">
        <p className="text-lg font-semibold">สวัสดี, {employee.name}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          บัญชีพนักงานใช้งานผ่าน <strong>LINE OA</strong> เท่านั้น
          — กดเมนู HR ด้านล่างแชทเพื่อเช็คอิน ขอลา หรือยื่นเอกสาร
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          ไม่มี Web Dashboard สำหรับพนักงานทั่วไป
        </p>
      </div>
    </main>
  )
}
