import Link from "next/link"
import { notFound } from "next/navigation"

import { EmployeeProfilePageClient } from "@/features/employees/profile/EmployeeProfilePageClient"
import { getEmployeeProfile } from "@/features/employees/profile/data"

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getEmployeeProfile(id)
  if (!profile) notFound()

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      <p className="shrink-0 text-sm">
        <Link href="/admin/employees" className="text-brand-red hover:underline">
          ← กลับรายชื่อพนักงาน
        </Link>
      </p>
      <EmployeeProfilePageClient profile={profile} />
    </div>
  )
}
