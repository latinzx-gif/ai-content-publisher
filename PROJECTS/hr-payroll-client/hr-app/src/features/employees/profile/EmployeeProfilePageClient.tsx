"use client"

import { Pencil } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { EmployeeProfileForm } from "@/features/employees/profile/EmployeeProfileForm"
import { EmployeeProfileView } from "@/features/employees/profile/EmployeeProfileView"
import { LifecyclePanel } from "@/features/employees/profile/LifecyclePanel"
import type { EmployeeProfile } from "@/features/employees/profile/data"

type ComplianceNote = {
  id: string
  category: string
  note: string
  created_at: string
}

export function EmployeeProfilePageClient({
  profile,
  notes,
}: {
  profile: EmployeeProfile
  notes: ComplianceNote[]
}) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
        <div className="flex shrink-0 items-center justify-between gap-2">
          <p className="text-sm font-medium">แก้ไขข้อมูลพนักงาน</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing(false)}
          >
            กลับหน้าโปรไฟล์
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <EmployeeProfileForm profile={profile} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
      <EmployeeProfileView
        profile={profile}
        actions={
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            onClick={() => setEditing(true)}
          >
            <Pencil className="size-3.5" />
            Edit Profile
          </Button>
        }
      />
      <section className="shrink-0 rounded-xl border border-border/80 bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Employee Lifecycle (F5)</h2>
        <LifecyclePanel profile={profile} notes={notes} />
      </section>
    </div>
  )
}
