import { NextResponse } from "next/server"

import { getAdminClient } from "@/lib/auth/admin-client"

/** Public branch list for self-registration (id + name only). */
export async function GET() {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from("hr_branches")
    .select("id, name, code")
    .order("name")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ branches: data ?? [] })
}
