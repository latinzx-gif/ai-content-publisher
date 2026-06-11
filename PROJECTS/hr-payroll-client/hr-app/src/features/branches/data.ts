import { createClient } from "@/lib/supabase/server"

export type BranchRow = {
  id: string
  name: string
  code: string | null
  manager_employee_id: string | null
  hr_employees?: { name: string } | { name: string }[] | null
}

export async function listBranches(): Promise<BranchRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("hr_branches")
    .select("id, name, code, manager_employee_id")
    .order("name")

  if (error) throw error
  return (data ?? []) as BranchRow[]
}

export async function listDepartmentsByBranch(branchId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("hr_departments")
    .select("id, name")
    .eq("branch_id", branchId)
    .order("name")

  if (error) throw error
  return data ?? []
}
