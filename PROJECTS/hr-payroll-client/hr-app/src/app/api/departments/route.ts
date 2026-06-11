import { NextResponse, type NextRequest } from "next/server"

import { getCurrentEmployee } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const caller = await getCurrentEmployee()
  if (!caller || (caller.role !== "hr" && caller.role !== "admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  let body: { name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 })
  }

  const name = typeof body.name === "string" ? body.name.trim() : ""
  if (name.length < 2) {
    return NextResponse.json({ error: "invalid name" }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("hr_departments")
    .insert({ name })
    .select("id, name")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
