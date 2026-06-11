import Link from "next/link"
import { notFound } from "next/navigation"

import { AdminPageShell } from "@/components/brand/AdminPageShell"
import { StatusPill } from "@/components/brand/StatusPill"
import { EmployeeProfileForm } from "@/features/employees/profile/EmployeeProfileForm"
import { getEmployeeProfile } from "@/features/employees/profile/data"

function statusVariant(
  status: string
): "approved" | "pending" | "neutral" {
  if (status === "active") return "approved"
  if (status === "probation") return "pending"
  return "neutral"
}

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getEmployeeProfile(id)
  if (!profile) notFound()

  return (
    <AdminPageShell
      title={profile.name}
      description={
        <Link
          href="/admin/employees"
          className="text-brand-red hover:underline"
        >
          ← กลับรายชื่อพนักงาน
        </Link>
      }
      badge={
        <StatusPill
          label={profile.status}
          variant={statusVariant(profile.status)}
        />
      }
    >
      <EmployeeProfileForm profile={profile} />
    </AdminPageShell>
  )
}
