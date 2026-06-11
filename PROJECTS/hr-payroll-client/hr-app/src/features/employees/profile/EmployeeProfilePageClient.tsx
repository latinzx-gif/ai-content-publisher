"use client"

import { Pencil } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { EmployeeProfileForm } from "@/features/employees/profile/EmployeeProfileForm"
import { EmployeeProfileView } from "@/features/employees/profile/EmployeeProfileView"
import type { EmployeeProfile } from "@/features/employees/profile/data"

export function EmployeeProfilePageClient({
  profile,
}: {
  profile: EmployeeProfile
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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
    </div>
  )
}
