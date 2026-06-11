import Link from "next/link"

import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { getPayrollHourReport } from "@/features/payroll/data"
import { requireRole } from "@/lib/auth/require-role"
import { createClient } from "@/lib/supabase/server"

export default async function AdminPayrollPage() {
  await requireRole("hr", "admin")

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const supabase = await createClient()
  const [report, employeesRes] = await Promise.all([
    getPayrollHourReport(year, month),
    supabase
      .from("hr_employees")
      .select("id, name, department, salary, status")
      .eq("status", "active")
      .order("name")
      .limit(50),
  ])

  const employees = employeesRes.data ?? []

  return (
    <AdminPageShell
      title="Payroll Hub"
      description={`สรุปชม.การทำงานที่อนุมัติแล้ว — ${month}/${year} (ยังไม่คำนวณเงินเป็นบาท)`}
    >
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        ชม.ปกติ / OT / ลาป่วยรายชม. จะถูกบันทึกหลัง HR อนุมัติขั้นสุดท้าย — ขอสลิปผ่าน{" "}
        <Link href="/admin/documents" className="font-medium underline">
          คำขอเอกสาร
        </Link>
      </div>

      <section className="mb-6">
        <h3 className="mb-2 text-sm font-semibold">ชม.ที่อนุมัติแล้ว (เดือนนี้)</h3>
        {report.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มีชม.ที่บันทึกใน ledger</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-3 py-2">พนักงาน</th>
                  <th className="px-3 py-2">แผนก</th>
                  <th className="px-3 py-2">ชม.ปกติ</th>
                  <th className="px-3 py-2">OT</th>
                  <th className="px-3 py-2">ลาป่วย (ชม.)</th>
                  <th className="px-3 py-2">รวม</th>
                </tr>
              </thead>
              <tbody>
                {report.map((r) => (
                  <tr key={`${r.name}-${r.department}`} className="border-b last:border-0">
                    <td className="px-3 py-2">{r.name}</td>
                    <td className="px-3 py-2">{r.department}</td>
                    <td className="px-3 py-2">{r.regular.toFixed(2)}</td>
                    <td className="px-3 py-2">{r.overtime.toFixed(2)}</td>
                    <td className="px-3 py-2">{r.sick.toFixed(2)}</td>
                    <td className="px-3 py-2 font-medium">
                      {(r.regular + r.overtime + r.sick).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">เงินเดือนที่บันทึก (อ้างอิง)</h3>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-3 py-2">พนักงาน</th>
                <th className="px-3 py-2">แผนก</th>
                <th className="px-3 py-2">เงินเดือน (บันทึก)</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id as string} className="border-b last:border-0">
                  <td className="px-3 py-2">{e.name as string}</td>
                  <td className="px-3 py-2">{(e.department as string) ?? "—"}</td>
                  <td className="px-3 py-2">
                    {e.salary != null ? Number(e.salary).toLocaleString("th-TH") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminPageShell>
  )
}
