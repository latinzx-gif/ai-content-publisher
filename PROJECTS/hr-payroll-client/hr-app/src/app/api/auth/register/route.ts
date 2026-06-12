import { NextResponse, type NextRequest } from "next/server"

import { getAdminClient } from "@/lib/auth/admin-client"
import { mintLineUserSession } from "@/lib/auth/line-session"
import { adminLoginPath } from "@/lib/auth/roles"
import {
  LINE_REGISTER_COOKIE,
  LINE_REGISTER_COOKIE_OPTS,
} from "@/lib/auth/register-cookie"

type RegisterBody = {
  name?: string
  department?: string | null
  position?: string | null
}

export async function POST(request: NextRequest) {
  const lineUserId = request.cookies.get(LINE_REGISTER_COOKIE)?.value
  if (!lineUserId || !lineUserId.startsWith("U")) {
    return NextResponse.json(
      { error: "registration session expired — login with LINE again" },
      { status: 401 }
    )
  }

  let body: RegisterBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 })
  }

  const name = body.name?.trim()
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 })
  }

  const admin = getAdminClient()

  const { data: existing } = await admin
    .from("hr_employees")
    .select("id, role, status")
    .eq("line_user_id", lineUserId)
    .maybeSingle()

  let role: Parameters<typeof adminLoginPath>[0] = "employee"

  if (existing?.status === "active") {
    role = existing.role as Parameters<typeof adminLoginPath>[0]
  } else if (!existing) {
    const { error: insertError } = await admin.from("hr_employees").insert({
      line_user_id: lineUserId,
      name,
      department: body.department?.trim() || null,
      position: body.position?.trim() || null,
      role: "employee",
      status: "active",
    })

    if (insertError) {
      const msg =
        insertError.code === "23505"
          ? "บัญชี LINE นี้ลงทะเบียนแล้ว"
          : insertError.message
      return NextResponse.json({ error: msg }, { status: 500 })
    }
  } else {
    return NextResponse.json(
      { error: "บัญชีนี้ถูกปิดใช้งาน กรุณาติดต่อ HR" },
      { status: 403 }
    )
  }

  const redirect = adminLoginPath(role)
  const response = NextResponse.json({ redirect })

  try {
    await mintLineUserSession(request, response, lineUserId)
  } catch (error) {
    console.error("register session mint failed", error)
    return NextResponse.json(
      { error: "ลงทะเบียนแล้ว แต่เข้าระบบไม่สำเร็จ — ลอง login LINE อีกครั้ง" },
      { status: 500 }
    )
  }

  response.cookies.set(LINE_REGISTER_COOKIE, "", {
    ...LINE_REGISTER_COOKIE_OPTS,
    maxAge: 0,
  })
  return response
}
