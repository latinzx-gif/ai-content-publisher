import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { requireRole } from "@/lib/auth/require-role"
import { OdooSyncClient } from "./OdooSyncClient"
import Link from "next/link"

export default async function AdminPayrollOdooPage() {
  await requireRole("hr", "admin", "dev")

  return (
    <AdminPageShell
      title="Odoo Payroll Integration"
      description="Sync ข้อมูลชั่วโมงทำงานไปยัง Odoo เพื่อคำนวณเงินเดือน"
    >
      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="mb-2 font-medium">📘 วิธีใช้งาน:</p>
        <ol className="ml-4 list-decimal space-y-1">
          <li>ตรวจสอบว่าเชื่อมต่อ Odoo สำเร็จ (สถานะเป็นสีเขียว)</li>
          <li>เลือกเดือน/ปีที่ต้องการ sync</li>
          <li>คลิก Sync Payroll ไปยัง Odoo</li>
          <li>รอจนกว่าจะ sync เสร็จ</li>
          <li>ตรวจสอบผลใน Odoo → Payroll → Payslips</li>
        </ol>
        <p className="mt-3 text-xs text-blue-700">
          💡 <strong>หมายเหตุ:</strong> ข้อมูลที่ sync จะรวม attendance (approved), OT
          (approved), และ leave hours ที่อนุมัติแล้วเท่านั้น
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/payroll"
          className="rounded-lg border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          ← กลับไปหน้า Payroll Hub
        </Link>
        <Link
          href="/admin/payroll/settings"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100"
        >
          ตั้งค่าเงินเดือน
        </Link>
      </div>

      <OdooSyncClient />

      <div className="mt-8 rounded-xl border p-6">
        <h3 className="mb-3 text-sm font-semibold">คำถามที่พบบ่อย (FAQ)</h3>
        <div className="space-y-3 text-sm">
          <details className="rounded-lg border p-3">
            <summary className="cursor-pointer font-medium">
              Q: ทำไมสถานะแสดง disconnected?
            </summary>
            <p className="mt-2 text-muted-foreground">
              A: ตรวจสอบว่า Odoo URL, Database, Username และ API Key ใน .env.local
              ถูกต้องหรือไม่ หรือลองสร้าง API Key ใหม่ใน Odoo
            </p>
          </details>

          <details className="rounded-lg border p-3">
            <summary className="cursor-pointer font-medium">
              Q: Sync แล้วแต่ไม่เห็น Payslips ใน Odoo?
            </summary>
            <p className="mt-2 text-muted-foreground">
              A: ตรวจสอบว่า Payroll module ใน Odoo ติดตั้งแล้วหรือยัง และ Salary Structure
              ถูกสร้างแล้วหรือยัง
            </p>
          </details>

          <details className="rounded-lg border p-3">
            <summary className="cursor-pointer font-medium">Q: Sync ได้แค่บางคนเท่านั้น?</summary>
            <p className="mt-2 text-muted-foreground">
              A: รายชั่วโมง — ต้องมีชม.ใน ledger ที่อนุมัติแล้ว · รายเดือน — ต้องมีเงินเดือนในโปรไฟล์
              (sync ได้แม้ 0 ชม. ถ้ามี salary)
            </p>
          </details>

          <details className="rounded-lg border p-3">
            <summary className="cursor-pointer font-medium">
              Q: Sync ซ้ำเดือนเดิมได้ไหม?
            </summary>
            <p className="mt-2 text-muted-foreground">
              A: ได้ แต่จะสร้าง Payslip ใหม่ใน Odoo (ไม่ overwrite Payslip เดิม) แนะนำให้ลบ
              Payslip เก่าใน Odoo ก่อน sync ใหม่
            </p>
          </details>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="mb-1 font-medium">⚠️ ข้อควรระวัง:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>การ sync จะส่งข้อมูลจริงไปยัง Odoo ทันที (ไม่สามารถ undo ได้ง่าย)</li>
          <li>ตรวจสอบข้อมูล attendance/OT/leave ให้ถูกต้องก่อน sync</li>
          <li>ควร sync เดือนละครั้งหลังจากที่ HR approve ทุกอย่างเรียบร้อยแล้ว</li>
        </ul>
      </div>
    </AdminPageShell>
  )
}
