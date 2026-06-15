import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { OvertimeForm } from "@/features/overtime/OvertimeForm"
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
          <CardDescription>
            {employee.name} — ยื่นแล้วแจ้ง HR ทาง LINE Group รออนุมัติ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OvertimeForm />
        </CardContent>
      </Card>
    </main>
  )
}
