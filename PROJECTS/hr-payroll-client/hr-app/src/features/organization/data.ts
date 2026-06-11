import { createClient } from "@/lib/supabase/server"

export type DepartmentRow = {
  id: string
  name: string
  employeeCount: number
}

export async function getDepartments() {
  const supabase = await createClient()
  const { data: depts, error } = await supabase
    .from("hr_departments")
    .select("id, name")
    .order("name")

  if (error) throw error

  const { data: employees } = await supabase
    .from("hr_employees")
    .select("department")
    .eq("status", "active")

  const counts = new Map<string, number>()
  for (const e of employees ?? []) {
    const d = e.department as string | null
    if (d) counts.set(d, (counts.get(d) ?? 0) + 1)
  }

  const rows: DepartmentRow[] = (depts ?? []).map((d) => ({
    id: d.id as string,
    name: d.name as string,
    employeeCount: counts.get(d.name as string) ?? 0,
  }))

  return rows
}
