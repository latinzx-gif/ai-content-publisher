// Employee list queries — server-only, runs through the caller's session
// (RLS: hr_is_hr_admin allows full read). No service role here.
import { createClient } from "@/lib/supabase/server"

export const PAGE_SIZE = 12

// Whitelist: sort column comes from the URL — never pass it through raw.
const SORT_COLUMNS = ["name", "contract_start"] as const
export type SortColumn = (typeof SORT_COLUMNS)[number]

export type EmployeeStatusFilter = "all" | "active" | "inactive" | "probation" | "onboarding"

export type EmployeeListParams = {
  q?: string
  dept?: string
  status?: EmployeeStatusFilter
  sort?: SortColumn
  dir?: "asc" | "desc"
  page?: number
}

export type EmployeeRow = {
  id: string
  name: string
  position: string | null
  department: string | null
  role: string
  branch_id: string | null
  status: "active" | "inactive"
  contract_start: string | null
  probation_end: string | null
  visa_expiry: string | null
  displayStatus:
    | "active"
    | "inactive"
    | "probation"
    | "onboarding"
    | "pending_approval"
}

const ICT_OFFSET_MS = 7 * 60 * 60 * 1000

export function ictToday(): string {
  return new Date(Date.now() + ICT_OFFSET_MS).toISOString().slice(0, 10)
}

export function normalizeParams(raw: {
  [key: string]: string | string[] | undefined
}): Required<EmployeeListParams> {
  const get = (k: string) => (typeof raw[k] === "string" ? (raw[k] as string) : "")
  const sort = SORT_COLUMNS.includes(get("sort") as SortColumn)
    ? (get("sort") as SortColumn)
    : "name"
  const status = (["active", "inactive", "probation", "onboarding"] as const).includes(
    get("status") as "active"
  )
    ? (get("status") as EmployeeStatusFilter)
    : "all"
  const page = Math.max(1, Number.parseInt(get("page"), 10) || 1)
  return {
    q: get("q"),
    dept: get("dept"),
    status,
    sort,
    dir: get("dir") === "desc" ? "desc" : "asc",
    page,
  }
}

function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, (c) => `\\${c}`)
}

export async function getEmployees(params: Required<EmployeeListParams>) {
  const supabase = await createClient()
  const today = ictToday()

  let query = supabase
    .from("hr_employees")
    .select(
      "id, name, position, department, role, branch_id, status, contract_start, probation_end, visa_expiry",
      { count: "exact" }
    )

  if (params.q) {
    query = query.ilike("name", `%${escapeLike(params.q)}%`)
  }
  if (params.dept) {
    query = query.eq("department", params.dept)
  }
  if (params.status === "active" || params.status === "inactive") {
    query = query.eq("status", params.status)
  }
  if (params.status === "probation") {
    query = query.eq("status", "active").gte("probation_end", today)
  }
  if (params.status === "onboarding") {
    query = query.or(
      "and(status.eq.inactive,role.eq.employee),and(status.eq.active,role.eq.employee,branch_id.is.null)"
    )
  }

  query = query
    .order(params.sort, { ascending: params.dir === "asc" })
    .range((params.page - 1) * PAGE_SIZE, params.page * PAGE_SIZE - 1)

  const { data, count, error } = await query
  if (error) {
    throw error
  }

  const employees: EmployeeRow[] = (data ?? []).map((row) => {
    const pendingApproval =
      row.status === "inactive" && row.role === "employee"
    const needsBranch =
      row.status === "active" &&
      row.role === "employee" &&
      row.branch_id === null
    let displayStatus: EmployeeRow["displayStatus"] = row.status
    if (pendingApproval) displayStatus = "pending_approval"
    else if (needsBranch) displayStatus = "onboarding"
    else if (
      row.status === "active" &&
      row.probation_end !== null &&
      row.probation_end >= today
    ) {
      displayStatus = "probation"
    }
    return { ...row, displayStatus }
  })

  return { employees, total: count ?? 0, today }
}

/** Self-registrations awaiting HR approval + active employees missing branch */
export async function getOnboardingPendingCount(): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("hr_employees")
    .select("id", { count: "exact", head: true })
    .or(
      "and(status.eq.inactive,role.eq.employee),and(status.eq.active,role.eq.employee,branch_id.is.null)"
    )
  if (error) throw error
  return count ?? 0
}

export async function getDepartments(): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("hr_employees")
    .select("department")
    .not("department", "is", null)

  if (error) {
    throw error
  }
  return [...new Set((data ?? []).map((r) => r.department as string))].sort()
}
