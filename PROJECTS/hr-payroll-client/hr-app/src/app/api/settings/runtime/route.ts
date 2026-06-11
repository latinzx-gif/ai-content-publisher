import { NextResponse, type NextRequest } from "next/server"

import { getCurrentEmployee } from "@/lib/auth/session"
import { clearRuntimeConfigCache } from "@/lib/runtime-config"
import { createClient } from "@/lib/supabase/server"

const ALLOWED_KEYS = new Set([
  "work_start_hour",
  "work_start_minute",
  "hr_line_group_id",
])

export async function GET() {
  const caller = await getCurrentEmployee()
  if (!caller || (caller.role !== "hr" && caller.role !== "admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.from("hr_runtime_config").select("key, value, updated_at")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ rows: data ?? [] })
}

export async function PATCH(request: NextRequest) {
  const caller = await getCurrentEmployee()
  if (!caller || (caller.role !== "hr" && caller.role !== "admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  let body: Record<string, string>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 })
  }

  const entries = Object.entries(body).filter(([k]) => ALLOWED_KEYS.has(k))
  if (entries.length === 0) {
    return NextResponse.json({ error: "no valid keys" }, { status: 400 })
  }

  const supabase = await createClient()
  for (const [key, value] of entries) {
    const { error } = await supabase
      .from("hr_runtime_config")
      .upsert({ key, value: String(value).trim() })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  clearRuntimeConfigCache()
  return NextResponse.json({ ok: true, updated: entries.map(([k]) => k) })
}
