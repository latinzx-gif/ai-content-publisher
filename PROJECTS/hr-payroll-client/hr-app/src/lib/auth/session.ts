import { createClient } from "@/lib/supabase/server"

export type Employee = {
  id: string
  line_user_id: string | null
  name: string
  position: string | null
  department: string | null
  role: "employee" | "hr" | "admin"
  status: "active" | "inactive"
}

// Reads the caller's own hr_employees row through their session client —
// RLS self-select via the line_user_id JWT claim. Returns null when not
// logged in or the auth user has no matching employee row.
export async function getCurrentEmployee(): Promise<Employee | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return null
  }

  const lineUserId = user.app_metadata?.line_user_id
  if (typeof lineUserId !== "string" || !lineUserId) {
    return null
  }

  const { data } = await supabase
    .from("hr_employees")
    .select("id, line_user_id, name, position, department, role, status")
    .eq("line_user_id", lineUserId)
    .maybeSingle()

  return (data as Employee | null) ?? null
}
