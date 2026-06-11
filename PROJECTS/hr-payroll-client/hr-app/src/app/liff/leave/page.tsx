import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  LeaveBalanceCard,
  type LeaveBalance,
} from "@/features/leave/LeaveBalanceCard"
import { LeaveForm } from "@/features/leave/LeaveForm"
import { getCurrentEmployee } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"

// T16/T17: leave form + balance display + submit via /api/leave/request.
export default async function LeaveLiffPage() {
  const employee = await getCurrentEmployee()

  if (!employee) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>แบบฟอร์มขอลา</CardTitle>
            <CardDescription>กรุณาเข้าสู่ระบบก่อนใช้งาน</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              ยังไม่ได้เข้าสู่ระบบ —{" "}
              <a href="/login" className="underline">
                เข้าสู่ระบบ
              </a>
            </p>
          </CardContent>
        </Card>
      </main>
    )
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from("hr_leave_balances")
    .select("leave_type, total_days, used_days")
    .eq("employee_id", employee.id)
  const balances = (data ?? []) as LeaveBalance[]

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 p-4">
      <LeaveBalanceCard balances={balances} />
      <Card>
        <CardHeader>
          <CardTitle>แบบฟอร์มขอลา</CardTitle>
          <CardDescription>{employee.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <LeaveForm />
        </CardContent>
      </Card>
    </main>
  )
}
