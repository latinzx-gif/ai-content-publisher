import { requireRole } from "@/lib/auth/require-role"

export default async function BranchDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("branch_manager", "dev")
  return children
}
