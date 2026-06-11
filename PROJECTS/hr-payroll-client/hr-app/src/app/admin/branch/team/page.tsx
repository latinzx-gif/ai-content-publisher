import { Users } from "lucide-react"

import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { DevelopmentEmptyState } from "@/components/brand/DevelopmentEmptyState"
import { getBranchEmployees } from "@/features/manager/data"
import { requireRole } from "@/lib/auth/require-role"

export default async function BranchTeamPage() {
  const employee = await requireRole("branch_manager", "dev")
  const team = await getBranchEmployees(employee)

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <AdminPageShell
        fill
        title="ทีมในสาขา"
        description="พนักงานที่อยู่ภายใต้สาขาของคุณ"
      >
        {team.length === 0 ? (
          <DevelopmentEmptyState
            icon={Users}
            title="ยังไม่มีพนักงานในสาขา"
            description="อยู่ในช่วงพัฒนาปรับปรุงระบบ — รายชื่อทีมจะแสดงเมื่อ HR มอบหมายพนักงานเข้าสาขา"
          />
        ) : (
          <div className="min-h-0 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 border-b bg-card text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">ชื่อ</th>
                  <th className="px-3 py-2 font-medium">แผนก</th>
                </tr>
              </thead>
              <tbody>
                {team.map((e) => (
                  <tr key={e.id as string} className="border-b border-border/50 last:border-0">
                    <td className="px-3 py-2 font-medium">{e.name as string}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {(e.department as string) ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPageShell>
    </div>
  )
}
