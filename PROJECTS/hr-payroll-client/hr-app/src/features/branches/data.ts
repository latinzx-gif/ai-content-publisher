import { createClient } from "@/lib/supabase/server"

export type BranchRow = {
  id: string
  name: string
  code: string | null
  address: string | null
  manager_employee_id: string | null
  manager_name: string | null
}

export async function listBranches(): Promise<BranchRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("hr_branches")
    .select(
      "id, name, code, address, manager_employee_id, hr_employees!manager_employee_id(name)"
    )
    .order("name")

  if (error) throw error

  return (data ?? []).map((row) => {
    const mgr = Array.isArray(row.hr_employees)
      ? row.hr_employees[0]
      : row.hr_employees
    return {
      id: row.id as string,
      name: row.name as string,
      code: row.code as string | null,
      address: row.address as string | null,
      manager_employee_id: row.manager_employee_id as string | null,
      manager_name: (mgr as { name?: string } | null)?.name ?? null,
    }
  })
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
