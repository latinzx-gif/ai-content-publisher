import {
  Building2,
  CreditCard,
  FileText,
  Heart,
  Mail,
  User,
} from "lucide-react"
import Link from "next/link"

import { EmployeeAvatar } from "@/components/brand/EmployeeAvatar"
import { StatusPill } from "@/components/brand/StatusPill"
import type { EmployeeProfile } from "@/features/employees/profile/data"
import {
  ProfileField,
  ProfileSectionCard,
} from "@/features/employees/profile/ProfileSectionCard"

const CONTRACT_LABEL: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
}

function formatDate(value: string | null): string {
  if (!value) return "—"
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function EmployeeProfileView({
  profile,
  actions,
}: {
  profile: EmployeeProfile
  actions?: React.ReactNode
}) {
  const employeeCode = profile.id.slice(0, 8).toUpperCase()

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
      <div className="shrink-0 overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="relative bg-brand-red px-4 py-4 text-white md:px-5">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, #fff 0, transparent 45%), radial-gradient(circle at 80% 70%, #fff 0, transparent 40%)",
            }}
          />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <EmployeeAvatar name={profile.name} size="lg" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-xl font-bold">{profile.name}</h1>
                  <StatusPill
                    label={profile.status === "active" ? "Active" : "Inactive"}
                    variant={profile.status === "active" ? "approved" : "neutral"}
                  />
                </div>
                <p className="text-sm text-white/85">Employee ID · {employeeCode}</p>
                <p className="text-xs text-white/75">
                  {profile.contract_start
                    ? `Joined on ${formatDate(profile.contract_start)}`
                    : "Joined on —"}
                  {profile.probation_end
                    ? ` · Probation until ${formatDate(profile.probation_end)}`
                    : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {actions}
              <Link
                href={`/api/checkin/qr?emp_id=${profile.id}`}
                target="_blank"
                className="rounded-lg border border-white/40 bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
              >
                Download QR
              </Link>
              <Link
                href={`/admin/attendance?employee=${profile.id}`}
                className="rounded-lg border border-white/40 bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
              >
                Attendance
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-2 overflow-hidden xl:grid-cols-3 xl:grid-rows-2">
        <ProfileSectionCard title="Contact Information" icon={Mail}>
          <ProfileField label="Work Email" value={profile.email} />
          <ProfileField label="Work Phone" value={profile.phone} />
          <ProfileField label="Personal Email" value="—" />
          <ProfileField label="Address" value="—" className="sm:col-span-2" />
        </ProfileSectionCard>

        <ProfileSectionCard title="Emergency Contact" icon={Heart}>
          <ProfileField label="Contact Name" value="—" />
          <ProfileField label="Relationship" value="—" />
          <ProfileField label="Phone Number" value="—" />
          <ProfileField label="Address" value="—" />
        </ProfileSectionCard>

        <ProfileSectionCard title="Personal Information" icon={User}>
          <ProfileField label="Full Name" value={profile.name} />
          <ProfileField label="Date of Birth" value={formatDate(profile.date_of_birth)} />
          <ProfileField label="Gender" value="—" />
          <ProfileField label="Nationality" value="—" />
          <ProfileField label="LINE User ID" value={profile.line_user_id} className="sm:col-span-2" />
        </ProfileSectionCard>

        <ProfileSectionCard title="Work Information" icon={Building2}>
          <ProfileField label="Department" value={profile.department} />
          <ProfileField label="Position" value={profile.position} />
          <ProfileField
            label="Employment Type"
            value={
              profile.contract_type
                ? CONTRACT_LABEL[profile.contract_type] ?? profile.contract_type
                : "—"
            }
          />
          <ProfileField label="Role" value={profile.role} />
          <ProfileField label="Salary (THB)" value={profile.salary?.toLocaleString() ?? "—"} />
          <ProfileField label="Status" value={profile.status} />
        </ProfileSectionCard>

        <ProfileSectionCard title="Bank Account" icon={CreditCard}>
          <ProfileField label="Bank Name" value="—" />
          <ProfileField label="Account Name" value="—" />
          <ProfileField label="Account Number" value="—" />
          <ProfileField label="Branch" value="—" />
        </ProfileSectionCard>

        <ProfileSectionCard title="Tax & Social Security" icon={FileText}>
          <ProfileField label="Visa Expiry" value={formatDate(profile.visa_expiry)} />
          <ProfileField
            label="Work Permit Expiry"
            value={formatDate(profile.work_permit_expiry)}
          />
          <ProfileField label="Probation" value={profile.probationStatus} />
          <ProfileField label="Visa Status" value={profile.visaStatus.label} />
        </ProfileSectionCard>
      </div>
    </div>
  )
}
