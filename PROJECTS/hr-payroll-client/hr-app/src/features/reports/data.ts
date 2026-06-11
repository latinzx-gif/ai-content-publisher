import { createClient } from "@/lib/supabase/server"

export async function getAttendanceReport(days = 30) {
  const supabase = await createClient()
  const since = new Date(Date.now() - days * 86_400_000).toISOString()

  const { data, error } = await supabase
    .from("hr_attendance")
    .select("check_in_at, is_late, work_hours, hr_employees(name)")
    .gte("check_in_at", since)
    .order("check_in_at", { ascending: false })
    .limit(200)

  if (error) throw error
  return data ?? []
}

export async function getLeaveReportSummary() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("hr_leaves")
    .select("status, type, start_date, end_date, hr_employees(name)")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) throw error
  return data ?? []
}

export async function getOvertimeReportSummary() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("hr_overtime_requests")
    .select("work_date, start_time, end_time, status, hr_employees(name)")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) throw error
  return data ?? []
}
