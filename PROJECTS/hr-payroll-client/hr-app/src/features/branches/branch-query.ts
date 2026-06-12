import type { SupabaseClient } from "@supabase/supabase-js"

import type { BranchDetail } from "@/features/branches/branch-hub-data"
import type { BranchRow } from "@/features/branches/data"
import { branchAdminPath, isBranchUuid } from "@/lib/branches/branch-slug"

type BranchCore = {
  id: string
  name: string
  code: string | null
  address: string | null
  manager_employee_id: string | null
}

export async function loadManagerName(
  supabase: SupabaseClient,
  managerEmployeeId: string | null
): Promise<string | null> {
  if (!managerEmployeeId) return null
  const { data, error } = await supabase
    .from("hr_employees")
    .select("name")
    .eq("id", managerEmployeeId)
    .maybeSingle()
  if (error) return null
  return (data?.name as string | undefined) ?? null
}

function mapBranchCore(row: BranchCore): BranchCore {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    address: row.address,
    manager_employee_id: row.manager_employee_id,
  }
}

export async function fetchBranchBySlug(
  supabase: SupabaseClient,
  slugParam: string
): Promise<BranchDetail | null> {
  const decoded = decodeURIComponent(slugParam)

  if (isBranchUuid(decoded)) {
    return fetchBranchById(supabase, decoded)
  }

  const { data, error } = await supabase
    .from("hr_branches")
    .select("id, name, code, address, manager_employee_id")
    .order("name")

  if (error) throw error

  const normalized = decodeURIComponent(slugParam)
  const match = (data ?? []).find((row) => {
    const path = branchAdminPath(row as BranchCore)
    return (
      path === `/admin/branch/${slugParam}` ||
      path === `/admin/branch/${normalized}` ||
      path === `/admin/branch/${encodeURIComponent(normalized)}`
    )
  })

  if (!match) return null
  return fetchBranchById(supabase, match.id as string)
}

export async function fetchBranchById(
  supabase: SupabaseClient,
  branchId: string
): Promise<BranchDetail | null> {
  const { data, error } = await supabase
    .from("hr_branches")
    .select("id, name, code, address, manager_employee_id")
    .eq("id", branchId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const core = mapBranchCore(data as BranchCore)
  const manager_name = await loadManagerName(supabase, core.manager_employee_id)

  return { ...core, manager_name }
}

export async function fetchAllBranches(
  supabase: SupabaseClient
): Promise<BranchRow[]> {
  const { data, error } = await supabase
    .from("hr_branches")
    .select("id, name, code, address, manager_employee_id")
    .order("name")

  if (error) throw error

  const rows = (data ?? []) as BranchCore[]
  const managerIds = [
    ...new Set(
      rows
        .map((r) => r.manager_employee_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    ),
  ]

  const managerNames = new Map<string, string>()
  if (managerIds.length > 0) {
    const { data: managers } = await supabase
      .from("hr_employees")
      .select("id, name")
      .in("id", managerIds)
    for (const m of managers ?? []) {
      managerNames.set(m.id as string, m.name as string)
    }
  }

  return rows.map((row) => ({
    ...mapBranchCore(row),
    manager_name: row.manager_employee_id
      ? (managerNames.get(row.manager_employee_id) ?? null)
      : null,
  }))
}
