import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getCurrentEmployee } from "@/lib/auth/session"

export default async function OvertimeLiffPage() {
  const employee = await getCurrentEmployee()

  if (!employee) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>ขอ OT</CardTitle>
            <CardDescription>กรุณาเข้าสู่ระบบก่อนใช้งาน</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/login" className="text-sm underline">
              เข้าสู่ระบบ
            </a>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>ขอทำ OT</CardTitle>
          <CardDescription>{employee.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            ตั้งแต่ Phase 5 — พนักงานไม่สามารถยื่น OT เองได้ กรุณาติดต่อ{" "}
            <strong>Branch Manager</strong> ของสาขาเพื่อยื่นคำขอ OT
          </p>
          {employee.role === "branch_manager" ? (
            <a href="/admin/branch/overtime" className="text-brand-red underline">
              ไป Branch Dashboard — ยื่น OT
            </a>
          ) : null}
        </CardContent>
      </Card>
    </main>
  )
}
